import express from 'express';
import cors from 'cors';
import projetosRoutes from './routes/projetos.js';
import googleAccountsRouter from './routes/google-accounts.js';
import linksRoutes from './routes/links.js';

const app = express();

// Configuração de CORS para produção e desenvolvimento
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',  // Admin Next.js local
      'http://localhost:5173',
      'http://localhost:5174',
      'https://impulsobm.com.br',
      'https://www.impulsobm.com.br',
      /\.vercel\.app$/,  // Qualquer subdomínio do Vercel
      /\.up\.railway\.app$/,  // Qualquer subdomínio do Railway
      /\.hostinger\.com\.br$/,  // Hostinger Brasil
      /\.hostinger\.com$/,  // Hostinger Internacional
      /\.hostingersite\.com$/,  // Hostinger site
      'https://bmconsultoria.site',  // Domínio principal
      'http://bmconsultoria.site',   // Domínio principal HTTP
      'https://www.bmconsultoria.site',  // Com www
      'http://www.bmconsultoria.site'    // Com www HTTP
    ];

    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    // Verificar se a origin está na lista ou match regex
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ CORS bloqueado para:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};


app.use(cors(corsOptions));
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static('uploads'));

app.use('/api/projetos', projetosRoutes);

import resultadosInteligenciasRoutes from './routes/resultados-inteligencias.js';
app.use('/api/resultados-inteligencias', resultadosInteligenciasRoutes);



import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import testesRoutes from './routes/testes.js';
import agendamentosRoutes from './routes/agendamentos.js';
import sessoesRoutes from './routes/sessoes.js';
import resultadosRoutes from './routes/resultados.js';
import usuariosRoutes from './routes/usuarios.js';
import categoriasRoutes from './routes/categorias.js';
import perguntasRoutes from './routes/perguntas.js';
import possibilidadesRoutes from './routes/possibilidades.js';
import configuracoesRoutes from './routes/configuracoes.js';
import testesInteligenciaRoutes from './routes/testes-inteligencia.js';
import testesDominanciaRoutes from './routes/testes-dominancia.js';
import testesDISCRoutes from './routes/testes-disc.js';
import contatosRoutes from './routes/contatos.js';
import dashboardRoutes from './routes/dashboard.js';
import kanbanRoutes from './routes/kanban.js';
import kanbanManutencaoRoutes from './routes/kanban-manutencao.js';
import tasksRoutes from './routes/tasks.js';
import templatesRoutes from './routes/templates.js';
import tarefasRoutes from './routes/tarefas.js';
import testesDisponiveisRoutes from './routes/testes-disponiveis.js';

app.get('/', (req, res) => {
  res.send('API do Sistema de Coach de Carreiras rodando!');
});

app.use('/api/auth', authRoutes);
app.use('/api/arquivos', uploadRoutes);
app.use('/api/testes', testesRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/sessoes', sessoesRoutes);
app.use('/api/resultados', resultadosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/perguntas', perguntasRoutes);
app.use('/api/possibilidades', possibilidadesRoutes);
app.use('/api/configuracoes', configuracoesRoutes);
app.use('/api/contatos', contatosRoutes);

app.use('/api/testes-inteligencia', testesInteligenciaRoutes);
app.use('/api/testes-dominancia', testesDominanciaRoutes);
app.use('/api/testes-disc', testesDISCRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/tarefas', tarefasRoutes);
app.use('/api/testes-disponiveis', testesDisponiveisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/kanban', kanbanManutencaoRoutes);


import googleRoutes from './routes/google.js';
app.use('/api/google', googleRoutes);
app.use('/api/google', googleAccountsRouter);

import relatoriosRoutes from './routes/relatorios.js';
app.use('/api/relatorios', relatoriosRoutes);

app.use('/api/links', linksRoutes);

import produtosRoutes from './routes/produtos.js';
import comprasRoutes from './routes/compras.js';
import companiesRoutes from './routes/companies.js';
import jobsRoutes from './routes/jobs.js';
import jobApplicationsRoutes from './routes/job-applications.js';

app.use('/api/produtos', produtosRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/job-applications', jobApplicationsRoutes);

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});