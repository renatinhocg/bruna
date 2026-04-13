import express from 'express';
import { google } from 'googleapis';
import { PrismaClient } from '../generated/prisma/client.js';
import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production.google' : '.env.google' });
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Conectar conta Google ao usuário autenticado
router.post('/accounts/connect', authenticateToken, async (req, res) => {
  const { email, tokens } = req.body;
  if (!email || !tokens) return res.status(400).json({ success: false, erro: 'Dados incompletos.' });
  try {
    // Verifica se já existe conta Google para esse usuário
    const existing = await prisma.googleAccount.findUnique({
      where: { email_userId: { email, userId: req.user.id } }
    });
    if (existing) {
      // Atualiza tokens
      const updateData = {
        access_token: tokens.access_token,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        is_active: true
      };
      if (tokens.refresh_token) updateData.refresh_token = tokens.refresh_token;
      await prisma.googleAccount.update({
        where: { id: existing.id },
        data: updateData
      });
    } else {
      // Cria nova conta Google para esse usuário
      await prisma.googleAccount.create({
        data: {
          email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || '',
          token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          userId: req.user.id,
          is_active: true
        }
      });
    }
    res.json({ success: true, message: 'Conta Google conectada com sucesso!' });
  } catch (err) {
    res.status(500).json({ success: false, erro: 'Erro ao conectar conta Google: ' + err.message });
  }
});

// Listar contas Google sincronizadas
router.get('/accounts', authenticateToken, async (req, res) => {
  const accounts = await prisma.googleAccount.findMany({
    where: { userId: req.user.id },
    select: { id: true, email: true, is_active: true }
  });
  res.json(accounts);
});

// Desincronizar conta Google
router.delete('/accounts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  await prisma.googleAccount.delete({ where: { id: Number(id), userId: req.user.id } });
  res.json({ success: true });
});

// Buscar eventos de uma conta Google específica
router.get('/accounts/:id/events', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { timeMin, timeMax } = req.query;
  const account = await prisma.googleAccount.findUnique({ where: { id: Number(id), userId: req.user.id } });
  if (!account) {
    console.log('Conta Google não encontrada para o usuário', req.user.id, 'id:', id);
    return res.status(404).json({ error: 'Conta não encontrada' });
  }
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token
  });
  // Tenta renovar o access_token se necessário
  if (account.refresh_token) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      // Atualiza o access_token no banco se mudou
      if (credentials.access_token && credentials.access_token !== account.access_token) {
        await prisma.googleAccount.update({
          where: { id: account.id },
          data: { access_token: credentials.access_token }
        });
      }
    } catch (err) {
      console.error('Erro ao renovar access_token:', err.message);
    }
  }
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  try {
    const params = {
      calendarId: 'primary',
      singleEvents: true,
      orderBy: 'startTime',
    };
    if (timeMin) params.timeMin = timeMin;
    else params.timeMin = (new Date()).toISOString();
    if (timeMax) params.timeMax = timeMax;
    // Não limitar maxResults para permitir buscar todos do intervalo
    const events = await calendar.events.list(params);
    console.log('Eventos Google retornados para userId', req.user.id, 'conta', account.email, ':', events.data.items.length);
    res.json(events.data.items);
  } catch (err) {
    console.error('Erro ao buscar eventos do Google Calendar:', err.message);
    res.status(500).json({ error: 'Erro ao buscar eventos do Google Calendar: ' + err.message });
  }
});

export default router;
