import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';

const router = express.Router();
const prisma = new PrismaClient();

// Listar todas as vagas (Público/Admin)
router.get('/', async (req, res) => {
    const { status, company_id } = req.query;

    try {
        let whereClause = {};
        if (status) whereClause.status = status;
        if (company_id) whereClause.company_id = parseInt(company_id);

        const jobs = await prisma.job.findMany({
            where: whereClause,
            include: {
                company: true,
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { created_at: 'desc' },
        });
        res.json(jobs);
    } catch (error) {
        console.error('Erro ao listar vagas:', error);
        res.status(500).json({ error: 'Erro ao buscar vagas' });
    }
});

// Buscar vaga por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const job = await prisma.job.findUnique({
            where: { id: parseInt(id) },
            include: {
                company: true,
                applications: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                nome: true,
                                email: true,
                                telefone: true,
                                avatar_url: true,
                                curriculo_url: true,
                                linkedin_url: true
                            }
                        }
                    }
                }
            }
        });

        if (!job) {
            return res.status(404).json({ error: 'Vaga não encontrada' });
        }

        res.json(job);
    } catch (error) {
        console.error('Erro ao buscar vaga:', error);
        res.status(500).json({ error: 'Erro ao buscar vaga' });
    }
});

// Criar nova vaga
router.post('/', async (req, res) => {
    const { title, description, requirements, benefits, salary, type, location, modality, company_id, status } = req.body;

    try {
        const job = await prisma.job.create({
            data: {
                title,
                description,
                requirements,
                benefits,
                salary: salary ? parseFloat(salary) : null,
                type: type || 'CLT',
                location,
                modality: modality || 'REMOTE',
                company_id: parseInt(company_id),
                status: status || 'OPEN',
            },
        });
        res.status(201).json(job);
    } catch (error) {
        console.error('Erro ao criar vaga:', error);
        res.status(500).json({ error: 'Erro ao criar vaga', details: error.message });
    }
});

// Atualizar vaga
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, requirements, benefits, salary, type, location, modality, company_id, status } = req.body;

    try {
        const job = await prisma.job.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                requirements,
                benefits,
                salary: salary ? parseFloat(salary) : null,
                type,
                location,
                modality,
                company_id: company_id ? parseInt(company_id) : undefined,
                status,
            },
        });
        res.json(job);
    } catch (error) {
        console.error('Erro ao atualizar vaga:', error);
        res.status(500).json({ error: 'Erro ao atualizar vaga', details: error.message });
    }
});

// Excluir vaga
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.job.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Vaga excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir vaga:', error);
        res.status(500).json({ error: 'Erro ao excluir vaga', details: error.message });
    }
});

export default router;
