import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Dropdown, Drawer, Button } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DownOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon, TestTubeIcon, Calendar03Icon, UserIcon, Logout01Icon, Briefcase02Icon } from '@hugeicons/core-free-icons';
import API_BASE_URL from '../config/api';
import logoImpulsoDesktop from '../assets/img/logo-logadin.png';
import logoImpulsoMobile from '../assets/img/simbolo-mobile.png'; // Símbolo para mobile
import logoBM from '../assets/img/logo-bruna.png';

const { Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/cliente' || path === '/cliente/dashboard') return 'home';
    if (path.includes('/cliente/testes')) return 'testes';
    if (path.includes('/cliente/agendamentos')) return 'agendamentos';
    if (path.includes('/vagas') || path.includes('minhas-vagas')) return 'vagas';
    if (path.includes('/cliente/perfil')) return 'perfil';
    return 'home';
  };

  useEffect(() => {
    const carregarUsuario = async () => {
      const userData = localStorage.getItem('usuario');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const token = localStorage.getItem('token');

          if (token && parsedUser.id) {
            const response = await fetch(`${API_BASE_URL}/api/usuarios/${parsedUser.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const updatedUser = await response.json();
              setUser(updatedUser);
              localStorage.setItem('usuario', JSON.stringify(updatedUser));
            } else {
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

  const getAvatarUrl = (user) => {
    if (user?.avatar_url && user.avatar_url.startsWith('http')) {
      return user.avatar_url;
    }

    if (user?.avatar || user?.avatar_url || user?.foto || (user && user.id)) {
      return `${API_BASE_URL}/api/arquivos/avatar/${user.id}`;
    }

    return null;
  };

  const getMenuItems = () => {
    return [
      {
        key: 'home',
        icon: <HugeiconsIcon icon={Home01Icon} size={24} strokeWidth={1.5} />,
        label: 'Home',
        onClick: () => {
          navigate('/cliente');
          setMobileMenuOpen(false);
        }
      },
      {
        key: 'testes',
        icon: <HugeiconsIcon icon={TestTubeIcon} size={24} strokeWidth={1.5} />,
        label: 'Testes',
        onClick: () => {
          navigate('/cliente/testes');
          setMobileMenuOpen(false);
        }
      },
      {
        key: 'agendamentos',
        icon: <HugeiconsIcon icon={Calendar03Icon} size={24} strokeWidth={1.5} />,
        label: 'Agendamentos',
        onClick: () => {
          navigate('/cliente/agendamentos');
          setMobileMenuOpen(false);
        }
      },
      {
        key: 'vagas',
        icon: <HugeiconsIcon icon={Briefcase02Icon} size={24} strokeWidth={1.5} />,
        label: 'Minhas Vagas',
        onClick: () => {
          navigate('/minhas-vagas');
          setMobileMenuOpen(false);
        }
      },
      {
        key: 'perfil',
        icon: <HugeiconsIcon icon={UserIcon} size={24} strokeWidth={1.5} />,
        label: 'Perfil',
        onClick: () => {
          navigate('/cliente/perfil');
          setMobileMenuOpen(false);
        }
      },
      {
        key: 'logout',
        icon: <HugeiconsIcon icon={Logout01Icon} size={24} strokeWidth={1.5} />,
        label: 'Sair',
        onClick: handleLogout
      }
    ];
  };



  const SidebarContent = ({ isMobileDrawer = false }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: isMobileDrawer ? 'auto' : '100vh',
      background: '#ffffff',
      borderRight: '1px solid #E5E5E5'
    }}>
      {/* Logo Impulso */}
      <div style={{
        padding: '30px 16px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <img
          src={collapsed && !isMobileDrawer ? logoImpulsoMobile : logoImpulsoDesktop}
          alt="Logo Impulso"
          style={{
            height: collapsed && !isMobileDrawer ? '30px' : isMobileDrawer ? '35px' : '40px',
            maxWidth: '100%',
            width: collapsed && !isMobileDrawer ? 'auto' : '85%',
            objectFit: 'contain',
            transition: 'all 0.3s',
            imageRendering: '-webkit-optimize-contrast',
            WebkitFontSmoothing: 'antialiased'
          }}
        />
      </div>

      {/* Avatar e Nome do Usuário */}
      {!collapsed && (
        <div style={{
          padding: '24px 20px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Avatar
            size={80}
            src={getAvatarUrl(user)}
            icon={!getAvatarUrl(user) && <UserOutlined />}
            style={{
              marginBottom: '12px'

            }}
          />
          <div>
            <Text style={{
              color: '#1E1E1E',
              fontSize: '20px',
              fontWeight: '600',
              display: 'block',
              marginBottom: '4px'
            }}>
              {user?.nome || 'Usuário'}
            </Text>
            <Text style={{
              color: '#A4A4A4',
              fontSize: '12px',
              display: 'block',
              textAlign: 'center'
            }}>
              {user?.email || 'email@exemplo.com'}
            </Text>
          </div>
        </div>
      )}

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={getMenuItems()}
        className="custom-sidebar-menu"
        style={{
          background: 'transparent',
          border: 'none',
          marginTop: '20px',
          flex: 1
        }}
        theme="light"
      />

      {/* Logo BM no Footer */}
      {(!collapsed || isMobileDrawer) && (
        <div style={{
          padding: '64px 20px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          marginTop: 'auto'
        }}>
          <img
            src={logoBM}
            alt="BM Consultoria"
            style={{
              height: isMobileDrawer ? '38px' : '40px',
              maxWidth: '220px',
              objectFit: 'contain',
              opacity: 0.7
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Mobile Header */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 1000,
          borderBottom: '1px solid #E5E5E5'
        }}>
          <img
            src={logoImpulsoDesktop}
            alt="Logo"
            style={{
              height: '32px',
              width: 'auto',
              maxWidth: '160px',
              objectFit: 'contain',
              imageRendering: '-webkit-optimize-contrast',
              WebkitFontSmoothing: 'antialiased'
            }}
          />
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '20px', color: 'black' }} />}
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          closable={false}
          width={280}
          bodyStyle={{ padding: 0, background: '#000' }}
        >
          <SidebarContent isMobileDrawer={true} />
        </Drawer>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          width={280}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{
            background: '#ffffff',
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            overflow: 'hidden'
          }}
        >
          <SidebarContent />
        </Sider>
      )}

      {/* Content */}
      <Content style={{
        minHeight: '100vh',
        background: '#F9F9F9',
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 280),
        marginTop: isMobile ? '60px' : 0,
        transition: 'margin-left 0.2s'
      }}>
        <Outlet context={{ user }} />
      </Content>
    </Layout>
  );
};

export default MainLayout;
