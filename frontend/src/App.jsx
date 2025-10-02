import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import Login from './Login';

// Páginas do Cliente
import Dashboard from './pages/Dashboard';
import MeusAgendamentos from './pages/MeusAgendamentos';
import AgendarSessao from './pages/AgendarSessao';
import Testes from './Testes';
import MeuPerfil from './pages/MeuPerfil';
import ResultadosInteligencias from './pages/ResultadosInteligencias';

// Páginas do Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClientes from './pages/admin/AdminClientes';
import TesteMultiplasInteligencias from './TesteMultiplasInteligencias';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rotas do Cliente */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="agendamentos" element={<MeusAgendamentos />} />
          <Route path="agendar" element={<AgendarSessao />} />
          <Route path="testes" element={<Testes />} />
          <Route path="perfil" element={<MeuPerfil />} />
          <Route path="resultados-inteligencias" element={<ResultadosInteligencias />} />
        </Route>

        {/* Rotas do Admin */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="clientes" element={<AdminClientes />} />
          <Route path="teste-multiplas-inteligencias" element={<TesteMultiplasInteligencias />} />
          {/* Outras rotas admin serão adicionadas aqui */}
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;