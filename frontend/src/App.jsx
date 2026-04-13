import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Login from './Login';

// Páginas Públicas
import LandingPage from './pages/LandingPage';
import Cartilha from './pages/Cartilha';
import LinktreePage from './pages/LinktreePage';

// Páginas do Cliente
import Dashboard from './pages/Dashboard';
import VagasList from './pages/Vagas/VagasList';
import VagaDetails from './pages/Vagas/VagaDetails';
import MinhasVagas from './pages/Vagas/MinhasVagas';
import Testes from './Testes';
import MeuPerfil from './pages/MeuPerfil';
import ResultadosInteligencias from './pages/ResultadosInteligencias';
import MeusAgendamentos from './pages/MeusAgendamentos';
import DetalhesAgendamento from './pages/DetalhesAgendamento';
import RelatorioSessao from './pages/RelatorioSessao';
import TesteDISC from './TesteDISC';
import TesteDominancia from './TesteDominancia';
import TesteMultiplasInteligencias from './TesteMultiplasInteligencias';
import ResultadoDISC from './pages/ResultadoDISC';
import VideochamadaPage from './pages/VideochamadaPage';

// Páginas Admin
import AdminLinks from './pages/admin/AdminLinks';
import PresentationViewer from './pages/PresentationViewer';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Páginas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cartilha" element={<Cartilha />} />
        <Route path="/links" element={<LinktreePage />} />

        {/* Portal de Vagas */}
        <Route path="/vagas" element={<VagasList />} />
        <Route path="/vagas/:id" element={<VagaDetails />} />

        {/* Área do Cliente (Protegida) */}
        <Route path="/cliente" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="testes" element={<Testes />} />
          <Route path="agendamentos" element={<MeusAgendamentos />} />
          <Route path="agendamentos/:id" element={<DetalhesAgendamento />} />
          <Route path="perfil" element={<MeuPerfil />} />
          <Route path="resultados-inteligencias" element={<ResultadosInteligencias />} />
          <Route path="teste-inteligencias" element={<TesteMultiplasInteligencias />} />
          <Route path="teste-dominancia" element={<TesteDominancia />} />
          <Route path="teste-disc" element={<TesteDISC />} />
          <Route path="resultado-disc" element={<ResultadoDISC />} />
          <Route path="relatorio-sessao/:id" element={<RelatorioSessao />} />
        </Route>

        {/* Rotas protegidas extras que usam o MainLayout */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/minhas-vagas" element={<MinhasVagas />} />
        </Route>

        {/* Videochamada - Tela cheia sem layout */}
        <Route path="/cliente/videochamada/:roomName" element={
          <ProtectedRoute>
            <VideochamadaPage />
          </ProtectedRoute>
        } />

        {/* Redireciona rotas antigas para manter compatibilidade */}
        <Route path="/testes" element={<Navigate to="/cliente/testes" replace />} />
        <Route path="/presentation-viewer" element={<PresentationViewer />} />
        <Route path="/presentation-viewer/:filename" element={<PresentationViewer />} />
        <Route path="/perfil" element={<Navigate to="/cliente/perfil" replace />} />
        <Route path="/resultados-inteligencias" element={<Navigate to="/cliente/resultados-inteligencias" replace />} />
        <Route path="/teste-disc" element={<Navigate to="/cliente/teste-disc" replace />} />
        <Route path="/resultado-disc" element={<Navigate to="/cliente/resultado-disc" replace />} />

        {/* Redireciona outras rotas para a home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;