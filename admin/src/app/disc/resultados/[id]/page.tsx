'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Descriptions, Tag, Row, Col, Breadcrumb, message, Spin, Button, Space, Progress } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../../components/AdminLayout';
import apiService from '../../../../services/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
}

interface TesteDISC {
  id: number;
  usuario_id: number;
  concluido: boolean;
  autorizado: boolean;
  pontuacao_d: number;
  pontuacao_i: number;
  pontuacao_s: number;
  pontuacao_c: number;
  percentual_d: number;
  percentual_i: number;
  percentual_s: number;
  percentual_c: number;
  perfil_primario: string;
  perfil_secundario: string;
  estilo_combinado: string;
  iniciado_em: string;
  concluido_em: string;
  created_at: string;
  usuario: Usuario;
}

export default function DetalhesResultadoDISCPage() {
  const [resultado, setResultado] = useState<TesteDISC | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const testeId = params?.id as string;

  const fetchDetalhes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getResultadoDISCById(testeId);
      
      if (response) {
        setResultado(response);
      } else {
        message.error('Resultado não encontrado');
        router.push('/disc/resultados');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      message.error('Erro ao buscar detalhes do resultado');
      router.push('/disc/resultados');
    } finally {
      setLoading(false);
    }
  }, [testeId, router]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else if (testeId) {
      fetchDetalhes();
    }
  }, [testeId, router, fetchDetalhes]);

  const getPerfilColor = (perfil: string): string => {
    const cores: { [key: string]: string } = {
      'D': '#ff4d4f',
      'I': '#faad14',
      'S': '#52c41a',
      'C': '#1890ff'
    };
    return cores[perfil] || '#999';
  };

  const getPerfilNome = (perfil: string): string => {
    const nomes: { [key: string]: string } = {
      'D': 'Dominância',
      'I': 'Influência',
      'S': 'Estabilidade',
      'C': 'Conformidade'
    };
    return nomes[perfil] || perfil;
  };

  const getPerfilDescricao = (estilo: string): { titulo: string; descricao: string; caracteristicas: string[] } => {
    const perfis: { [key: string]: { titulo: string; descricao: string; caracteristicas: string[] } } = {
      'DI': {
        titulo: 'Inspirador/Criativo',
        descricao: 'Combina assertividade com sociabilidade. É dinâmico, persuasivo e gosta de liderar através da influência.',
        caracteristicas: ['Visionário', 'Energético', 'Persuasivo', 'Orientado para resultados', 'Comunicativo']
      },
      'ID': {
        titulo: 'Comunicador Assertivo',
        descricao: 'Excelente em networking e vendas. Combina carisma com determinação.',
        caracteristicas: ['Carismático', 'Ambicioso', 'Sociável', 'Competitivo', 'Entusiasta']
      },
      'DS': {
        titulo: 'Executor Estável',
        descricao: 'Equilibra força com paciência. Persistente e confiável em alcançar objetivos.',
        caracteristicas: ['Determinado', 'Calmo', 'Persistente', 'Confiável', 'Focado']
      },
      'SD': {
        titulo: 'Apoiador Assertivo',
        descricao: 'Combina lealdade com iniciativa. Trabalha de forma consistente e decisiva.',
        caracteristicas: ['Leal', 'Proativo', 'Consistente', 'Prático', 'Resiliente']
      },
      'DC': {
        titulo: 'Perfeccionista Decisivo',
        descricao: 'Foca em qualidade e resultados. Analítico e orientado para conquistas.',
        caracteristicas: ['Meticuloso', 'Ambicioso', 'Analítico', 'Exigente', 'Estratégico']
      },
      'CD': {
        titulo: 'Analista Assertivo',
        descricao: 'Combina precisão com ação. Busca excelência através de métodos estruturados.',
        caracteristicas: ['Preciso', 'Decidido', 'Sistemático', 'Crítico', 'Objetivo']
      },
      'IS': {
        titulo: 'Conselheiro',
        descricao: 'Caloroso e prestativo. Excelente em construir relacionamentos e apoiar equipes.',
        caracteristicas: ['Empático', 'Otimista', 'Colaborativo', 'Paciente', 'Motivador']
      },
      'SI': {
        titulo: 'Facilitador',
        descricao: 'Estável e amigável. Trabalha bem em equipe e mantém harmonia.',
        caracteristicas: ['Harmonioso', 'Sociável', 'Leal', 'Gentil', 'Acolhedor']
      },
      'IC': {
        titulo: 'Articulador',
        descricao: 'Combina criatividade com atenção aos detalhes. Comunicativo e organizado.',
        caracteristicas: ['Criativo', 'Detalhista', 'Expressivo', 'Organizado', 'Versátil']
      },
      'CI': {
        titulo: 'Pesquisador Social',
        descricao: 'Analítico mas sociável. Gosta de compartilhar conhecimento.',
        caracteristicas: ['Curioso', 'Comunicativo', 'Metódico', 'Educado', 'Informativo']
      },
      'SC': {
        titulo: 'Especialista',
        descricao: 'Paciente e preciso. Excelente em trabalhos que requerem consistência e qualidade.',
        caracteristicas: ['Confiável', 'Preciso', 'Paciente', 'Sistemático', 'Dedicado']
      },
      'CS': {
        titulo: 'Planejador',
        descricao: 'Metódico e estável. Planeja cuidadosamente antes de agir.',
        caracteristicas: ['Cauteloso', 'Estável', 'Organizado', 'Diligente', 'Reflexivo']
      }
    };

    return perfis[estilo] || {
      titulo: estilo,
      descricao: 'Perfil único combinando diferentes características.',
      caracteristicas: ['Versátil', 'Adaptável', 'Equilibrado']
    };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" tip="Carregando detalhes..." />
        </div>
      </AdminLayout>
    );
  }

  if (!resultado) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px' }}>
          <Card>
            <p>Resultado não encontrado.</p>
            <Button onClick={() => router.push('/disc/resultados')}>Voltar</Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const perfilInfo = getPerfilDescricao(resultado.estilo_combinado);

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item href="/dashboard">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/disc/resultados">
            Resultados DISC
          </Breadcrumb.Item>
          <Breadcrumb.Item>Detalhes</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/disc/resultados')}
            >
              Voltar
            </Button>
          </Space>
        </div>

        <h1 style={{ marginBottom: 24 }}>Resultado do Teste DISC</h1>

        {/* Informações do Usuário */}
        <Card 
          title="Informações do Participante" 
          style={{ marginBottom: 16 }}
          extra={<UserOutlined style={{ fontSize: 20 }} />}
        >
          <Descriptions column={2}>
            <Descriptions.Item label="Nome">{resultado.usuario?.nome || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Email">{resultado.usuario?.email || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Telefone">{resultado.usuario?.telefone || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Data de Conclusão">
              {new Date(resultado.concluido_em).toLocaleString('pt-BR')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Perfil e Pontuações */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="Perfil Comportamental" style={{ height: '100%' }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <h3>Perfil Primário</h3>
                  <Tag color={getPerfilColor(resultado.perfil_primario)} style={{ fontSize: 16, padding: '8px 16px' }}>
                    {resultado.perfil_primario} - {getPerfilNome(resultado.perfil_primario)}
                  </Tag>
                </div>
                <div>
                  <h3>Perfil Secundário</h3>
                  <Tag color={getPerfilColor(resultado.perfil_secundario)} style={{ fontSize: 16, padding: '8px 16px' }}>
                    {resultado.perfil_secundario} - {getPerfilNome(resultado.perfil_secundario)}
                  </Tag>
                </div>
                <div>
                  <h3>Estilo Combinado</h3>
                  <Tag color="purple" style={{ fontSize: 16, padding: '8px 16px' }}>
                    {resultado.estilo_combinado}
                  </Tag>
                  <div style={{ marginTop: 16 }}>
                    <h4>{perfilInfo.titulo}</h4>
                    <p>{perfilInfo.descricao}</p>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Pontuações Detalhadas" style={{ height: '100%' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span><strong>D</strong> - Dominância</span>
                    <span>{resultado.pontuacao_d} pts ({resultado.percentual_d.toFixed(1)}%)</span>
                  </div>
                  <Progress percent={resultado.percentual_d} strokeColor="#ff4d4f" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span><strong>I</strong> - Influência</span>
                    <span>{resultado.pontuacao_i} pts ({resultado.percentual_i.toFixed(1)}%)</span>
                  </div>
                  <Progress percent={resultado.percentual_i} strokeColor="#faad14" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span><strong>S</strong> - Estabilidade</span>
                    <span>{resultado.pontuacao_s} pts ({resultado.percentual_s.toFixed(1)}%)</span>
                  </div>
                  <Progress percent={resultado.percentual_s} strokeColor="#52c41a" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span><strong>C</strong> - Conformidade</span>
                    <span>{resultado.pontuacao_c} pts ({resultado.percentual_c.toFixed(1)}%)</span>
                  </div>
                  <Progress percent={resultado.percentual_c} strokeColor="#1890ff" />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Características */}
        <Card title="Características Principais">
          <Row gutter={[16, 16]}>
            {perfilInfo.caracteristicas.map((carac, index) => (
              <Col key={index} xs={12} sm={8} md={6}>
                <Tag color="blue" style={{ width: '100%', textAlign: 'center', padding: '8px' }}>
                  {carac}
                </Tag>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </AdminLayout>
  );
}
