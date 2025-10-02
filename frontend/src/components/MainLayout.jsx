import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Typography, Avatar, Dropdown } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  HomeOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  PlusOutlined,
  DownOutlined
} from '@ant-design/icons';

const { Content, Footer } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  const getButtonStyle = (path) => ({
    background: 'transparent',
    border: 'none',
    borderBottom: isActive(path) ? '2px solid #1890ff' : '2px solid transparent',
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#2c3e50',
    fontSize: '14px',
    height: '40px',
    transition: 'all 0.2s ease',
    borderRadius: '4px 4px 0 0'
  });

  useEffect(() => {
    const carregarUsuario = async () => {
      const userData = localStorage.getItem('usuario');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('Dados do usuário do localStorage:', parsedUser);
          const token = localStorage.getItem('token');
          
          if (token && parsedUser.id) {
            const response = await fetch(`http://localhost:8002/api/usuarios/${parsedUser.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const updatedUser = await response.json();
              console.log('Dados atualizados do usuário da API:', updatedUser);
              setUser(updatedUser);
              localStorage.setItem('usuario', JSON.stringify(updatedUser));
            } else {
              console.error('Erro ao buscar dados atualizados do usuário:', response.statusText);
              setUser(parsedUser);
            }
          } else {
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Erro ao fazer parse dos dados do usuário:', error);
        }
      }
    };

    carregarUsuario();

    const handleStorageChange = () => {
      carregarUsuario();
    };

    const handleProfileUpdate = () => {
      carregarUsuario();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUser(null);
    navigate('/login');
  };

  const dropdownItems = [
    {
      key: 'perfil',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
      onClick: () => navigate('/perfil')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: handleLogout
    }
  ];

  const getAvatarUrl = (user) => {
    console.log('getAvatarUrl chamada com user:', user);
    console.log('user?.avatar:', user?.avatar);
    console.log('user?.avatar_url:', user?.avatar_url);
    console.log('user?.foto:', user?.foto);
    
    // Se já tem uma URL completa (como no perfil)
    if (user?.avatar_url && user.avatar_url.startsWith('http')) {
      console.log('Usando avatar_url direta:', user.avatar_url);
      return user.avatar_url;
    }
    
    // Se tem algum campo indicando que há avatar, gerar URL da API
    if (user?.avatar || user?.avatar_url || user?.foto || (user && user.id)) {
      const avatarUrl = `http://localhost:8002/api/arquivos/avatar/${user.id}`;
      console.log('Avatar URL gerada:', avatarUrl);
      return avatarUrl;
    }
    
    console.log('Avatar não encontrado, retornando null');
    return null;
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div 
        className="custom-header"
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingLeft: 32,
          paddingRight: 32,
          background: '#ffffff',
          borderBottom: '1px solid #1890ff',
          height: 70,
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <div className="logo" style={{ minWidth: '300px' }}>
          <Title level={3} style={{ color: '#2c3e50', margin: 0, whiteSpace: 'nowrap', fontWeight: 600 }}>
            Portal do Cliente
          </Title>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={getButtonStyle('/dashboard')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottom = '2px solid #40a9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottom = isActive('/dashboard') ? '2px solid #1890ff' : '2px solid transparent';
              }}
            >
              <HomeOutlined /> Início
            </button>
            <button
              onClick={() => navigate('/agendamentos')}
              style={getButtonStyle('/agendamentos')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottom = '2px solid #40a9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottom = isActive('/agendamentos') ? '2px solid #1890ff' : '2px solid transparent';
              }}
            >
              <CalendarOutlined /> Agendamentos
            </button>
            <button
              onClick={() => navigate('/agendar')}
              style={getButtonStyle('/agendar')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottom = '2px solid #40a9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottom = isActive('/agendar') ? '2px solid #1890ff' : '2px solid transparent';
              }}
            >
              <PlusOutlined /> Agendar Sessão
            </button>
            <button
              onClick={() => navigate('/testes')}
              style={getButtonStyle('/testes')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottom = '2px solid #40a9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottom = isActive('/testes') ? '2px solid #1890ff' : '2px solid transparent';
              }}
            >
              <FileTextOutlined /> Testes
            </button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Dropdown
              menu={{ items: dropdownItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 8,
                transition: 'all 0.2s',
                ':hover': {
                  backgroundColor: '#f0f0f0'
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              >
                <Avatar 
                  size={40} 
                  src={getAvatarUrl(user)}
                  icon={!getAvatarUrl(user) ? <UserOutlined /> : null}
                  style={{ 
                    border: '2px solid #1890ff'
                  }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ 
                    fontSize: 14, 
                    color: '#2c3e50', 
                    fontWeight: 500,
                    lineHeight: 1.2
                  }}>
                    {user?.nome || 'Usuário'}
                  </span>
                  <span style={{ 
                    fontSize: 12, 
                    color: '#8c8c8c',
                    lineHeight: 1.2
                  }}>
                    Perfil
                  </span>
                </div>
                <DownOutlined style={{ 
                  fontSize: 12, 
                  color: '#8c8c8c',
                  marginLeft: 4
                }} />
              </div>
            </Dropdown>
          </div>
        </div>
      </div>

      <Content style={{ padding: '24px 32px', minHeight: 'calc(100vh - 70px - 69px)' }}>
        <div style={{ 
          minHeight: '100%', 
          padding: 24, 
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Outlet />
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        Portal do Cliente ©2024 Created by Your Company
      </Footer>
    </Layout>
  );
};

export default MainLayout;
