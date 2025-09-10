import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Typography, Button, Avatar, Dropdown, Menu } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  HomeOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  PlusOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [selectedKey, setSelectedKey] = useState('dashboard');

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
    const path = location.pathname.split('/')[1] || 'dashboard';
    setSelectedKey(path);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    navigate(`/${key}`);
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Início',
    },
    {
      key: 'agendamentos',
      icon: <CalendarOutlined />,
      label: 'Meus Agendamentos',
    },
    {
      key: 'agendar',
      icon: <PlusOutlined />,
      label: 'Agendar Sessão',
    },
    {
      key: 'testes',
      icon: <FileTextOutlined />,
      label: 'Meus Testes',
    },
  ];

  const userMenuItems = [
    {
      key: 'perfil',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
      onClick: () => navigate('/perfil'),
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
    <Layout className="layout" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Header 
        className="custom-header"
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingLeft: 32,
          paddingRight: 32,
          background: '#ffffff !important',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: 70
        }}
      >
        <div className="logo" style={{ minWidth: '300px' }}>
          <Title level={3} style={{ color: '#2c3e50', margin: 0, whiteSpace: 'nowrap', fontWeight: 600 }}>
            Portal do Cliente
          </Title>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            style={{ 
              background: 'transparent',
              border: 'none',
              minWidth: 400,
              flex: 1
            }}
            items={menuItems}
            className="elegant-menu"
          />
          
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Button 
              type="text" 
              style={{ 
                color: '#2c3e50', 
                whiteSpace: 'nowrap',
                height: 40,
                borderRadius: 8,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid #e8e8e8',
                background: '#fafafa'
              }}
            >
              <Avatar 
                icon={<UserOutlined />} 
                style={{ 
                  backgroundColor: '#667eea',
                  color: 'white'
                }} 
                size="small"
              />
              {user?.nome || user?.email}
            </Button>
          </Dropdown>
        </div>
      </Header>
      
      <Layout>
        <Content style={{ 
          padding: '32px 32px', 
          margin: 0, 
          minHeight: 280,
          background: '#f8fafc'
        }}>
          <Outlet />
        </Content>
      </Layout>
      
      <Footer style={{ 
        textAlign: 'center', 
        background: '#ffffff',
        borderTop: '1px solid #f0f0f0',
        color: '#64748b',
        padding: '20px 50px'
      }}>
        Portal do Cliente - Coach de Carreiras ©2024
      </Footer>
    </Layout>
  );
};

export default MainLayout;
