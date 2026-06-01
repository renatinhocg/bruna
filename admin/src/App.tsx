import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import ptBR from 'antd/locale/pt_BR';

// Importação das Páginas do Painel
import DashboardPage from './app/dashboard/page';
import UsuariosPage from './app/usuarios/page';
import ContatosPage from './app/contatos/page';
import AgendamentosPage from './app/agendamentos/page';
import AgendamentosIdPage from './app/agendamentos/[id]/page';
import AgendamentosIdSessaoPage from './app/agendamentos/[id]/sessao/page';
import GoogleCallbackPage from './app/agendamentos/google-callback/page';
import LinksPage from './app/links/page';
import EmpresasPage from './app/empresas/page';
import EmpresasCadastroPage from './app/empresas/cadastro/page';
import EmpresaDetalhePage from './app/empresas/[id]/page';
import VagasPage from './app/vagas/page';
import VagasCadastroPage from './app/vagas/cadastro/page';
import BancoTalentosPage from './app/banco-talentos/page';

// Múltiplas Inteligências Pages
import MultiplasInteligenciasPage from './app/multiplas-inteligencias/page';
import MultiplasCategoriasPage from './app/multiplas-inteligencias/categorias/page';
import MultiplasConfiguracoesPage from './app/multiplas-inteligencias/configuracoes/page';
import MultiplasPerguntasPage from './app/multiplas-inteligencias/perguntas/page';
import MultiplasPossibilidadesPage from './app/multiplas-inteligencias/possibilidades/page';
import MultiplasRelatoriosPage from './app/multiplas-inteligencias/relatorios/page';
import MultiplasResultadosPage from './app/multiplas-inteligencias/resultados/page';
import MultiplasResultadosIdPage from './app/multiplas-inteligencias/resultados/[usuarioId]/page';
import MultiplasTestePage from './app/multiplas-inteligencias/teste/page';
import MultiplasTestesPendentesPage from './app/multiplas-inteligencias/testes-pendentes/page';
import MultiplasTestesPendentesIdPage from './app/multiplas-inteligencias/testes-pendentes/[id]/page';
import TesteMultiplasInteligenciasPage from './app/teste-multiplas-inteligencias/page';

// Dominância Cerebral Pages
import DominanciaResultadosPage from './app/dominancia-cerebral/resultados/page';
import DominanciaRelatorioIdPage from './app/dominancia-cerebral/relatorio/[id]/page';

// DISC Pages
import DiscPage from './app/disc/page';
import DiscIdPage from './app/disc/[id]/page';
import DiscQuestoesPage from './app/disc/questoes/page';
import DiscResultadosPage from './app/disc/resultados/page';
import DiscResultadosIdPage from './app/disc/resultados/[id]/page';

// Gestão e Operações Pages
import ProjectsPage from './app/projetos/page';
import PlannerPage from './app/planner/page';
import PlannerIdPage from './app/planner/[id]/page';
import KanbanPage from './app/kanban/page';
import VideochamadaRoomPage from './app/videochamada/[roomName]/page';

// Comercial e Sistema
import ProdutosPage from './app/produtos/page';
import VendasPage from './app/vendas/page';
import RelatoriosPage from './app/relatorios/page';
import ConfiguracoesPage from './app/configuracoes/page';
import MeuPerfilPage from './app/meu-perfil/page';
import LoginPage from './app/login/page';

export default function App() {
  return (
    <ConfigProvider locale={ptBR}>
      <AntdApp>
        <Router>
          <Suspense fallback={
            <div style={{
              display: 'flex',
              height: '100vh',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Inter, sans-serif'
            }}>
              Carregando...
            </div>
          }>
            <Routes>
              {/* Login sem layout */}
              <Route path="/login" element={<LoginPage />} />

              {/* Rotas administrativas autenticadas */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/contatos" element={<ContatosPage />} />
              
              {/* Agendamentos */}
              <Route path="/agendamentos" element={<AgendamentosPage />} />
              <Route path="/agendamentos/:id" element={<AgendamentosIdPage />} />
              <Route path="/agendamentos/:id/sessao" element={<AgendamentosIdSessaoPage />} />
              <Route path="/agendamentos/google-callback" element={<GoogleCallbackPage />} />

              <Route path="/links" element={<LinksPage />} />
              <Route path="/empresas" element={<EmpresasPage />} />
              <Route path="/empresas/cadastro" element={<EmpresasCadastroPage />} />
              <Route path="/empresas/:id" element={<EmpresaDetalhePage />} />
              <Route path="/vagas" element={<VagasPage />} />
              <Route path="/vagas/cadastro" element={<VagasCadastroPage />} />
              <Route path="/vagas/:nome" element={<VagasCadastroPage />} />
              <Route path="/banco-talentos" element={<BancoTalentosPage />} />

              {/* Múltiplas Inteligências */}
              <Route path="/multiplas-inteligencias" element={<MultiplasInteligenciasPage />} />
              <Route path="/multiplas-inteligencias/categorias" element={<MultiplasCategoriasPage />} />
              <Route path="/multiplas-inteligencias/configuracoes" element={<MultiplasConfiguracoesPage />} />
              <Route path="/multiplas-inteligencias/perguntas" element={<MultiplasPerguntasPage />} />
              <Route path="/multiplas-inteligencias/possibilidades" element={<MultiplasPossibilidadesPage />} />
              <Route path="/multiplas-inteligencias/relatorios" element={<MultiplasRelatoriosPage />} />
              <Route path="/multiplas-inteligencias/resultados" element={<MultiplasResultadosPage />} />
              <Route path="/multiplas-inteligencias/resultados/:usuarioId" element={<MultiplasResultadosIdPage />} />
              <Route path="/multiplas-inteligencias/teste" element={<MultiplasTestePage />} />
              <Route path="/multiplas-inteligencias/testes-pendentes" element={<MultiplasTestesPendentesPage />} />
              <Route path="/multiplas-inteligencias/testes-pendentes/:id" element={<MultiplasTestesPendentesIdPage />} />
              <Route path="/teste-multiplas-inteligencias" element={<TesteMultiplasInteligenciasPage />} />

              {/* Dominância Cerebral */}
              <Route path="/dominancia-cerebral/resultados" element={<DominanciaResultadosPage />} />
              <Route path="/dominancia-cerebral/relatorio/:id" element={<DominanciaRelatorioIdPage />} />

              {/* Testes DISC */}
              <Route path="/disc" element={<DiscPage />} />
              <Route path="/disc/questoes" element={<DiscQuestoesPage />} />
              <Route path="/disc/resultados" element={<DiscResultadosPage />} />
              <Route path="/disc/resultados/:id" element={<DiscResultadosIdPage />} />
              <Route path="/disc/:id" element={<DiscIdPage />} />

              {/* Gestão de Projetos e Kanban */}
              <Route path="/projetos" element={<ProjectsPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/planner/:id" element={<PlannerIdPage />} />
              <Route path="/kanban" element={<KanbanPage />} />
              <Route path="/videochamada/:roomName" element={<VideochamadaRoomPage />} />

              {/* Comercial & Sistema */}
              <Route path="/produtos" element={<ProdutosPage />} />
              <Route path="/vendas" element={<VendasPage />} />
              <Route path="/relatorios" element={<RelatoriosPage />} />
              <Route path="/configuracoes" element={<ConfiguracoesPage />} />
              <Route path="/meu-perfil" element={<MeuPerfilPage />} />

              {/* Redirecionar rotas inválidas */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}
