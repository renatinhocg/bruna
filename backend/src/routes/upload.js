import express from 'express';
import multer from 'multer';
import s3 from '../config/s3.js';
import multerS3 from 'multer-s3';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../generated/prisma/client.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

// Upload geral (aceita qualquer tipo de arquivo)
// Permite controlar o tamanho máximo via variável de ambiente `MAX_UPLOAD_SIZE` (bytes).
const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE, 10) || (200 * 1024 * 1024); // 200MB por padrão
const uploadGeral = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_SIZE,
  }
});

// Log para diagnóstico: confirmar valor carregado em runtime
console.log('MAX_UPLOAD_SIZE (bytes):', MAX_UPLOAD_SIZE);

// Storage que faz streaming direto para S3 (evita buffering em memória)
const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const filename = `presentations/${Date.now()}_${file.originalname}`;
      cb(null, filename);
    }
  }),
  limits: { fileSize: MAX_UPLOAD_SIZE }
});

// Storage local para apresentações (salva em ./uploads/presentations)
const presentationsDir = path.join(process.cwd(), 'uploads', 'presentations');
const uploadLocal = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      try {
        fs.mkdirSync(presentationsDir, { recursive: true });
        cb(null, presentationsDir);
      } catch (err) {
        cb(err);
      }
    },
    filename: function (req, file, cb) {
      const filename = `${Date.now()}_${file.originalname}`;
      cb(null, filename);
    }
  }),
  limits: { fileSize: MAX_UPLOAD_SIZE }
});

// Listar apresentações salvas localmente
router.get('/presentations', async (req, res) => {
  try {
    const dir = path.join(process.cwd(), 'uploads', 'presentations');
    if (!fs.existsSync(dir)) return res.json([]);
    const files = fs.readdirSync(dir).filter(f => f && f[0] !== '.');
    const items = files.map(f => ({
      filename: f,
      url: `${req.protocol}://${req.get('host')}/uploads/presentations/${encodeURIComponent(f)}`
    }));
    res.json(items);
  } catch (err) {
    console.error('Erro ao listar apresentações:', err);
    res.status(500).json({ erro: 'Erro ao listar apresentações' });
  }
});

// Upload apenas de imagens
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

// Upload geral de arquivos (autenticado)
router.post('/upload', authenticateToken, uploadGeral.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ erro: 'Arquivo não enviado' });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `uploads/${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const data = await s3.upload(params).promise();
    res.json({ url: data.Location });
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).json({ erro: 'Erro ao enviar arquivo', detalhes: err.message });
  }
});

// Upload de arquivo antigo (sem autenticação - deprecated)
router.post('/upload-legacy', uploadGeral.single('arquivo'), async (req, res) => {
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

// Upload específico de PPTX/PPSX para visualização (local storage)
// Observação: para produção em múltiplos servidores / escalonamento, prefira S3.
router.post('/upload-pptx', uploadLocal.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ erro: 'Arquivo não enviado' });

    // Montar URL pública baseada no host da requisição
    const relativePath = `uploads/presentations/${file.filename}`;
    const baseUrl = req.protocol + '://' + req.get('host');
    const location = `${baseUrl}/${relativePath}`;

    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(location)}`;

    res.json({ url: location, officeViewerUrl });
  } catch (err) {
    console.error('Erro no upload de PPTX (local):', err);
    res.status(500).json({ erro: 'Erro ao enviar arquivo PPTX', detalhes: err.message });
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

// Upload de imagem para link (sem autenticação para facilitar)
router.post('/link-image', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ erro: 'Arquivo de imagem não enviado' });
    }

    // Upload para S3 (sem ACL, bucket deve ter política pública configurada)
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `links/${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const data = await s3.upload(params).promise();

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      url: data.Location
    });

  } catch (error) {
    console.error('Erro ao fazer upload da imagem do link:', error);
    res.status(500).json({ erro: 'Erro ao fazer upload da imagem' });
  }
});

// Upload de currículo (PDF)
router.post('/resume', uploadGeral.single('resume'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ erro: 'Arquivo de currículo não enviado' });
    }

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ erro: 'Apenas arquivos PDF são aceitos' });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `resumes/${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const data = await s3.upload(params).promise();
    res.json({ url: data.Location });
  } catch (err) {
    console.error('Erro no upload de currículo:', err);
    res.status(500).json({ erro: 'Erro ao enviar currículo', detalhes: err.message });
  }
});

export default router;

// Handler para transformar erros do multer em JSON (ex.: File too large)
router.use((err, req, res, next) => {
  if (err && err instanceof multer.MulterError) {
    console.error('MulterError:', err);
    return res.status(400).json({ erro: err.message });
  }
  if (err) {
    console.error('Upload route error:', err);
  }
  next(err);
});
