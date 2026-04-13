import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
// Importaremos o middleware de autenticacao logo quando existir o sistema de login pronto no Front
// import authMiddleware from '../middleware/auth.js'; 

const router = express.Router();
const prisma = new PrismaClient();

// Listar todas as candidaturas (Admin)
router.get('/', async (req, res) => {
    const { job_id, status } = req.query;

    try {
        let whereClause = {};
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

// Candidatar-se a uma vaga (Candidato)
router.post('/apply', async (req, res) => {
    // Isso requer que o user_id seja mandado no body ou extraído do token (req.user)
    const { job_id, user_id, cover_letter, resume_url } = req.body;

    try {
        // Verificar se já existe candidatura
        const existing = await prisma.jobApplication.findUnique({
            where: {
                user_id_job_id: {
                    user_id: parseInt(user_id),
                    job_id: parseInt(job_id)
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Você já se candidatou a esta vaga' });
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

        // Se a candidatura enviar um curriculo novo, atualizar o perfil do usuario
        if (resume_url) {
            await prisma.usuario.update({
                where: { id: parseInt(user_id) },
                data: { curriculo_url: resume_url, role: 'CANDIDATE' }
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
    const { status } = req.body; // APPLIED, IN_REVIEW, INTERVIEW, HIRED, REJECTED

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
