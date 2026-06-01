import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';

const router = express.Router();
const prisma = new PrismaClient();

// Listar locais por empresa
router.get('/company/:company_id', async (req, res) => {
    const { company_id } = req.params;

    try {
        const locations = await prisma.location.findMany({
            where: { company_id: parseInt(company_id) },
            orderBy: { created_at: 'desc' },
        });
        res.json(locations);
    } catch (error) {
        console.error('Erro ao listar locais:', error);
        res.status(500).json({ error: 'Erro ao buscar locais' });
    }
});

// Listar todos os locais
router.get('/', async (req, res) => {
    try {
        const locations = await prisma.location.findMany({
            include: { company: true },
            orderBy: [
                { company_id: 'asc' },
                { created_at: 'asc' }
            ],
        });
        res.json(locations);
    } catch (error) {
        console.error('Erro ao listar locais:', error);
        res.status(500).json({ error: 'Erro ao buscar locais' });
    }
});

// Criar novo local
router.post('/', async (req, res) => {
    const { company_id, name, address, city, state, postal_code } = req.body;

    try {
        const location = await prisma.location.create({
            data: {
                company_id: parseInt(company_id),
                name,
                address,
                city,
                state,
                postal_code,
            },
            include: { company: true },
        });
        res.status(201).json(location);
    } catch (error) {
        console.error('Erro ao criar local:', error);
        res.status(500).json({ error: 'Erro ao criar local', details: error.message });
    }
});

// Atualizar local
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, address, city, state, postal_code } = req.body;

    try {
        const location = await prisma.location.update({
            where: { id: parseInt(id) },
            data: { name, address, city, state, postal_code },
            include: { company: true },
        });
        res.json(location);
    } catch (error) {
        console.error('Erro ao atualizar local:', error);
        res.status(500).json({ error: 'Erro ao atualizar local', details: error.message });
    }
});

// Deletar local
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.location.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Local excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar local:', error);
        res.status(500).json({ error: 'Erro ao deletar local', details: error.message });
    }
});

export default router;
