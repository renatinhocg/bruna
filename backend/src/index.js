
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

import resultadosInteligenciasRoutes from './routes/resultados-inteligencias.js';
app.use('/api/resultados-inteligencias', resultadosInteligenciasRoutes);



import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import testesRoutes from './routes/testes.js';
import agendamentosRoutes from './routes/agendamentos.js';
import resultadosRoutes from './routes/resultados.js';
import usuariosRoutes from './routes/usuarios.js';
import categoriasRoutes from './routes/categorias.js';
import perguntasRoutes from './routes/perguntas.js';
import possibilidadesRoutes from './routes/possibilidades.js';
import configuracoesRoutes from './routes/configuracoes.js';
import testesInteligenciaRoutes from './routes/testes-inteligencia.js';

app.get('/', (req, res) => {
  res.send('API do Sistema de Coach de Carreiras rodando!');
});

app.use('/api/auth', authRoutes);
app.use('/api/arquivos', uploadRoutes);
app.use('/api/testes', testesRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/resultados', resultadosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/perguntas', perguntasRoutes);
app.use('/api/possibilidades', possibilidadesRoutes);
app.use('/api/configuracoes', configuracoesRoutes);

app.use('/api/testes-inteligencia', testesInteligenciaRoutes);

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
