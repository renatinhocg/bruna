'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Breadcrumb, Progress, Button, message, Row, Col, Statistic, Tag } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../../components/AdminLayout';
import apiService from '../../../../services/api';

const { Title, Text } = Typography;

// Força renderização dinâmica (não pre-renderiza durante build)
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  resultado: string;
  cor: string;
  caracteristicas_inteligente: string;
  carreiras_associadas: string;
}

interface Resultado {
  categoria: Categoria;
  pontuacao: number;
  percentual: number;
}

interface TesteDetalhes {
  id: number;
  nome_usuario: string;
  email_usuario: string;
  concluido: boolean;
  autorizado: boolean;
  created_at: string;
  inteligencia_dominante?: string;
  pontuacao_total?: number;
  resultados?: Resultado[];
}

export default function VisualizarTeste() {
  const [teste, setTeste] = useState<TesteDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [autorizando, setAutorizando] = useState(false);
  const router = useRouter();
  const params = useParams();
  const testeId = params.id as string;

  const carregarTeste = useCallback(async () => {
    try {
      setLoading(true);
      // Forçar visualização admin para ver resultados mesmo não autorizados
      const response = await apiService.getTesteInteligencia(testeId, true);
      
      if (response.success) {
        setTeste(response.data);
      } else {
        message.error('Erro ao carregar teste');
        router.push('/multiplas-inteligencias/testes-pendentes');
      }
    } catch (error) {
      console.error('Erro ao carregar teste:', error);
      message.error('Erro ao carregar teste');
      router.push('/multiplas-inteligencias/testes-pendentes');
    } finally {
      setLoading(false);
    }
  }, [testeId, router]);

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else if (testeId) {
      carregarTeste();
    }
  }, [router, testeId, carregarTeste]);

  const autorizarTeste = async () => {
    if (!teste) return;

    try {
      setAutorizando(true);
      const response = await apiService.autorizarTesteInteligencia(teste.id);
      
      if (response.success) {
        message.success('Teste autorizado com sucesso!');
        // Recarregar dados do teste
        await carregarTeste();
      } else {
        message.error(response.message || 'Erro ao autorizar teste');
      }
    } catch (error) {
      console.error('Erro ao autorizar teste:', error);
      message.error('Erro ao autorizar teste');
    } finally {
      setAutorizando(false);
    }
  };

  const voltarParaLista = () => {
    router.push('/multiplas-inteligencias/testes-pendentes');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Title level={3}>Carregando teste...</Title>
        </div>
      </AdminLayout>
    );
  }

  if (!teste) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Title level={3}>Teste não encontrado</Title>
          <Button onClick={voltarParaLista}>Voltar à Lista</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Breadcrumb 
          style={{ marginBottom: 16 }}
          items={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Múltiplas Inteligências', href: '/multiplas-inteligencias' },
            { title: 'Testes Pendentes', href: '/multiplas-inteligencias/testes-pendentes' },
            { title: `Teste #${teste.id}` }
          ]}
        />

        {/* Cabeçalho com informações do usuário */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Teste de Múltiplas Inteligências #{teste.id}
              </Title>
              <Text type="secondary">
                Realizado em {new Date(teste.created_at).toLocaleString('pt-BR')}
              </Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              {teste.autorizado ? (
                <Tag color="green" icon={<CheckOutlined />} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  Autorizado
                </Tag>
              ) : (
                <Tag color="orange" icon={<ClockCircleOutlined />} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  Aguardando Autorização
                </Tag>
              )}
            </div>
          </div>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Statistic title="Nome do Usuário" value={teste.nome_usuario} />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic title="E-mail" value={teste.email_usuario} />
            </Col>
          </Row>

          {teste.inteligencia_dominante && (
            <Row gutter={24} style={{ marginTop: 16 }}>
              <Col xs={24} sm={12}>
                <Statistic title="Inteligência Dominante" value={teste.inteligencia_dominante} />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic title="Pontuação Total" value={teste.pontuacao_total} />
              </Col>
            </Row>
          )}
        </Card>

        {/* Resultados por Categoria */}
        {teste.resultados ? (
          <Card title="Resultados por Categoria">
            <Row gutter={[16, 16]}>
              {teste.resultados.map((resultado, index) => (
                <Col xs={24} sm={12} lg={8} key={resultado.categoria.id}>
                  <Card 
                    size="small" 
                    style={{ 
                      height: '100%',
                      border: index === 0 ? `2px solid ${resultado.categoria.cor}` : '1px solid #d9d9d9'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <Title level={5} style={{ margin: 0, color: resultado.categoria.cor }}>
                        {resultado.categoria.nome}
                      </Title>
                      {index === 0 && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          🏆 Inteligência Dominante
                        </Text>
                      )}
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <Title level={3} style={{ margin: 0, color: resultado.categoria.cor }}>
                        {resultado.percentual.toFixed(1)}%
                      </Title>
                      <Text type="secondary">{resultado.pontuacao} pontos</Text>
                    </div>

                    <Progress 
                      percent={resultado.percentual} 
                      strokeColor={resultado.categoria.cor}
                      showInfo={false}
                      style={{ marginBottom: 16 }}
                    />

                    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                      <Text style={{ color: '#666' }}>
                        {resultado.categoria.descricao}
                      </Text>
                    </div>

                    {index === 0 && (
                      <div style={{ 
                        marginTop: 12, 
                        padding: 12, 
                        backgroundColor: `${resultado.categoria.cor}15`, 
                        borderRadius: 4,
                        border: `1px solid ${resultado.categoria.cor}30`
                      }}>
                        <Text style={{ fontSize: '11px', fontWeight: '500' }}>
                          {resultado.categoria.resultado}
                        </Text>
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <ClockCircleOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: 16 }} />
              <Title level={4}>Resultados Não Disponíveis</Title>
              <Text>
                Não foi possível carregar os resultados deste teste.
              </Text>
            </div>
          </Card>
        )}

        {/* Botões de Ação */}
        <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={voltarParaLista}
          >
            Voltar à Lista
          </Button>
          
          {!teste.autorizado && (
            <Button 
              type="primary"
              icon={<CheckOutlined />}
              loading={autorizando}
              onClick={autorizarTeste}
            >
              Autorizar Teste
            </Button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
