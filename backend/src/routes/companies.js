import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';

const router = express.Router();
const prisma = new PrismaClient();

// Listar todas as empresas
router.get('/', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(companies);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

// Buscar empresa por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
      include: {
        jobs: true
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json(company);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
});

// Criar nova empresa
router.post('/', async (req, res) => {
  const { name, cnpj, description, logo_url, website_url, status } = req.body;

  try {
    const company = await prisma.company.create({
      data: {
        name,
        cnpj,
        description,
        logo_url,
        website_url,
        status: status || 'ACTIVE',
      },
    });
    res.status(201).json(company);
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro ao criar empresa', details: error.message });
  }
});

// Atualizar empresa
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, cnpj, description, logo_url, website_url, status } = req.body;

  try {
    const company = await prisma.company.update({
      where: { id: parseInt(id) },
      data: {
        name,
        cnpj,
        description,
        logo_url,
        website_url,
        status,
      },
    });
    res.json(company);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa', details: error.message });
  }
});

// Excluir empresa
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.company.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Empresa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    res.status(500).json({ error: 'Erro ao excluir empresa', details: error.message });
  }
});

export default router;
