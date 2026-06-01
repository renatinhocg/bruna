'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Avatar, Dropdown, Popover, Badge } from 'antd';
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
  DownOutlined,
  BellOutlined
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
  children?: React.ReactElement | React.ReactElement[] | null;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const router = useRouter();
  const pathname = usePathname();

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

  const unreadCount = 0;

  const notificationContent = (
    <div style={{ width: 320 }}>
      <div
        style={{
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: 8,
          marginBottom: 8
        }}
      >
        <span style={{ fontWeight: 600 }}>Notificações</span>
      </div>
      <div style={{ textAlign: 'center', padding: '24px 0', color: '#8c8c8c' }}>
        Nenhuma notificação disponível no momento.
      </div>
    </div>
  );

  const userMenuItems = [
    {
      key: 'perfil',
      label: 'Meu Perfil',
      icon: <UserOutlined />,
      onClick: () => router.push('/meu-perfil')
    },
    {
      key: 'configuracoes',
      label: 'Configurações',
      icon: <SettingOutlined />,
      onClick: () => router.push('/configuracoes')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      label: 'Sair',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout
    }
  ];

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
      type: 'group' as const,
      label: collapsed ? null : 'Principal',
      children: [
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
          key: 'agendamentos',
          icon: <CalendarOutlined />,
          label: 'Agendamentos',
          onClick: () => router.push('/agendamentos')
        },
        {
          key: 'links',
          icon: <LinkOutlined />,
          label: 'Links (Linktree)',
          onClick: () => router.push('/links')
        }
      ]
    },
    {
      type: 'group' as const,
      label: collapsed ? null : 'Recrutamento & Seleção (R&S)',
      children: [
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
        }
      ]
    },
    {
      type: 'group' as const,
      label: collapsed ? null : 'Avaliações & Testes',
      children: [
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
        }
      ]
    },
    {
      type: 'group' as const,
      label: collapsed ? null : 'Gestão & Operações',
      children: [
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
        }
      ]
    },
    {
      type: 'group' as const,
      label: collapsed ? null : 'Comercial & Financeiro',
      children: [
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
        }
      ]
    },
    {
      type: 'group' as const,
      label: collapsed ? null : 'Sistema',
      children: [
        {
          key: 'relatorios',
          icon: <BarChartOutlined />,
          label: 'Relatórios',
          onClick: () => router.push('/relatorios')
        }
      ]
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#09090b',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
          borderRight: '1px solid #1f222a',
          zIndex: 10
        }}
      >
        <div
          style={{
            height: 64,
            margin: '16px 16px 24px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? '0' : '0 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            transition: 'all 0.2s'
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: 18, color: 'white', fontWeight: 800, letterSpacing: -0.5 }}>AC</span>
          </div>

          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.3px',
                  background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: '1.2'
                }}
              >
                Admin Coaching
              </span>
              <span
                style={{
                  color: '#64748b',
                  fontSize: '9px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginTop: '1px'
                }}
              >
                Carreiras & R&S
              </span>
            </div>
          )}
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
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div
            style={{
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
            onClick={() => setCollapsed(!collapsed)}
          >
            ☰
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Popover
              content={notificationContent}
              trigger="click"
              placement="bottomRight"
              overlayClassName="premium-notifications-popover"
            >
              <Badge count={unreadCount} style={{ boxShadow: '0 0 0 1px #fff' }}>
                <BellOutlined
                  style={{
                    fontSize: 20,
                    cursor: 'pointer',
                    color: '#64748b',
                    transition: 'color 0.2s',
                    padding: 4
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#7c3aed';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b';
                  }}
                />
              </Badge>
            </Popover>

            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: 8,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Avatar
                  src={currentUser?.avatar_url}
                  icon={!currentUser?.avatar_url && <UserOutlined />}
                  style={{ marginRight: 8, background: '#7c3aed' }}
                >
                  {!currentUser?.avatar_url && currentUser?.nome?.charAt(0).toUpperCase()}
                </Avatar>
                <span style={{ fontWeight: 500, marginRight: 6, color: '#334155' }}>
                  {currentUser?.nome || 'Carregando...'}
                </span>
                <DownOutlined style={{ fontSize: 10, color: '#64748b' }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
