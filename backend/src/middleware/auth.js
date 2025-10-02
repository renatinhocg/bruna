import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

// Middleware de autenticação
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      erro: 'Token de acesso requerido' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        erro: 'Token inválido' 
      });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar se é admin
export const isAdmin = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id }
    });

    if (!usuario || usuario.tipo !== 'admin') {
      return res.status(403).json({ 
        success: false,
        erro: 'Acesso negado. Apenas administradores.' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware isAdmin:', error);
    res.status(500).json({ 
      success: false,
      erro: 'Erro interno do servidor' 
    });
  }
};
