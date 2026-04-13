'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Avatar, notification } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BulbOutlined,
  MessageOutlined,
  ProjectOutlined,
  LinkOutlined,
  ShoppingOutlined,
  DollarOutlined,
  BankOutlined,
  TeamOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import apiService from '../services/api';

const { Header, Sider, Content } = Layout;

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo: 'cliente' | 'admin';
  status: 'ativo' | 'inativo';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [, contextHolder] = notification.useNotification();

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário logado:', error);
      if (error instanceof Error && error.message.includes('Token')) {
        localStorage.removeItem('adminToken');
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      loadCurrentUser();
    }
  }, [router, loadCurrentUser]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/login');
  };

  const getSelectedKey = () => {
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname === '/usuarios') return 'usuarios';
    if (pathname === '/contatos') return 'contatos';
    if (pathname.startsWith('/multiplas-inteligencias')) return 'multiplas-inteligencias';
    if (pathname.startsWith('/dominancia-cerebral')) return 'dominancia-cerebral';
    if (pathname.startsWith('/disc')) return 'disc';
    if (pathname.startsWith('/agendamentos')) return 'agendamentos';
    if (pathname.startsWith('/kanban')) return 'kanban';
    if (pathname === '/produtos' || pathname.startsWith('/produtos')) return 'produtos';
    if (pathname === '/vendas' || pathname.startsWith('/vendas')) return 'vendas';
    if (pathname === '/relatorios') return 'relatorios';
    if (pathname === '/configuracoes') return 'configuracoes';
    if (pathname === '/projetos' || pathname.startsWith('/projetos')) return 'projetos';
    if (pathname === '/links' || pathname.startsWith('/links')) return 'links';
    if (pathname === '/empresas' || pathname.startsWith('/empresas')) return 'empresas';
    if (pathname === '/vagas' || pathname.startsWith('/vagas')) return 'vagas';
    if (pathname === '/banco-talentos' || pathname.startsWith('/banco-talentos')) return 'banco-talentos';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/dashboard')
    },
    {
      key: 'usuarios',
      icon: <UserOutlined />,
      label: 'Usuários',
      onClick: () => router.push('/usuarios')
    },
    {
      key: 'contatos',
      icon: <MessageOutlined />,
      label: 'Contatos',
      onClick: () => router.push('/contatos')
    },
    {
      key: 'multiplas-inteligencias',
      icon: <BulbOutlined />,
      label: 'Múltiplas Inteligências',
      onClick: () => router.push('/multiplas-inteligencias')
    },
    {
      key: 'dominancia-cerebral',
      icon: <BarChartOutlined />,
      label: 'Dominância Cerebral',
      onClick: () => router.push('/dominancia-cerebral/resultados')
    },
    {
      key: 'disc',
      icon: <BarChartOutlined />,
      label: 'Teste DISC',
      onClick: () => router.push('/disc')
    },
    {
      key: 'agendamentos',
      icon: <CalendarOutlined />,
      label: 'Agendamentos',
      onClick: () => router.push('/agendamentos')
    },
    {
      key: 'projetos',
      icon: <ProjectOutlined />,
      label: 'Gestão de Projetos',
      onClick: () => router.push('/projetos')
    },
    {
      key: 'planner',
      icon: <CalendarOutlined />,
      label: 'Planner',
      onClick: () => router.push('/planner')
    },
    {
      key: 'links',
      icon: <LinkOutlined />,
      label: 'Links (Linktree)',
      onClick: () => router.push('/links')
    },
    {
      key: 'produtos',
      icon: <ShoppingOutlined />,
      label: 'Produtos',
      onClick: () => router.push('/produtos')
    },
    {
      key: 'vendas',
      icon: <DollarOutlined />,
      label: 'Vendas',
      onClick: () => router.push('/vendas')
    },
    {
      key: 'empresas',
      icon: <BankOutlined />,
      label: 'Empresas',
      onClick: () => router.push('/empresas')
    },
    {
      key: 'vagas',
      icon: <ProjectOutlined />,
      label: 'Vagas',
      onClick: () => router.push('/vagas')
    },
    {
      key: 'banco-talentos',
      icon: <TeamOutlined />,
      label: 'Banco de Talentos',
      onClick: () => router.push('/banco-talentos')
    },
    {
      key: 'relatorios',
      icon: <BarChartOutlined />,
      label: 'Relatórios',
      onClick: () => router.push('/relatorios')
    },
    {
      key: 'configuracoes',
      icon: <SettingOutlined />,
      label: 'Configurações',
      onClick: () => router.push('/configuracoes')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: handleLogout,
      style: { marginTop: 'auto' }
    }
  ];

  return (
    <>
      {contextHolder}
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: '#001529'
          }}
        >
          <div style={{
            height: 64,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: collapsed ? '14px' : '16px'
          }}>
            {collapsed ? 'AC' : 'Admin Coaching'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            style={{ border: 'none' }}
          />
        </Sider>

        <Layout>
          <Header style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }} onClick={() => setCollapsed(!collapsed)}>
              ☰
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={currentUser?.avatar_url}
                icon={!currentUser?.avatar_url && <UserOutlined />}
                style={{ marginRight: 8 }}
              >
                {!currentUser?.avatar_url && currentUser?.nome?.charAt(0).toUpperCase()}
              </Avatar>
              <span>{currentUser?.nome || 'Carregando...'}</span>
            </div>
          </Header>

          <Content style={{
            margin: '24px',
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)'
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
