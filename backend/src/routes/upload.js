import express from 'express';
import multer from 'multer';
import s3 from '../config/s3.js';
import { PrismaClient } from '../generated/prisma/client.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  }
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

router.post('/upload', upload.single('arquivo'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ erro: 'Arquivo não enviado' });
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  try {
    const data = await s3.upload(params).promise();
    res.json({ url: data.Location });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao enviar arquivo' });
  }
});

// Upload de avatar para usuário
router.post('/avatar/:userId', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ erro: 'Arquivo de avatar não enviado' });
    }

    // Verificar se usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Upload para S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `avatars/${userId}_${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const data = await s3.upload(params).promise();
    
    // Atualizar URL do avatar no banco
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: parseInt(userId) },
      data: { avatar_url: data.Location },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        status: true,
        avatar_url: true,
        created_at: true,
        updated_at: true
      }
    });

    res.json({
      message: 'Avatar atualizado com sucesso',
      usuario: usuarioAtualizado,
      avatar_url: data.Location
    });

  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

export default router;
