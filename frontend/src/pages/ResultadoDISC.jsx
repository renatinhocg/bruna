import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Progress, Tag, Button, Spin, Alert, Divider } from 'antd';
import { 
  BarChartOutlined, 
  TrophyOutlined, 
  UserOutlined,
  ArrowLeftOutlined,
  DownloadOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import API_BASE_URL from '../config/api';
import './ResultadoDISC.css';

const { Title, Text, Paragraph } = Typography;

const ResultadoDISC = () => {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    buscarResultado();
  }, []);

  const buscarResultado = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/testes-disc/meu-resultado`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResultado(data);
      } else {
        navigate('/cliente/teste-disc');
      }
    } catch (error) {
      console.error('Erro ao buscar resultado:', error);
      navigate('/cliente/teste-disc');
    } finally {
      setLoading(false);
    }
  };

  const getDescricaoPerfil = (perfil) => {
    const descricoes = {
      'D': {
        nome: 'Dominância',
        resumo: 'Você é uma pessoa focada em resultados, direta e determinada.',
        caracteristicas: [
          'Orientado para resultados e conquistas',
          'Toma decisões rápidas e assertivas',
          'Gosta de desafios e competições',
          'Direto na comunicação',
          'Prefere autonomia e controle'
        ],
        pontoFortes: [
          'Liderança natural',
          'Iniciativa e proatividade',
          'Capacidade de resolver problemas',
          'Foco em metas',
          'Confiança em si mesmo'
        ],
        pontosAtencao: [
          'Pode ser percebido como autoritário',
          'Impaciência com detalhes',
          'Dificuldade em delegar',
          'Pode ignorar sentimentos alheios'
        ],
        carreiras: [
          'Executivo/CEO',
          'Empreendedor',
          'Gerente de Projetos',
          'Vendedor',
          'Advogado'
        ]
      },
      'I': {
        nome: 'Influência',
        resumo: 'Você é uma pessoa comunicativa, entusiasta e inspiradora.',
        caracteristicas: [
          'Comunicativo e expressivo',
          'Otimista e entusiasmado',
          'Gosta de trabalhar em equipe',
          'Persuasivo e influente',
          'Busca reconhecimento social'
        ],
        pontoFortes: [
          'Excelente comunicador',
          'Capacidade de motivar pessoas',
          'Criatividade',
          'Networking natural',
          'Energia positiva'
        ],
        pontosAtencao: [
          'Pode ser desorganizado',
          'Dificuldade com tarefas repetitivas',
          'Tendência a prometer demais',
          'Falta de foco em detalhes'
        ]
      },
      'S': {
        nome: 'Estabilidade',
        resumo: 'Você é uma pessoa paciente, leal e harmoniosa.',
        caracteristicas: [
          'Paciente e calmo',
          'Leal e confiável',
          'Prefere estabilidade',
          'Trabalha bem em equipe',
          'Bom ouvinte'
        ],
        pontoFortes: [
          'Confiabilidade',
          'Paciência',
          'Cooperação',
          'Consistência',
          'Empatia'
        ],
        pontosAtencao: [
          'Resistência a mudanças',
          'Dificuldade em dizer não',
          'Evita conflitos',
          'Pode ser muito conformista'
        ]
      },
      'C': {
        nome: 'Conformidade',
        resumo: 'Você é uma pessoa analítica, precisa e sistemática.',
        caracteristicas: [
          'Analítico e detalhista',
          'Preciso e sistemático',
          'Busca qualidade',
          'Segue regras e procedimentos',
          'Pensamento lógico'
        ],
        pontoFortes: [
          'Atenção aos detalhes',
          'Pensamento crítico',
          'Organização',
          'Qualidade no trabalho',
          'Planejamento'
        ],
        pontosAtencao: [
          'Perfeccionismo excessivo',
          'Dificuldade com prazos apertados',
          'Pode ser muito crítico',
          'Evita riscos'
        ]
      }
    };

    return descricoes[perfil] || null;
  };

  const getDescricaoPerfilCombinado = (estiloCombinado) => {
    const descricoes = {
      'DI': {
        nome: 'Inspirador',
        resumo: 'Combinação de determinação com carisma e entusiasmo.',
        caracteristicas: [
          'Líder natural que motiva equipes',
          'Orientado para resultados com toque pessoal',
          'Comunicativo e direto ao mesmo tempo',
          'Toma decisões rápidas considerando impacto nas pessoas',
          'Energia contagiante focada em objetivos'
        ]
      },
      'ID': {
        nome: 'Inspirador',
        resumo: 'Equilibra influência pessoal com busca por resultados.',
        caracteristicas: [
          'Persuasivo e determinado',
          'Networking voltado para conquistas',
          'Entusiasta com foco em metas',
          'Motivador que cobra resultados',
          'Criativo na solução de problemas'
        ]
      },
      'DS': {
        nome: 'Agente de Mudança',
        resumo: 'Combina determinação com consideração pelas pessoas.',
        caracteristicas: [
          'Liderança firme mas empática',
          'Busca resultados mantendo harmonia',
          'Decidido porém paciente quando necessário',
          'Equilibra urgência com estabilidade',
          'Respeita o ritmo da equipe'
        ]
      },
      'SD': {
        nome: 'Agente de Mudança',
        resumo: 'Estabilidade com iniciativa para mudanças necessárias.',
        caracteristicas: [
          'Confiável mas não evita desafios',
          'Paciência estratégica',
          'Suporta equipe em momentos decisivos',
          'Lealdade com assertividade',
          'Calmo mas determinado'
        ]
      },
      'DC': {
        nome: 'Desafiador',
        resumo: 'Determinação aliada à precisão e planejamento.',
        caracteristicas: [
          'Orientado para resultados com qualidade',
          'Decisões baseadas em dados',
          'Exigente consigo e com outros',
          'Planejamento estratégico eficaz',
          'Foco em excelência'
        ]
      },
      'CD': {
        nome: 'Desafiador',
        resumo: 'Análise criteriosa com capacidade de execução.',
        caracteristicas: [
          'Perfeccionismo produtivo',
          'Organização voltada para ação',
          'Crítico mas não paralisa',
          'Qualidade com senso de urgência',
          'Sistemático e determinado'
        ]
      },
      'IS': {
        nome: 'Conselheiro',
        resumo: 'Influência positiva combinada com empatia e suporte.',
        caracteristicas: [
          'Comunicativo e acolhedor',
          'Motivador que ouve com atenção',
          'Otimista e confiável',
          'Trabalho em equipe natural',
          'Energia positiva estável'
        ]
      },
      'SI': {
        nome: 'Conselheiro',
        resumo: 'Estabilidade com habilidade de influenciar positivamente.',
        caracteristicas: [
          'Paciente e persuasivo',
          'Confiável e entusiasmado',
          'Suporte constante à equipe',
          'Lealdade inspiradora',
          'Consistência com criatividade'
        ]
      },
      'IC': {
        nome: 'Motivador',
        resumo: 'Entusiasmo direcionado por planejamento e organização.',
        caracteristicas: [
          'Comunicação estruturada',
          'Criatividade com método',
          'Persuasão baseada em fatos',
          'Otimismo realista',
          'Networking estratégico'
        ]
      },
      'CI': {
        nome: 'Motivador',
        resumo: 'Precisão com capacidade de engajar pessoas.',
        caracteristicas: [
          'Analítico mas não distante',
          'Organização com carisma',
          'Detalhista que comunica bem',
          'Qualidade com empatia',
          'Sistemático e inspirador'
        ]
      },
      'SC': {
        nome: 'Especialista',
        resumo: 'Estabilidade com atenção aos detalhes e qualidade.',
        caracteristicas: [
          'Confiável e preciso',
          'Paciência meticulosa',
          'Trabalho consistente com qualidade',
          'Leal aos processos',
          'Calmaria organizada'
        ]
      },
      'CS': {
        nome: 'Especialista',
        resumo: 'Precisão com consideração e estabilidade.',
        caracteristicas: [
          'Organizado e colaborativo',
          'Detalhista paciente',
          'Qualidade com empatia',
          'Sistemático mas flexível',
          'Planejamento harmônico'
        ]
      }
    };

    return descricoes[estiloCombinado] || {
      nome: 'Perfil Único',
      resumo: 'Combinação equilibrada de características.',
      caracteristicas: ['Perfil equilibrado entre os fatores']
    };
  };

  const getFatorColor = (fator) => {
    const cores = {
      'D': '#ff4d4f',
      'I': '#faad14',
      'S': '#52c41a',
      'C': '#1890ff'
    };
    return cores[fator] || '#999';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Carregando seu resultado...</p>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div style={{ padding: '40px 20px' }}>
        <Alert
          message="Resultado não encontrado"
          description="Você ainda não fez o teste DISC. Clique no botão abaixo para iniciar."
          type="info"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/cliente/teste-disc')}>
              Fazer Teste
            </Button>
          }
        />
      </div>
    );
  }

  const perfilPrimario = getDescricaoPerfil(resultado.perfil_primario);
  const perfilSecundario = getDescricaoPerfil(resultado.perfil_secundario);

  const dadosGraficoRadar = [
    {
      fator: 'Dominância',
      valor: resultado.percentual_d,
      fullMark: 100
    },
    {
      fator: 'Influência',
      valor: resultado.percentual_i,
      fullMark: 100
    },
    {
      fator: 'Estabilidade',
      valor: resultado.percentual_s,
      fullMark: 100
    },
    {
      fator: 'Conformidade',
      valor: resultado.percentual_c,
      fullMark: 100
    }
  ];

  const dadosGraficoBarra = [
    {
      fator: 'D',
      nome: 'Dominância',
      pontos: resultado.pontuacao_d,
      percentual: resultado.percentual_d
    },
    {
      fator: 'I',
      nome: 'Influência',
      pontos: resultado.pontuacao_i,
      percentual: resultado.percentual_i
    },
    {
      fator: 'S',
      nome: 'Estabilidade',
      pontos: resultado.pontuacao_s,
      percentual: resultado.percentual_s
    },
    {
      fator: 'C',
      nome: 'Conformidade',
      pontos: resultado.pontuacao_c,
      percentual: resultado.percentual_c
    }
  ];

  const cores = ['#ff4d4f', '#faad14', '#52c41a', '#1890ff'];

  return (
    <div className="resultado-disc-container">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/cliente/testes')}
          style={{ marginBottom: 16 }}
        >
          Voltar
        </Button>

        <Card style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <TrophyOutlined style={{ fontSize: 64, color: '#faad14' }} />
            <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
              Seu Perfil DISC
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Concluído em {new Date(resultado.concluido_em).toLocaleDateString('pt-BR')}
            </Text>
          </div>

          <Divider />

          <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
            <Col xs={24} md={12}>
              <Card className="perfil-primario-card" style={{ height: '100%', borderTop: `4px solid ${getFatorColor(resultado.perfil_primario)}` }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Tag color={getFatorColor(resultado.perfil_primario).replace('#', '')} style={{ fontSize: 16, padding: '4px 16px' }}>
                    Perfil Primário
                  </Tag>
                  <Title level={3} style={{ marginTop: 12 }}>
                    {resultado.perfil_primario} - {perfilPrimario?.nome}
                  </Title>
                  <Text type="secondary">{perfilPrimario?.resumo}</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card style={{ height: '100%', borderTop: `4px solid ${getFatorColor(resultado.perfil_secundario)}` }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Tag color={getFatorColor(resultado.perfil_secundario).replace('#', '')} style={{ fontSize: 16, padding: '4px 16px' }}>
                    Perfil Secundário
                  </Tag>
                  <Title level={3} style={{ marginTop: 12 }}>
                    {resultado.perfil_secundario} - {perfilSecundario?.nome}
                  </Title>
                  <Text type="secondary">Estilo Combinado: <strong>{resultado.estilo_combinado}</strong></Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Gráfico Radar - Perfil DISC" style={{ height: '100%' }}>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={dadosGraficoRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="fator" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name="Seu Perfil" 
                    dataKey="valor" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Pontuação por Fator" style={{ height: '100%' }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dadosGraficoBarra}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fator" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="percentual" name="Percentual (%)">
                    {dadosGraficoBarra.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={cores[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <Divider />

              {dadosGraficoBarra.map((item, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>{item.nome}</Text>
                    <Text>{item.percentual.toFixed(1)}%</Text>
                  </div>
                  <Progress 
                    percent={item.percentual} 
                    strokeColor={cores[index]}
                    showInfo={false}
                  />
                </div>
              ))}
            </Card>
          </Col>
        </Row>

        {perfilPrimario && (
          <>
            <Card title={`Detalhes do Perfil ${resultado.perfil_primario} - ${perfilPrimario.nome}`} style={{ marginTop: 24 }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Title level={4}>✅ Características</Title>
                  <ul>
                    {perfilPrimario.caracteristicas.map((item, index) => (
                      <li key={index}><Text>{item}</Text></li>
                    ))}
                  </ul>

                  <Title level={4} style={{ marginTop: 24 }}>💪 Pontos Fortes</Title>
                  <ul>
                    {perfilPrimario.pontoFortes.map((item, index) => (
                      <li key={index}><Text strong style={{ color: '#52c41a' }}>{item}</Text></li>
                    ))}
                  </ul>
                </Col>

                <Col xs={24} md={12}>
                  <Title level={4}>⚠️ Pontos de Atenção</Title>
                  <ul>
                    {perfilPrimario.pontosAtencao.map((item, index) => (
                      <li key={index}><Text style={{ color: '#faad14' }}>{item}</Text></li>
                    ))}
                  </ul>
                </Col>
              </Row>
            </Card>

            {resultado.estilo_combinado && (
              <Card 
                title={
                  <div>
                    <Tag color="purple" style={{ fontSize: 16, padding: '4px 16px', marginRight: 8 }}>
                      Perfil Combinado
                    </Tag>
                    <span>{resultado.estilo_combinado} - {getDescricaoPerfilCombinado(resultado.estilo_combinado).nome}</span>
                  </div>
                }
                style={{ marginTop: 24 }}
              >
                <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
                  <strong>{getDescricaoPerfilCombinado(resultado.estilo_combinado).resumo}</strong>
                </Paragraph>

                <Title level={4}>🎯 Características do Estilo {resultado.estilo_combinado}</Title>
                <ul>
                  {getDescricaoPerfilCombinado(resultado.estilo_combinado).caracteristicas.map((item, index) => (
                    <li key={index}>
                      <Text style={{ fontSize: 15 }}>{item}</Text>
                    </li>
                  ))}
                </ul>

                <Alert
                  message="Perfil Combinado"
                  description={`Seu perfil ${resultado.estilo_combinado} representa a combinação única entre seus dois fatores dominantes. Esta combinação molda sua forma de agir, se comunicar e tomar decisões no dia a dia.`}
                  type="info"
                  showIcon
                  style={{ marginTop: 24 }}
                />
              </Card>
            )}
          </>
        )}

        <Card style={{ marginTop: 24, textAlign: 'center' }}>
          <Title level={4}>Quer saber mais sobre seu perfil?</Title>
          <Paragraph>
            Agende uma sessão de coaching para aprofundar o conhecimento sobre seu perfil DISC 
            e como aplicá-lo no seu desenvolvimento profissional e pessoal.
          </Paragraph>
          <Button type="primary" size="large" onClick={() => navigate('/agendar-sessao')}>
            Agendar Sessão de Coaching
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ResultadoDISC;
