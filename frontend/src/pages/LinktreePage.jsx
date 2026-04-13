import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Spin, message } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const LinktreePage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState({
    nome: 'BM Consultoria',
    descricao: 'Transformando carreiras e realizando sonhos profissionais há mais de 20 anos.',
    avatar: 'https://ui-avatars.com/api/?name=Bruna+Martins&background=1890ff&color=fff&size=200',
    logo: '/logo-bm.png',
    heroImageMobile: `/banner-desktop.png?v=${Date.now()}`,
    heroImageDesktop: `/banner-desktop.png?v=${Date.now()}`
  });

  useEffect(() => {
    carregarLinks();
  }, []);

  const carregarLinks = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';
      const response = await axios.get(`${API_URL}/api/links/public`);
      console.log('Links carregados:', response.data);
      setLinks(response.data);
    } catch (error) {
      console.error('Erro ao carregar links:', error);
      message.error('Erro ao carregar links');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (link) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

      // Registrar clique
      axios.post(`${API_URL}/api/links/${link.id}/click`, {
        referer: window.location.href
      }).catch(err => console.error('Erro ao registrar clique:', err));

      // Abrir link em nova aba
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Erro ao processar clique:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a', // Dark modern background
      backgroundImage: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
      fontFamily: '"Outfit", sans-serif',
      color: '#fff',
      paddingBottom: '40px'
    }}>
      {/* Hero Section */}
      <div
        className="hero-section"
        style={{
          position: 'relative',
          height: '400px',
          backgroundImage: `url(${perfil.heroImageMobile})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: '60px',
          overflow: 'hidden'
        }}
      >
        {/* Overlay gradiente para legibilidade */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'linear-gradient(to top, #0f172a 0%, rgba(15, 23, 42, 0.4) 50%, transparent 100%)',
          zIndex: 1
        }} />

        {/* Logo */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          animation: 'fadeInDown 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}>
          <img
            src={perfil.logo}
            alt="BM Consultoria Logo"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '4px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              marginBottom: '20px',
              objectFit: 'contain',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '10px'
            }}
          />
        </div>

        {/* Título e Descrição */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '600px',
          padding: '0 20px',
          animation: 'fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both'
        }}>
          <Title level={1} style={{
            color: '#fff',
            marginBottom: '12px',
            fontWeight: 800,
            fontSize: 'clamp(28px, 6vw, 42px)',
            letterSpacing: '-1px',
            margin: 0
          }}>
            {perfil.nome}
          </Title>
          <Text style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '16px',
            display: 'block',
            marginTop: '8px',
            fontWeight: 400
          }}>
            {perfil.descricao}
          </Text>
        </div>
      </div>

      {/* Container dos Links */}
      <div style={{
        maxWidth: '680px',
        margin: '-40px auto 0',
        padding: '0 20px 40px',
        position: 'relative',
        zIndex: 2
      }}>

        {/* Links */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {links.map((link, index) => (
            <Card
              key={link.id}
              hoverable
              onClick={() => handleLinkClick(link)}
              style={{
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                marginBottom: '4px'
              }}
              bodyStyle={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
              }}
            >
              {/* Ícone ou Imagem */}
              <div style={{
                fontSize: '28px',
                width: '54px',
                height: '54px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: link.imagem_url ? 'transparent' : (link.cor || 'rgba(255, 255, 255, 0.1)'),
                borderRadius: '16px',
                flexShrink: 0,
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {link.imagem_url ? (
                  <img
                    src={link.imagem_url}
                    alt={link.titulo}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  link.icone || '🔗'
                )}
              </div>

              {/* Conteúdo */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '19px',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: link.descricao ? '4px' : 0,
                  wordBreak: 'break-word',
                  lineHeight: '1.4',
                  letterSpacing: '0.2px'
                }}>
                  {link.titulo}
                </div>
                {link.descricao && (
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    wordBreak: 'break-word',
                    lineHeight: '1.5',
                    fontWeight: 400
                  }}>
                    {link.descricao}
                  </div>
                )}
              </div>

              {/* Seta */}
              <LinkOutlined style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.3)',
                flexShrink: 0
              }} />
            </Card>
          ))}
        </div>

      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        marginTop: '40px'
      }}>
        <div style={{
          height: '1px',
          width: '100px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          margin: '0 auto 30px'
        }} />
        <Text style={{
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '14px',
          letterSpacing: '0.5px'
        }}>
          © 2024 {perfil.nome}. Todos os direitos reservados.
        </Text>
      </div>

      {/* Animações e Estilos CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Imagem de fundo do Hero - Desktop */
        @media (min-width: 769px) {
          .hero-section {
            background-image: url(${perfil.heroImageDesktop}) !important;
            height: 480px !important;
          }
        }

        /* Responsividade para mobile */
        @media (max-width: 768px) {
          .ant-card-body {
            padding: 18px !important;
          }
          
          .hero-section {
            background-image: url(${perfil.heroImageMobile}) !important;
            height: 400px !important;
          }
        }

        /* Efeito de hover suave nas cards */
        .ant-card {
          will-change: transform, background, border-color, box-shadow;
        }

        /* Scroll suave */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default LinktreePage;
