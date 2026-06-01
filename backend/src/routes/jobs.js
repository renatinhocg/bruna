import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import slugify from '../utils/slugify.js';
import { matchesCompanyPortalSlug } from '../utils/companyPortalSlug.js';

const router = express.Router();
const prisma = new PrismaClient();

// Buscar vaga publica por empresa + slug amigavel
router.get('/public/company/:companySlug/:jobSlug', async (req, res) => {
    const { companySlug, jobSlug } = req.params;

    try {
        const jobs = await prisma.job.findMany({
            where: { status: 'OPEN' },
            include: {
                company: true,
                location: true,
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { created_at: 'desc' },
        });

        const job = jobs.find((item) => {
            const matchesCompany = matchesCompanyPortalSlug(item.company?.name, companySlug);
            const publicSlug = item.slug || `${slugify(item.title)}-${item.id}`;
            return matchesCompany && publicSlug === jobSlug;
        });

        if (!job) {
            return res.status(404).json({ error: 'Vaga nao encontrada' });
        }

        res.json({
            ...job,
            public_slug: job.slug || `${slugify(job.title)}-${job.id}`,
            company: {
                ...job.company,
                portal_slug: slugify(job.company?.name)
            }
        });
    } catch (error) {
        console.error('Erro ao buscar vaga publica:', error);
        res.status(500).json({ error: 'Erro ao buscar vaga publica' });
    }
});

// Listar todas as vagas (Publico/Admin)
router.get('/', async (req, res) => {
    const { status, company_id } = req.query;

    try {
        const whereClause = {};
        if (status) whereClause.status = status;
        if (company_id) whereClause.company_id = parseInt(company_id);

        const jobs = await prisma.job.findMany({
            where: whereClause,
            include: {
                company: true,
                location: true,
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
                location: true,
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
            return res.status(404).json({ error: 'Vaga nao encontrada' });
        }

        res.json(job);
    } catch (error) {
        console.error('Erro ao buscar vaga:', error);
        res.status(500).json({ error: 'Erro ao buscar vaga' });
    }
});

// Criar nova vaga
router.post('/', async (req, res) => {
    const {
        title, description, requirements, benefits,
        salary_min, salary_max, type, location_id, modality,
        company_id, status, start_date, end_date,
        selection_stages, accessibility_note
    } = req.body;

    try {
        const job = await prisma.job.create({
            data: {
                title,
                description,
                requirements,
                benefits,
                salary_min: salary_min ? parseFloat(salary_min) : null,
                salary_max: salary_max ? parseFloat(salary_max) : null,
                type: type || 'CLT',
                location_id: location_id ? parseInt(location_id) : null,
                modality: modality || 'REMOTE',
                company_id: parseInt(company_id),
                status: status || 'OPEN',
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null,
                selection_stages: selection_stages || [],
                accessibility_note,
                slug: slugify(title),
            },
            include: {
                company: true,
                location: true,
            }
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
    const {
        title, description, requirements, benefits,
        salary_min, salary_max, type, location_id, modality,
        company_id, status, start_date, end_date,
        selection_stages, accessibility_note
    } = req.body;

    try {
        const job = await prisma.job.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                requirements,
                benefits,
                salary_min: salary_min ? parseFloat(salary_min) : undefined,
                salary_max: salary_max ? parseFloat(salary_max) : undefined,
                type,
                location_id: location_id ? parseInt(location_id) : null,
                modality,
                company_id: company_id ? parseInt(company_id) : undefined,
                status,
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null,
                selection_stages,
                accessibility_note,
                ...(title ? { slug: slugify(title) } : {})
            },
            include: {
                company: true,
                location: true,
            }
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
        res.json({ message: 'Vaga excluida com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir vaga:', error);
        res.status(500).json({ error: 'Erro ao excluir vaga', details: error.message });
    }
});

export default router;
