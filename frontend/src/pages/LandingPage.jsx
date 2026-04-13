import React from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import axios from 'axios';
import {
  RocketOutlined,
  TrophyOutlined,
  TeamOutlined,
  StarOutlined,
  CheckCircleOutlined,
  RightOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  WhatsAppOutlined,
  MailOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  BulbOutlined,
  UserOutlined,
  LoadingOutlined,
  SendOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api';

// Paleta de cores
const COLORS = {
  primary: '#FDB913',      // Amarelo/Dourado (Fiel a marca)
  secondary: '#F39200',    // Laranja (Fiel a marca)
  dark: '#141B2D',         // Azul escuro (Fiel a marca)
  gold: '#C89F5D',         // Dourado suave
  blue: '#1B263B',         // Azul medio
  beige: '#9A8B6F',        // Marrom/Bege
  textBlue: '#5B7BA5',     // Texto azul acinzentado
  textGray: '#4A5568',     // Texto cinza escuro
  textDark: '#2D3748',     // Texto preto
  gradient: 'linear-gradient(135deg, #141B2D 0%, #1B263B 100%)'
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currentTestimonial, setCurrentTestimonial] = React.useState(0);
  const [currentServiceEmpresa, setCurrentServiceEmpresa] = React.useState(0);
  const [currentServicePessoa, setCurrentServicePessoa] = React.useState(0);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false); // Fecha o menu após clicar
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Aplicar mascara de telefone
    if (name === 'telefone') {
      const cleaned = value.replace(/\D/g, ''); // Remove tudo que não a numero
      let formatted = cleaned;

      if (cleaned.length <= 10) {
        // Formato: (XX) XXXX-XXXX
        formatted = cleaned.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, (match, p1, p2, p3) => {
          if (p3) return `(${p1}) ${p2}-${p3}`;
          if (p2) return `(${p1}) ${p2}`;
          if (p1) return `(${p1}`;
          return cleaned;
        });
      } else {
        // Formato: (XX) XXXXX-XXXX
        formatted = cleaned.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, (match, p1, p2, p3) => {
          if (p3) return `(${p1}) ${p2}-${p3}`;
          if (p2) return `(${p1}) ${p2}`;
          if (p1) return `(${p1}`;
          return cleaned;
        });
      }

      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.mensagem) {
      message.warning('Por favor, preencha todos os campos obrigaterios');
      return;
    }

    setLoading(true);

    // Mensagem de carregamento
    const hide = message.loading('Enviando sua mensagem...', 0);

    try {
      await axios.post(`${API_BASE_URL}/contatos`, formData);
      hide();

      // Disparar evento de conversão do Google Ads
      if (window.gtag) {
        window.gtag('event', 'lead_conversion');
      }

      message.success({
        content: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        duration: 5,
        style: {
          marginTop: '20vh',
        }
      });
      setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
    } catch (error) {
      hide();
      console.error('Erro ao enviar mensagem:', error);
      message.error({
        content: 'Erro ao enviar mensagem. Tente novamente.',
        duration: 5,
        style: {
          marginTop: '20vh',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "HelveÉtica Neue", Arial, sans-serif'
    }}>
      {/* Header/Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.98)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}>
        <nav style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: window.innerWidth > 768 ? '20px 40px' : '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            cursor: 'pointer'
          }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/logo-site.png"
              alt="Gestão de Carreira"
              style={{
                height: window.innerWidth > 768 ? 50 : 35,
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Menu Desktop */}
          {window.innerWidth > 768 ? (
            <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
              <a onClick={() => scrollToSection('serviços')} style={{
                cursor: 'pointer',
                color: '#333',
                fontWeight: 500,
                transition: 'color 0.3s'
              }}>Serviços</a>
              <a onClick={() => scrollToSection('sobre')} style={{
                cursor: 'pointer',
                color: '#333',
                fontWeight: 500
              }}>Sobre</a>
              <a onClick={() => scrollToSection('consultoria')} style={{
                cursor: 'pointer',
                color: '#333',
                fontWeight: 500
              }}>A Consultoria</a>
              <a onClick={() => scrollToSection('depoimentos')} style={{
                cursor: 'pointer',
                color: '#333',
                fontWeight: 500
              }}>Depoimentos</a>
              <a onClick={() => scrollToSection('contato')} style={{
                cursor: 'pointer',
                color: '#333',
                fontWeight: 500
              }}>Contato</a>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '10px 24px',
                  background: COLORS.dark,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 25,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                <UserOutlined /> Área do Cliente
              </button>
            </div>
          ) : (
            // Botao Hamburguer Mobile
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#333',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          )}
        </nav>

        {/* Menu Mobile Dropdown */}
        {window.innerWidth <= 768 && mobileMenuOpen && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 15,
            animation: 'slideDown 0.3s ease'
          }}>
            <a onClick={() => scrollToSection('serviços')} style={{
              cursor: 'pointer',
              color: '#333',
              fontWeight: 500,
              padding: '10px 0',
              borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>Serviços</a>
            <a onClick={() => scrollToSection('sobre')} style={{
              cursor: 'pointer',
              color: '#333',
              fontWeight: 500,
              padding: '10px 0',
              borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>Sobre</a>
            <a onClick={() => scrollToSection('consultoria')} style={{
              cursor: 'pointer',
              color: '#333',
              fontWeight: 500,
              padding: '10px 0',
              borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>A Consultoria</a>
            <a onClick={() => scrollToSection('depoimentos')} style={{
              cursor: 'pointer',
              color: '#333',
              fontWeight: 500,
              padding: '10px 0',
              borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>Depoimentos</a>
            <a onClick={() => scrollToSection('contato')} style={{
              cursor: 'pointer',
              color: '#333',
              fontWeight: 500,
              padding: '10px 0',
              borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>Contato</a>
            <button
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              style={{
                padding: '12px 24px',
                background: COLORS.dark,
                color: '#fff',
                border: 'none',
                borderRadius: 25,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <UserOutlined /> Área do Cliente
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={{
        marginTop: 80,
        minHeight: '70vh',
        background: COLORS.gradient,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          top: -100,
          right: -100
        }} />
        <div style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          bottom: -50,
          left: -50
        }} />

        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '80px 40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 20,
              backdropFilter: 'blur(10px)'
            }}>
              , BM Consultoria - Gestão Estratégica
            </div>

            <h1 style={{
              fontSize: window.innerWidth > 768 ? 56 : 36,
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 24px 0',
              lineHeight: 1.2,
              textShadow: '0 2px 20px rgba(0,0,0,0.1)'
            }}>
              Soluções Inteligentes em Gestão de Pessoas
            </h1>

            <p style={{
              fontSize: window.innerWidth > 768 ? 20 : 16,
              color: 'rgba(255,255,255,0.95)',
              marginBottom: 40,
              lineHeight: 1.6
            }}>
              Apoiamos empresas e profissionais com consultoria estratégica em Recrutamento, T&D e Desenvolvimento Humano, impulsionando resultados com excelência e inovação.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => scrollToSection('contato')}
                style={{
                  padding: '16px 40px',
                  background: '#fff',
                  color: COLORS.primary,
                  border: 'none',
                  borderRadius: 30,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
                }}
              >
                Falar com Consultor <RightOutlined />
              </button>

              <button
                onClick={() => scrollToSection('serviços')}
                style={{
                  padding: '16px 40px',
                  background: 'transparent',
                  color: '#fff',
                  border: '2px solid #fff',
                  borderRadius: 30,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Conhecer Serviços
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: 40,
              marginTop: 60,
              flexWrap: 'wrap'
            }}>
              {[
                { number: '10+', label: 'Anos de Experiência' },
                { number: '500+', label: 'Carreiras Transformadas' },
                { number: '98%', label: 'Satisfação' }
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: 8
                  }}>{stat.number}</div>
                  <div style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 20,
            padding: 40,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              padding: 30,
              textAlign: 'center'
            }}>
              <RocketOutlined style={{ fontSize: 80, color: '#fff', marginBottom: 20 }} />
              <h3 style={{ color: '#fff', fontSize: 24, margin: 0 }}>
                Nossas Áreas de Atuação
              </h3>
            </div>

            {[
              'Recrutamento e Seleção',
              'Educação Corporativa',
              'Gestão Estratégica de Carreira',
              'Mapeamento de Perfil (DISC)'
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                padding: 15,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <CheckCircleOutlined style={{ fontSize: 20 }} />
                <span style={{ fontSize: 15, fontWeight: 600 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre a BM (Consultoria) Section */}
      <section id="consultoria" style={{
        padding: window.innerWidth > 768 ? '100px 40px' : '60px 20px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{
              fontSize: window.innerWidth > 768 ? 48 : 32,
              fontWeight: 800,
              margin: '0 0 16px 0',
              color: COLORS.dark
            }}>
              Sobre a BM Consultoria
            </h2>
            <p style={{
              fontSize: window.innerWidth > 768 ? 18 : 16,
              color: '#666',
              maxWidth: 700,
              margin: '0 auto'
            }}>
              Apoiamos empresas e profissionais na busca pela excelência operacional e estratégica na gestão de pessoas.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: window.innerWidth > 768 ? 60 : 40,
            marginBottom: 60
          }}>
            {/* Missão, Visão e Valores */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: 20,
              padding: window.innerWidth > 768 ? 40 : 30,
              border: '2px solid #e9ecef'
            }}>
              <div style={{ marginBottom: 30 }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: COLORS.dark,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20
                }}>
                  <RocketOutlined style={{ fontSize: 28, color: '#fff' }} />
                </div>
                <h3 style={{
                  fontSize: window.innerWidth > 768 ? 24 : 20,
                  color: COLORS.dark,
                  marginBottom: 12
                }}>
                  Nossa Missão
                </h3>
                <p style={{
                  fontSize: window.innerWidth > 768 ? 16 : 14,
                  color: '#666',
                  lineHeight: 1.8
                }}>
                  Potencializar carreiras através de orientação estratégica, ferramentas de autoconhecimento e planejamento personalizado, promovendo o desenvolvimento integral de profissionais que buscam excelência e propósito.
                </p>
              </div>

              <div style={{ marginBottom: 30 }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20
                }}>
                  <TrophyOutlined style={{ fontSize: 28, color: '#fff' }} />
                </div>
                <h3 style={{
                  fontSize: window.innerWidth > 768 ? 24 : 20,
                  color: COLORS.dark,
                  marginBottom: 12
                }}>
                  Nossa Visão
                </h3>
                <p style={{
                  fontSize: window.innerWidth > 768 ? 16 : 14,
                  color: '#666',
                  lineHeight: 1.8
                }}>
                  Ser referência nacional em consultoria de carreira, reconhecida pela excelência no atendimento humanizado e resultados transformadores, conectando pessoas aos seus objetivos profissionais com clareza e confianca.
                </p>
              </div>

              <div>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4A6FA5 0%, #5B7BA5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20
                }}>
                  <StarOutlined style={{ fontSize: 28, color: '#fff' }} />
                </div>
                <h3 style={{
                  fontSize: window.innerWidth > 768 ? 24 : 20,
                  color: COLORS.dark,
                  marginBottom: 12
                }}>
                  Nossos Valores
                </h3>
                <div style={{
                  fontSize: window.innerWidth > 768 ? 16 : 14,
                  color: '#666',
                  lineHeight: 1.8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: COLORS.primary }} />
                    <span>Ética e Transparência</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: COLORS.primary }} />
                    <span>Excelência no Atendimento</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: COLORS.primary }} />
                    <span>Compromisso com Resultados</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: COLORS.primary }} />
                    <span>Respeito à Individualidade</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircleOutlined style={{ color: COLORS.primary }} />
                    <span>Inovação e Atualização Constante</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diferenciais */}
            <div>
              <h3 style={{
                fontSize: window.innerWidth > 768 ? 32 : 24,
                color: COLORS.dark,
                marginBottom: 30,
                fontWeight: 700
              }}>
                Por que escolher a BM Consultoria?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
                {[
                  {
                    icon: <BulbOutlined style={{ fontSize: 24 }} />,
                    title: 'Metodologia Exclusiva',
                    description: 'Combinamos ferramentas científicas de assessment com técnicas de coaching para resultados consistentes e mensuráveis.'
                  },
                  {
                    icon: <UserOutlined style={{ fontSize: 24 }} />,
                    title: 'Atendimento Personalizado',
                    description: 'Cada cliente a único. Desenvolvemos estratégias sob medida para suas necessidades, objetivos e momento de carreira.'
                  },
                  {
                    icon: <TeamOutlined style={{ fontSize: 24 }} />,
                    title: 'Experiência Corporativa',
                    description: 'Mais de 20 anos atuando em RH corporativo, com conhecimento profundo do mercado e suas demandas.'
                  },
                  {
                    icon: <SafetyOutlined style={{ fontSize: 24 }} />,
                    title: 'Ambiente Seguro e Confidencial',
                    description: 'Sigilo absoluto e espaco acolhedor para voca explorar seus desafios e aspirações sem julgamentos.'
                  },
                  {
                    icon: <ClockCircleOutlined style={{ fontSize: 24 }} />,
                    title: 'Acompanhamento Continuo',
                    description: 'Suporte durante todo o processo de transformação, com ajustes e orientações conforme voca avanca.'
                  },
                  {
                    icon: <CheckCircleOutlined style={{ fontSize: 24 }} />,
                    title: 'Resultados Comprovados',
                    description: 'Mais de 100 profissionais impactados positivamente, com histórias reais de transformação e sucesso.'
                  }
                ].map((item, i) => (
                  <div key={i} style={{
                    background: '#fff',
                    borderRadius: 15,
                    padding: 25,
                    border: '2px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    cursor: 'default'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = `2px solid ${COLORS.primary}`;
                      e.currentTarget.style.transform = 'translateX(5px)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(244, 188, 28, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '2px solid #f0f0f0';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{
                      color: COLORS.primary,
                      marginBottom: 12
                    }}>
                      {item.icon}
                    </div>
                    <h4 style={{
                      fontSize: window.innerWidth > 768 ? 18 : 16,
                      color: COLORS.dark,
                      marginBottom: 8,
                      fontWeight: 600
                    }}>
                      {item.title}
                    </h4>
                    <p style={{
                      fontSize: window.innerWidth > 768 ? 15 : 14,
                      color: '#666',
                      lineHeight: 1.6,
                      margin: 0
                    }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{
            background: COLORS.gradient,
            borderRadius: 20,
            padding: window.innerWidth > 768 ? 60 : 40,
            textAlign: 'center',
            color: '#fff'
          }}>
            <h3 style={{
              fontSize: window.innerWidth > 768 ? 36 : 28,
              marginBottom: 16,
              fontWeight: 700
            }}>
              Pronto para transformar sua carreira?
            </h3>
            <p style={{
              fontSize: window.innerWidth > 768 ? 18 : 16,
              marginBottom: 30,
              opacity: 0.95
            }}>
              Agende uma sessão de orientação gratuita e descubra como podemos te ajudar a alcançar seus objetivos profissionais.
            </p>
            <button
              onClick={() => scrollToSection('contato')}
              style={{
                padding: '16px 40px',
                background: COLORS.primary,
                color: COLORS.dark,
                border: 'none',
                borderRadius: 30,
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(244, 188, 28, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 6px 30px rgba(244, 188, 28, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(244, 188, 28, 0.4)';
              }}
            >
              Solicitar Atendimento <RightOutlined />
            </button>
          </div>
        </div>
      </section>

      {/* Serviços Section */}
      <section id="serviços" style={{
        padding: window.innerWidth > 768 ? '100px 40px' : '60px 20px',
        background: '#f8f9fa'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: window.innerWidth > 768 ? 48 : 32, fontWeight: 800, color: COLORS.dark }}>Nossos Serviços</h2>
            <p style={{ fontSize: 18, color: '#666' }}>Soluções personalizadas para empresas e profissionais</p>
          </div>

          <div style={{ marginBottom: 60 }}>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: COLORS.dark, marginBottom: 30, textAlign: 'center' }}>BM para Empresas</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? 'repeat(2, 1fr)' : '1fr', gap: 30 }}>
              {[
                { title: 'Recrutamento e Seleção', desc: 'Processos estratégicos para encontrar o talento ideal.' },
                { title: 'Desenvolvimento de Lideres', desc: 'Programas para potencializar a gestão corporativa.' },
                { title: 'Cargos e Salários', desc: 'Estruturação de trilhas de carreira e remuneração.' },
                { title: 'Treinamento in Company', desc: 'Capacitações focadas em soft skills e liderança.' }
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ fontSize: 20, fontWeight: 700, color: COLORS.dark, marginBottom: 10 }}>{s.title}</h4>
                  <p style={{ color: '#666' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: COLORS.dark, marginBottom: 30, textAlign: 'center' }}>BM para Você</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr', gap: 30 }}>
              {[
                { title: 'Consultoria de Carreira', desc: 'Sessões estratégicas para seus objetivos profissionais.' },
                { title: 'Mentoria de Liderança', desc: 'Acompanhamento para transições e novos desafios.' },
                { title: 'Testes Comportamentais', desc: 'Análises validadas para seu autoconhecimento.' }
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', padding: 30, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ fontSize: 20, fontWeight: 700, color: COLORS.dark, marginBottom: 10 }}>{s.title}</h4>
                  <p style={{ color: '#666' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" style={{ padding: '100px 40px', background: COLORS.gradient }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', color: '#fff', marginBottom: 70 }}>
            <h2 style={{ fontSize: window.innerWidth > 768 ? 48 : 32, fontWeight: 800, margin: '0 0 16px 0' }}>Nossa Expertise</h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto' }}>
              Conheça as especialistas por trás da BM Consultoria
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1fr' : '1fr', gap: 40 }}>

            {/* Bruna Morais */}
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 24,
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header do card */}
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '36px 36px 24px',
                display: 'flex',
                gap: 24,
                alignItems: 'flex-start',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  width: 110, height: 110, borderRadius: '50%',
                  overflow: 'hidden', flexShrink: 0,
                  border: `3px solid ${COLORS.primary}`,
                  boxShadow: `0 0 0 4px rgba(244,188,28,0.25)`
                }}>
                  <img src="/bruna.png" alt="Bruna Morais" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 4px 0' }}>Bruna Morais</h3>
                  <p style={{ color: COLORS.primary, fontWeight: 600, fontSize: 14, margin: '0 0 10px 0' }}>Fundadora & Consultora Master</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['RH Estrategico', 'Coach', 'Desenvolvimento de Pessoas', 'Gestão de Carreira'].map((t, i) => (
                      <span key={i} style={{ background: 'rgba(244,188,28,0.2)', color: COLORS.primary, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Corpo do mini-curriculo - Texto Corrido */}
              <div style={{ padding: '28px 36px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontSize: 14, margin: 0 }}>
                  Profissional de Recursos Humanos há mais de 20 anos, com experiência corporativa consolidada em desenvolvimento de pessoas, liderança de equipes multidisciplinares e gestão de projetos estratégicos.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontSize: 14, margin: 0 }}>
                  Experiência na implantação de áreas de T&D, Educação Corporativa, Atração e Seleção, Cultura, Ambientação e Experiência do Colaborador (EX) e do Cliente (CX), sempre com foco em resultados sustentáveis e melhoria contínua.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontSize: 14, margin: 0 }}>
                  Atua como mentora de carreira e como professora universitária nos cursos de graduação e pós-graduação nas áreas de Gestão e Educação.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontSize: 14, margin: 0 }}>
                  Mestra em Administração e Desenvolvimento Empresarial, especialista em Gestão Estratégica de Recursos Humanos, certificada em DISC, PI e PAT Perfil, e formações complementares em Orientação Profissional, Coaching e metodologia Lean Six Sigma -Belt.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontSize: 14, margin: 0 }}>
                  Com olhar atento à tecnologia e à inovação como aliadas na construção de soluções inteligentes e responsáveis para o ambiente corporativo.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontSize: 14, margin: 0 }}>
                  Casada e mãe de três, acredita e se desafia no equilíbrio entre vida pessoal e profissional ampliando a sensibilidade e capacidade de liderar com empatia.
                </p>
              </div>
            </div>

            {/* Consultora Associada (Placeholder) */}
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 24,
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header do card */}
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '36px 36px 24px',
                display: 'flex',
                gap: 24,
                alignItems: 'flex-start',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  width: 110, height: 110, borderRadius: '50%',
                  overflow: 'hidden', flexShrink: 0,
                  border: `3px solid ${COLORS.primary}`,
                  boxShadow: `0 0 0 4px rgba(244,188,28,0.25)`,
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <img src="/gabi.png" alt="Consultora Associada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 4px 0' }}>Gabriela</h3>
                  <p style={{ color: COLORS.primary, fontWeight: 600, fontSize: 14, margin: '0 0 10px 0' }}>Consultora Associada</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Recursos Humanos', 'Recrutamento & Seleção', 'Marca Empregadora'].map((t, i) => (
                      <span key={i} style={{ background: 'rgba(244,188,28,0.2)', color: COLORS.primary, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Corpo do mini-curriculo - Texto Corrido */}
              <div style={{ padding: '28px 36px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontSize: 14, margin: 0 }}>
                  Profissional sênior de Recursos Humanos especialista em Recrutamento & Seleção, com foco na atração e avaliação de talentos.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontSize: 14, margin: 0 }}>
                  Experiência na condução e estruturação de processos seletivos, com destaque para programas de estágio e trainee e iniciativas voltadas à diversidade, inclusão e empregabilidade. Ao longo de sua trajetória, já participou de processos seletivos, impactando mais de 5.000 candidatos, sempre com foco na experiência do candidato e na aderência às necessidades do negócio.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontSize: 14, margin: 0 }}>
                  Atuação consultiva junto a gestores e stakeholders, contribuindo para processos mais estruturados, humanizados e alinhados à estratégia organizacional, além de apoiar o fortalecimento da marca empregadora. Atua como ponte entre talentos e organizações, contribuindo para decisões mais assertivas e alinhadas ao negócio.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontSize: 14, margin: 0 }}>
                  Graduada em Gestão de Recursos Humanos e cursando MBA em Gestão de Pessoas com ênfase em Diversidade e Inclusão.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontSize: 14, margin: 0 }}>
                  Casada, mãe e profissional movida por propósito, acredita na construção de processos mais humanos e inclusivos como caminho para transformar relações entre talentos e organizações.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* Depoimentos Section */}
      <section id="depoimentos" style={{
        padding: '100px 40px',
        background: '#f8f9fa'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{
              fontSize: 48,
              fontWeight: 800,
              margin: '0 0 16px 0',
              color: COLORS.dark
            }}>
              O Que Dizem Nossos Clientes
            </h2>
            <p style={{ fontSize: 18, color: '#666' }}>
              Histórias reais de transformação profissional
            </p>
          </div>

          {(() => {
            const testimonials = [
              {
                name: 'Vitor Mauricio N. Silva',
                role: 'CEO - VP Consultoria e Sistemas & CIO - Edupulses',
                text: 'A Bruna a uma profissional exemplar e atendeu todas as nossas expectativas no suporte ao nosso processo seletivo. O recrutamento não a nosso core business e sem o comprometimento e profissionalismo de uma empresa capacitada a impossivel conduzir as atividades com transparência e respeito aos candidatos. Parabens ao seu time e a obrigado pela parceria!',
                rating: 5
              },
              {
                name: 'Patricia Paiva Soares',
                role: 'Analista de Informação Master | Gerente de Projeto | Business Intelligence',
                text: 'Bruna, foi um prazer ser sua cliente. Seu metodo a claro e objetivo. Cada encontro foi uma oportunidade de reflexão e crescimento. Gratidão por tudo.',
                rating: 5
              },
              {
                name: 'Renata Paladino',
                role: 'Jornalista | Internal Communication | External Communication | Digital Marketing',
                text: 'Tive o prazer de ter a Bru como consultora quando trabalhei na Approach. Ela sempre buscava identificar pontos positivos e de melhoria, contribuindo de forma positiva com o trabalho que desenvolvessemos juntas. Ela influência de forma positiva todos a sua volta e se adapta facilmente ao ambiente e as necessidades. A Bru sabe trabalhar como ninguem de forma empaÉtica e harmunica.',
                rating: 5
              },
              {
                name: 'Monica Esteves, M.Sc.',
                role: 'Socia Diretora Proengys | Conselheira IBDT | Mentora | Especialista | Docente MBA',
                text: 'Tive a oportunidade de interagir com a Bruna em um Projeto de Formação de Lideres em 2019, e pude acompanhar de perto como fornecedora, sua maturidade profissional, habilidade de construir verdadeiras aliancas, sempre com foco assertivo para alcance dos objetivos. Bruna mostra equilibrio emocional diante de situações complexas e adversas, onde se coloca de forma empaÉtica, com humildade e com disponibilidade para aprender.',
                rating: 5
              },
              {
                name: 'Thalita Gelenske',
                role: 'LinkedIn Top Voice | Forbes Under 30 | Ajudo empresas a construir cultura de Diversidade',
                text: 'Tive a oportunidade de interagir com a Bruna e ver, de perto, sua capacidade de escuta ativa, empatia e leveza. Ela tem uma habilidade excelente de dialogar, manter o interesse, direcionar a ação e forma construtiva e engajar as pessoas para a ação. ? uma excelente especialista, que oferece apoio e estimulo para definir objetivos de longo prazo.',
                rating: 5
              },
              {
                name: 'ALBA DUARTE',
                role: 'Socia, Diretora Alba Duarte Psicologia e Treinamento',
                text: 'Trabalhar com Bruna Morais no Programa de Desenvolvimento Gerencial do Estacio foi uma experiência profissional espetacular. Empatia, orientação a resultados, pensamento critico e resiliência foram competencias observadas ao longo de nossa jornada de quase dois anos de convivência. Realmente uma excelente profissional.',
                rating: 5
              }
            ];

            const nextTestimonial = () => {
              setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
            };

            const prevTestimonial = () => {
              setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
            };

            return (
              <div style={{ position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  position: 'relative'
                }}>
                  {window.innerWidth > 768 && (
                    <button
                      onClick={prevTestimonial}
                      style={{
                        position: 'absolute',
                        left: -60,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        border: 'none',
                        background: '#fff',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        color: COLORS.dark,
                        zIndex: 10,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = COLORS.primary;
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      ‹
                    </button>
                  )}

                  <div style={{
                    width: '100%',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      display: 'flex',
                      transition: 'transform 0.5s ease-in-out',
                      transform: `translateX(-${currentTestimonial * 100}%)`
                    }}>
                      {testimonials.map((depo, i) => (
                        <div key={i} style={{
                          minWidth: '100%',
                          padding: '0 10px',
                          boxSizing: 'border-box'
                        }}>
                          <div style={{
                            background: '#fff',
                            borderRadius: 16,
                            padding: window.innerWidth > 768 ? 40 : 30,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            position: 'relative',
                            minHeight: window.innerWidth > 768 ? 280 : 'auto',
                            maxHeight: window.innerWidth > 768 ? 350 : 'none',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              fontSize: 40,
                              color: COLORS.primary,
                              opacity: 0.2,
                              lineHeight: 1,
                              marginBottom: 12
                            }}>"</div>
                            <p style={{
                              fontSize: window.innerWidth > 768 ? 16 : 15,
                              color: '#666',
                              lineHeight: 1.7,
                              marginBottom: 24,
                              fontStyle: 'italic',
                              maxHeight: window.innerWidth > 768 ? '150px' : 'none',
                              overflow: window.innerWidth > 768 ? 'auto' : 'visible',
                              paddingRight: window.innerWidth > 768 ? 10 : 0
                            }}>
                              {depo.text}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                              <div style={{
                                width: 50,
                                height: 50,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1C2541 0%, #4A6FA5 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: 20,
                                flexShrink: 0
                              }}>
                                {depo.name.charAt(0)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontWeight: 700,
                                  color: '#333',
                                  fontSize: window.innerWidth > 768 ? 16 : 15
                                }}>{depo.name}</div>
                                <div style={{
                                  fontSize: window.innerWidth > 768 ? 13 : 12,
                                  color: '#666',
                                  marginTop: 4
                                }}>{depo.role}</div>
                              </div>
                            </div>
                            <div style={{ marginTop: 16 }}>
                              {[...Array(depo.rating)].map((_, j) => (
                                <StarOutlined key={j} style={{ color: '#FFD700', fontSize: 18, marginRight: 4 }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {window.innerWidth > 768 && (
                    <button
                      onClick={nextTestimonial}
                      style={{
                        position: 'absolute',
                        right: -60,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        border: 'none',
                        background: '#fff',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        color: COLORS.dark,
                        zIndex: 10,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = COLORS.primary;
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      ›
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 10,
                  marginTop: 40
                }}>
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentTestimonial(i)}
                      style={{
                        width: currentTestimonial === i ? 30 : 10,
                        height: 10,
                        borderRadius: 5,
                        border: 'none',
                        background: currentTestimonial === i ? COLORS.primary : '#ddd',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>

                {window.innerWidth <= 768 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 20,
                    marginTop: 30
                  }}>
                    <button
                      onClick={prevTestimonial}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        border: 'none',
                        background: '#fff',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        fontSize: 24,
                        color: COLORS.dark
                      }}
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextTestimonial}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        border: 'none',
                        background: '#fff',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        fontSize: 24,
                        color: COLORS.dark
                      }}
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>



      {/* Contato Section */}
      <section id="contato" style={{
        padding: '100px 40px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{
              fontSize: 48,
              fontWeight: 800,
              margin: '0 0 16px 0',
              color: COLORS.dark
            }}>
              Entre em Contato
            </h2>
            <p style={{ fontSize: 18, color: '#666' }}>
              Estamos aqui para ajudar voce
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 60
          }}>
            <div>
              <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 30 }}>
                Informações de Contato
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[
                  { icon: <WhatsAppOutlined />, label: 'WhatsApp', value: '(21) 97124-0055' },
                  { icon: <MailOutlined />, label: 'E-mail', value: 'contato@bmconsultoria.site' },
                  { icon: <PhoneOutlined />, label: 'Telefone', value: '(21) 97124-0055' }

                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 20,
                    background: '#f8f9fa',
                    borderRadius: 12
                  }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: COLORS.dark,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 20
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#333', marginBottom: 4 }}>
                        {item.label}
                      </div>
                      <div style={{ color: '#666' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 40,
                padding: 30,
                background: COLORS.dark,
                borderRadius: 16,
                color: '#fff'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: 20 }}>Redes Sociais</h4>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { icon: <LinkedinOutlined />, link: 'https://www.linkedin.com/company/bm-consultoria-de-rh/?viewAsMember=true' },
                    { icon: <InstagramOutlined />, link: 'https://www.instagram.com/bmconsultoria.rh/' },
                    { icon: <WhatsAppOutlined />, link: 'https://wa.me/5521971240055' }
                  ].map((social, i) => (
                    <a
                      key={i}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 24,
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.3)';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.2)';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              background: '#f8f9fa',
              borderRadius: 16,
              padding: 40
            }}>
              <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 30 }}>
                Envie uma Mensagem
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <input
                  type="text"
                  name="nome"
                  placeholder="Nome completo *"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    border: '2px solid #e0e0e0',
                    fontSize: 16,
                    outline: 'none',
                    transition: 'border 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="E-mail *"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    border: '2px solid #e0e0e0',
                    fontSize: 16,
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <input
                  type="tel"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  maxLength={15}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    border: '2px solid #e0e0e0',
                    fontSize: 16,
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <textarea
                  name="mensagem"
                  placeholder="Conte-nos sobre seus objetivos... *"
                  value={formData.mensagem}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    border: '2px solid #e0e0e0',
                    fontSize: 16,
                    outline: 'none',
                    resize: 'verÉtical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '16px 40px',
                    background: loading ? '#ccc' : COLORS.dark,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <LoadingOutlined spin /> Enviando...
                    </>
                  ) : (
                    <>
                      <SendOutlined /> Enviar Mensagem
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: COLORS.dark,
        color: '#fff',
        padding: '60px 40px 30px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <img
              src="/logo-footer.png"
              alt="Gestão de Carreira"
              style={{
                height: 60,
                objectFit: 'contain'
              }}
            />
          </div>

          <p style={{
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 30,
            maxWidth: 600,
            margin: '0 auto 30px'
          }}>
            Transformando carreiras e realizando sonhos profissionais há mais de 20 anos.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
            marginBottom: 30,
            flexWrap: 'wrap'
          }}>
            <a onClick={() => scrollToSection('serviços')} style={{
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
              Serviços
            </a>
            <a onClick={() => scrollToSection('sobre')} style={{
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer'
            }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
              Sobre
            </a>
            <a onClick={() => scrollToSection('depoimentos')} style={{
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer'
            }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
              Depoimentos
            </a>
            <a onClick={() => scrollToSection('contato')} style={{
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer'
            }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
              Contato
            </a>
            <a onClick={() => navigate('/login')} style={{
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer'
            }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
              Área do Cliente
            </a>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 30,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 14
          }}>
            <p style={{ margin: 0 }}>
              © 2025 BM Consultoria. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

