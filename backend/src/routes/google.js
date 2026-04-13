import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production.google' : '.env.google' });

const router = express.Router();
const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 1. Iniciar login Google (precisa estar autenticado)
router.get('/login', authenticateToken, (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'profile',
    'email'
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'select_account'
  });
  console.log('GOOGLE REDIRECT URI SENDO USADA:', process.env.GOOGLE_REDIRECT_URI);
  console.log('URL DE LOGIN GOOGLE:', url);
  res.json({ url });
});

// 2. Callback do Google
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ success: false, erro: 'Código não informado' });
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // Buscar e-mail do usuário Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userinfo = await oauth2.userinfo.get();
    const email = userinfo.data.email;
    if (!email) return res.status(400).json({ success: false, erro: 'Não foi possível obter o e-mail da conta Google.' });
    // Retornar tokens e email para o frontend
    res.json({
      success: true,
      email,
      tokens
    });
  } catch (err) {
    res.status(500).json({ success: false, erro: 'Erro ao autenticar com Google: ' + err.message });
  }
});

// 3. Buscar eventos do Google Calendar do usuário autenticado
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.user.id } });
    if (!usuario || !usuario.google_access_token) {
      return res.status(401).json({ error: 'Google Agenda não conectada para este usuário.' });
    }
    oauth2Client.setCredentials({
      access_token: usuario.google_access_token,
      refresh_token: usuario.google_refresh_token
    });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime'
    });
    res.json(events.data.items);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar eventos do Google Calendar: ' + err.message });
  }
});

export default router;
