import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Typography, Button, Avatar, Dropdown, Menu } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  DashboardOutlined,
  CalendarOutlined, 
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  DollarOutlined,
  MessageOutlined
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Atualizar a key selecionada baseada na rota atual
    const path = location.pathname.split('/')[2] || 'dashboard'; // /admin/dashboard
    setSelectedKey(path);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    navigate(`/admin/${key}`);
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'agendamentos',
      icon: <CalendarOutlined />,
      label: 'Agendamentos',
    },
    {
      key: 'clientes',
      icon: <TeamOutlined />,
      label: 'Clientes',
    },
    {
      key: 'testes',
      icon: <FileTextOutlined />,
      label: 'Testes e Avaliações',
    },
    {
      key: 'financeiro',
      icon: <DollarOutlined />,
      label: 'Financeiro',
    },
    {
      key: 'comunicacao',
      icon: <MessageOutlined />,
      label: 'Comunicação',
    },
    {
      key: 'relatorios',
      icon: <BarChartOutlined />,
      label: 'Relatórios',
    },
    {
      key: 'configuracoes',
      icon: <SettingOutlined />,
      label: 'Configurações',
    },
  ];

  const userMenuItems = [
    {
      key: 'perfil',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
      onClick: () => navigate('/admin/perfil'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        width={280}
        style={{
          background: '#001529',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ 
          height: 64, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Title 
            level={4} 
            style={{ 
              color: 'white', 
              margin: 0,
              fontSize: collapsed ? '14px' : '16px'
            }}
          >
            {collapsed ? 'Admin' : 'Painel Admin'}
          </Title>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#2c3e50' }}>
              Sistema de Coaching - Administração
            </Title>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button 
              type="text" 
              icon={<BellOutlined />} 
              style={{ fontSize: 16 }}
            />
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button 
                type="text" 
                style={{ 
                  height: 40,
                  borderRadius: 8,
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid #e8e8e8'
                }}
              >
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: '#f56a00',
                    color: 'white'
                  }} 
                  size="small"
                />
                <span style={{ color: '#2c3e50' }}>
                  {user?.nome || user?.email}
                </span>
              </Button>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ 
          margin: '24px 24px 0', 
          padding: 24, 
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <Outlet />
        </Content>
        
        <Footer style={{ 
          textAlign: 'center', 
          background: '#f8fafc',
          color: '#64748b' 
        }}>
          Painel Administrativo - Sistema de Coaching ©2024
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
