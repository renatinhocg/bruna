import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// Listar todas as candidaturas (Admin)
router.get('/', async (req, res) => {
    const { job_id, status } = req.query;

    try {
        const whereClause = {};
        if (job_id) whereClause.job_id = parseInt(job_id);
        if (status) whereClause.status = status;

        const applications = await prisma.jobApplication.findMany({
            where: whereClause,
            include: {
                job: { select: { title: true, company: { select: { name: true } } } },
                user: { select: { nome: true, email: true, telefone: true, curriculo_url: true } }
            },
            orderBy: { applied_at: 'desc' },
        });
        res.json(applications);
    } catch (error) {
        console.error('Erro ao listar candidaturas:', error);
        res.status(500).json({ error: 'Erro ao buscar candidaturas' });
    }
});

// Candidatura publica sem login
router.post('/public-apply', async (req, res) => {
    const {
        job_id,
        nome,
        email,
        telefone,
        linkedin_url,
        cover_letter,
        resume_url
    } = req.body;

    if (!job_id || !nome || !email || !resume_url) {
        return res.status(400).json({ error: 'Campos obrigatorios: job_id, nome, email e resume_url' });
    }

    try {
        const normalizedEmail = String(email).trim().toLowerCase();
        const now = new Date();

        const job = await prisma.job.findUnique({
            where: { id: parseInt(job_id) }
        });

        if (!job || job.status !== 'OPEN') {
            return res.status(404).json({ error: 'Vaga nao encontrada ou indisponivel' });
        }

        let user = await prisma.usuario.findUnique({
            where: { email: normalizedEmail }
        });

        if (!user) {
            const senhaHash = await bcrypt.hash(randomUUID(), 10);
            user = await prisma.usuario.create({
                data: {
                    nome,
                    email: normalizedEmail,
                    telefone,
                    linkedin_url,
                    curriculo_url: resume_url,
                    senha_hash: senhaHash,
                    status: 'ativo',
                    tipo: 'candidato',
                    role: 'CANDIDATE',
                    updated_at: now
                }
            });
        } else {
            user = await prisma.usuario.update({
                where: { id: user.id },
                data: {
                    nome: nome || user.nome,
                    telefone: telefone || user.telefone,
                    linkedin_url: linkedin_url || user.linkedin_url,
                    curriculo_url: resume_url || user.curriculo_url,
                    role: user.role === 'ADMIN' ? user.role : 'CANDIDATE',
                    updated_at: now
                }
            });
        }

        const existing = await prisma.jobApplication.findUnique({
            where: {
                user_id_job_id: {
                    user_id: user.id,
                    job_id: parseInt(job_id)
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Voce ja se candidatou a esta vaga' });
        }

        const application = await prisma.jobApplication.create({
            data: {
                user_id: user.id,
                job_id: parseInt(job_id),
                cover_letter,
                resume_url,
                status: 'APPLIED'
            },
        });

        res.status(201).json({
            success: true,
            application,
            candidate: {
                id: user.id,
                nome: user.nome,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erro ao enviar candidatura publica:', error);
        res.status(500).json({ error: 'Erro ao enviar candidatura publica', details: error.message });
    }
});

// Candidatar-se a uma vaga (Candidato autenticado)
router.post('/apply', async (req, res) => {
    const { job_id, user_id, cover_letter, resume_url } = req.body;

    try {
        const existing = await prisma.jobApplication.findUnique({
            where: {
                user_id_job_id: {
                    user_id: parseInt(user_id),
                    job_id: parseInt(job_id)
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Voce ja se candidatou a esta vaga' });
        }

        const application = await prisma.jobApplication.create({
            data: {
                user_id: parseInt(user_id),
                job_id: parseInt(job_id),
                cover_letter,
                resume_url,
                status: 'APPLIED'
            },
        });

        if (resume_url) {
            await prisma.usuario.update({
                where: { id: parseInt(user_id) },
                data: { curriculo_url: resume_url, role: 'CANDIDATE', updated_at: new Date() }
            });
        }

        res.status(201).json(application);
    } catch (error) {
        console.error('Erro ao se candidatar:', error);
        res.status(500).json({ error: 'Erro ao enviar candidatura', details: error.message });
    }
});

// Atualizar status da candidatura (Admin/Recrutador)
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const application = await prisma.jobApplication.update({
            where: { id: parseInt(id) },
            data: { status },
        });
        res.json(application);
    } catch (error) {
        console.error('Erro ao atualizar status da candidatura:', error);
        res.status(500).json({ error: 'Erro ao atualizar status', details: error.message });
    }
});

export default router;
