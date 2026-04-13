
"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Statistic, Space, Tag, Row, Col, Progress, Breadcrumb, message, Modal } from 'antd';
import { BarChartOutlined, EyeOutlined, UserOutlined, CheckCircleOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../../components/AdminLayout';
import apiService from '../../../../services/api';

// Força renderização dinâmica (não pre-renderiza durante build)
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface Usuario {
  id: number;
  nome: string;
  email: string;
  avatar_url?: string;
}

interface Categoria {
  id: number;
  nome: string;
  cor?: string;
  caracteristicas_inteligente?: string[];
  carreiras_associadas?: string[];
  _count?: {
    perguntas: number;
  };
}

interface Resultado {
  id: number;
  usuario: Usuario;
  categoria: Categoria;
  pontuacao: number;
  percentual?: number;
  nivel?: string;
  status: string;
  pontuacao_maxima?: number;
  observacoes?: string;
  data_teste: string;
  created_at: string;
  autorizado?: boolean;
  _count?: {
    respostas: number;
  };
}

interface DetalhesResultado extends Resultado {
  respostas: {
    pergunta: {
      id: number;
      texto: string;
      ordem: number;
      categoria_id: number;
    };
    possibilidade: {
      id: number;
      texto: string;
      valor: number;
    };
    valor_resposta: number;
  }[];
}

export default function ResultadosUsuarioPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  interface TesteUsuario {
    id: number;
    concluido: boolean;
    autorizado: boolean;
    // Adicione outros campos conforme necessário
  }
  const [testeUsuario, setTesteUsuario] = useState<TesteUsuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [detalhesResultado, setDetalhesResultado] = useState<DetalhesResultado | null>(null);
  const [modalDetalheVisible, setModalDetalheVisible] = useState(false);
  const router = useRouter();
  const params = useParams();

  // Abre o modal de detalhes para o resultado selecionado (busca respostas detalhadas)
  const handleViewDetalhes = async (resultado: Resultado) => {
    setLoading(true);
    try {
      const response = await apiService.getResultado(resultado.id);
      if (response && response.success && response.data) {
        setDetalhesResultado(response.data);
      } else {
        setDetalhesResultado(resultado as DetalhesResultado);
      }
      setModalDetalheVisible(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      setDetalhesResultado(resultado as DetalhesResultado);
      setModalDetalheVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      fetchResultadosUsuario();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, params.usuarioId]);

  const fetchResultadosUsuario = async () => {
    try {
      setLoading(true);
  // Buscar resultados do usuário (admin)
  const response = await apiService.getResultadosUsuario(params.usuarioId);
      // Buscar teste mais recente do usuário
      const respTeste = await apiService.request(`/testes-inteligencia?usuario_id=${params.usuarioId}&limit=1`);
      const teste = respTeste?.data?.[0] || null;
      setTesteUsuario(teste);
      if (response.success) {
        const todosResultados = response.data || [];
        const resultadosUsuario = todosResultados.filter((r: Resultado) => r.usuario.id.toString() === params.usuarioId);
        if (resultadosUsuario.length > 0) {
          setResultados(resultadosUsuario);
          setUsuario(resultadosUsuario[0].usuario);
        } else {
          message.error('Nenhum resultado encontrado para este usuário');
        }
      } else {
        message.error('Erro ao carregar resultados do usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar resultados:', error);
      message.error('Erro ao carregar resultados do usuário');
    } finally {
      setLoading(false);
    }
  };
  const handleAprovar = async () => {
    try {
      setLoading(true);
      if (!usuario?.id) throw new Error('Usuário não encontrado');
      // Buscar o teste mais recente do usuário
      const resp = await apiService.request(`/testes-inteligencia?usuario_id=${usuario.id}&limit=1`);
      const teste = resp?.data?.[0];
      console.log('Teste retornado para autorização:', teste);
      if (!teste?.id) {
        message.error('Teste do usuário não encontrado.');
        setLoading(false);
        return;
      }
      if (!teste.concluido) {
        message.error('O teste ainda não foi concluído pelo usuário.');
        setLoading(false);
        return;
      }
      if (teste.autorizado) {
        message.info('O teste já está autorizado.');
        setLoading(false);
        return;
      }
      await apiService.autorizarResultado(teste.id);
      await fetchResultadosUsuario();
      message.success({
        content: 'Teste autorizado com sucesso!',
        duration: 4
      });
    } catch (error) {
      console.error('Erro ao autorizar teste:', error);
      message.error('Erro ao autorizar teste completo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async () => {
    console.log('handleDeletar chamado', { testeUsuario, usuario });
    
    if (!window.confirm(`Tem certeza que deseja deletar TODOS os testes de ${usuario?.nome}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      console.log('Iniciando deleção do teste ID:', testeUsuario?.id);
      setLoading(true);
      if (!testeUsuario?.id) {
        message.error('Teste não encontrado');
        return;
      }
      
      const response = await apiService.deletarTesteInteligencia(testeUsuario.id);
      console.log('Resposta da deleção:', response);
      
      if (response.success) {
        message.success('Teste deletado com sucesso!');
        router.push('/multiplas-inteligencias/resultados');
      } else {
        message.error('Erro ao deletar teste');
      }
    } catch (error) {
      console.error('Erro ao deletar teste:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      message.error('Erro ao deletar teste: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Breadcrumb 
          style={{ marginBottom: 16 }}
          items={[
            {
              title: 'Dashboard',
              href: '/dashboard',
            },
            {
              title: 'Múltiplas Inteligências',
              href: '/multiplas-inteligencias',
            },
            {
              title: 'Resultados',
              href: '/multiplas-inteligencias/resultados',
            },
            {
              title: usuario?.nome || 'Usuário',
            },
          ]}
        />

        {usuario && (
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Usuário"
                  value={usuario.nome}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Email"
                  value={usuario.email}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Inteligência Dominante"
                  value={(() => {
                    if (!resultados.length) return '-';
                    const dominante = resultados.reduce((max, r) => ((r.percentual || 0) > (max.percentual || 0) ? r : max), resultados[0]);
                    return dominante.categoria?.nome || '-';
                  })()}
                  prefix={<BarChartOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Status do Teste"
                  value={testeUsuario?.autorizado ? 'AUTORIZADO' : 'PENDENTE'}
                  valueStyle={{ 
                    color: testeUsuario?.autorizado ? '#52c41a' : '#faad14'
                  }}
                  prefix={testeUsuario?.autorizado ? <CheckCircleOutlined /> : <BarChartOutlined />}
                />
              </Col>
            </Row>
          </Card>
        )}

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <BarChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                Resultados de {usuario?.nome || 'Usuário'}
              </h2>
              <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                Gerencie os resultados dos testes de múltiplas inteligências deste usuário
              </p>
            </div>
            <Space>
              {resultados.length > 0 && !resultados.every(r => r.autorizado) && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="large"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  onClick={handleAprovar}
                  loading={loading}
                >
                  Autorizar Teste Completo
                </Button>
              )}
              {resultados.length > 0 && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeletar}
                  loading={loading}
                >
                  Deletar Teste
                </Button>
              )}
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/multiplas-inteligencias/resultados')}
              >
                Voltar
              </Button>
            </Space>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Statistic title="Carregando..." value="" />
            </div>
          ) : resultados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Statistic title="Nenhum resultado encontrado" value="" />
            </div>
          ) : (
            <>
              {(() => {
                // Agrupar resultados por data do teste
                const resultadosPorData: { [key: string]: Resultado[] } = {};
                
                resultados.forEach((resultado) => {
                  const data = new Date(resultado.data_teste).toLocaleDateString('pt-BR');
                  if (!resultadosPorData[data]) {
                    resultadosPorData[data] = [];
                  }
                  resultadosPorData[data].push(resultado);
                });

                // Ordenar cada grupo por percentual decrescente
                Object.keys(resultadosPorData).forEach((data) => {
                  resultadosPorData[data].sort((a, b) => (b.percentual || 0) - (a.percentual || 0));
                });

                // Ordenar datas (mais recente primeiro)
                const datasOrdenadas = Object.keys(resultadosPorData).sort((a, b) => {
                  const dateA = new Date(a.split('/').reverse().join('-'));
                  const dateB = new Date(b.split('/').reverse().join('-'));
                  return dateB.getTime() - dateA.getTime();
                });

                return datasOrdenadas.map((data) => (
                  <div key={data} style={{ marginBottom: 32 }}>
                    {/* Título da data */}
                    <div style={{ 
                      marginBottom: 16, 
                      paddingBottom: 8, 
                      borderBottom: '2px solid #1890ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <h3 style={{ margin: 0, color: '#1890ff', fontSize: 18 }}>
                        📅 Teste realizado em {data}
                      </h3>
                      <Tag color="blue">{resultadosPorData[data].length} inteligências</Tag>
                    </div>

                    {/* Cards ordenados por percentual */}
                    <Row gutter={[16, 16]}>
                      {resultadosPorData[data].map((resultado, idx) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={resultado.id}>
                          <Card
                            style={{
                              height: '100%',
                              borderLeft: `4px solid ${resultado.categoria.cor || '#1890ff'}`,
                              position: 'relative'
                            }}
                            actions={[
                              <Button
                                key="detalhes"
                                type="link"
                                icon={<EyeOutlined />}
                                onClick={() => handleViewDetalhes(resultado)}
                              >
                                Ver Detalhes
                              </Button>
                            ]}
                          >
                            {/* Badge de posição */}
                            {idx < 3 && (
                              <div style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32',
                                color: 'white',
                                borderRadius: '50%',
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: 14,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}>
                                {idx + 1}º
                              </div>
                            )}

                            <div style={{ textAlign: 'center' }}>
                              <Tag
                                color={resultado.categoria.cor}
                                style={{
                                  fontSize: '14px',
                                  padding: '4px 12px',
                                  marginBottom: '16px',
                                  border: 'none',
                                }}
                              >
                                {resultado.categoria.nome}
                              </Tag>
                              
                              <div style={{ marginBottom: '16px' }}>
                                <div style={{
                                  fontSize: '48px',
                                  fontWeight: 'bold',
                                  color: '#52c41a',
                                  marginBottom: '4px'
                                }}>
                                  {resultado.percentual || 0}%
                                </div>
                                <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                                  {Math.round(resultado.pontuacao) || 0}/
                                  {resultado.pontuacao_maxima || 35} pontos
                                </div>
                                <div style={{ color: '#888', fontSize: '11px' }}>
                                  Pontuação
                                  {resultado.categoria && resultado.categoria._count && typeof resultado.categoria._count.perguntas === 'number' && (
                                    <span style={{ marginLeft: 6 }}>
                                      ({resultado.categoria._count.perguntas} perguntas)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <Progress
                                percent={resultado.percentual || 0}
                                strokeColor={{
                                  '0%': resultado.categoria.cor || '#1890ff',
                                  '100%': resultado.categoria.cor || '#52c41a',
                                }}
                                style={{ marginBottom: '16px' }}
                              />

                              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                {['alto', 'medio', 'baixo'].includes((resultado.status || '').toLowerCase()) && (
                                  <div>
                                    <Tag color={
                                      resultado.status === 'alto' ? 'green' : 
                                      resultado.status === 'medio' ? 'orange' : 'red'
                                    }>
                                      {resultado.status?.toUpperCase()}
                                    </Tag>
                                  </div>
                                )}
                              </Space>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ));
              })()}
            </>
          )}
        </Card>

        {/* Modal de detalhes das perguntas e respostas */}
        <Modal
          title={detalhesResultado ? `Detalhes: ${detalhesResultado.categoria?.nome || 'Categoria'}` : 'Detalhes do Resultado'}
          open={modalDetalheVisible}
          onCancel={() => setModalDetalheVisible(false)}
          footer={null}
          width={800}
        >
          {detalhesResultado && (
            <div>
              {/* Resumo da categoria */}
              <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Tag 
                        color={detalhesResultado.categoria?.cor} 
                        style={{ fontSize: '14px', padding: '6px 12px', marginBottom: '8px' }}
                      >
                        {detalhesResultado.categoria?.nome}
                      </Tag>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#52c41a'
                      }}>
                        {Math.round(detalhesResultado.pontuacao)}/
                        {detalhesResultado.categoria && detalhesResultado.categoria._count && typeof detalhesResultado.categoria._count.perguntas === 'number'
                          ? detalhesResultado.categoria._count.perguntas * 5
                          : 35}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        Pontuação
                        {detalhesResultado.categoria && detalhesResultado.categoria._count && typeof detalhesResultado.categoria._count.perguntas === 'number' && (
                          <span style={{ marginLeft: 6, color: '#888', fontSize: 11 }}>
                            ({detalhesResultado.categoria._count.perguntas} perguntas)
                          </span>
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        percent={detalhesResultado.percentual || 0}
                        strokeColor={detalhesResultado.categoria?.cor}
                        size={80}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Tag color={
                        detalhesResultado.status === 'alto' ? 'green' : 
                        detalhesResultado.status === 'medio' ? 'orange' : 'red'
                      }>
                        {detalhesResultado.status?.toUpperCase()}
                      </Tag>
                      <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                        {new Date(detalhesResultado.data_teste).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Perguntas e respostas */}
              <Card size="small" title="Perguntas e Respostas" style={{ marginBottom: 16 }}>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {detalhesResultado.respostas?.filter(resposta => 
                    resposta.pergunta.categoria_id === detalhesResultado.categoria.id
                  ).map((resposta) => (
                    <div key={resposta.pergunta.id} style={{ 
                      marginBottom: '16px',
                      padding: '16px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      backgroundColor: '#fafafa'
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Pergunta {resposta.pergunta.ordem}:</strong>
                      </div>
                      <div style={{ marginBottom: '12px', color: '#333' }}>
                        {resposta.pergunta.texto}
                      </div>
                      <div style={{ 
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #d9d9d9'
                      }}>
                        <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                          Resposta selecionada:
                        </div>
                        <div style={{ color: '#1890ff', fontWeight: '500' }}>
                          {resposta.possibilidade.texto}
                        </div>
                        <div style={{ marginTop: '4px', fontSize: '12px', color: '#52c41a' }}>
                          Valor: {resposta.possibilidade.valor} pontos
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                      Nenhuma resposta encontrada
                    </div>
                  )}
                </div>
              </Card>

              {/* Características da inteligência */}
              {detalhesResultado?.categoria?.caracteristicas_inteligente && (
                <Card size="small" title="Características desta Inteligência" style={{ marginBottom: 16 }}>
                  <ul style={{ paddingLeft: '20px' }}>
                    {(() => {
                      let lista: string | string[] = detalhesResultado.categoria.caracteristicas_inteligente || '';
                      if (typeof lista === 'undefined' || lista === null) {
                        lista = '';
                      }
                      if (typeof lista === 'string') {
                        lista = lista.includes('\n') ? lista.split(/\r?\n/) : lista.split(',');
                      }
                      if (!Array.isArray(lista)) return null;
                      return lista.map((caracteristica, index) => (
                        <li key={index} style={{ marginBottom: '4px', color: '#333' }}>
                          {caracteristica}
                        </li>
                      ));
                    })()}
                  </ul>
                </Card>
              )}

              {/* Carreiras associadas */}
              {detalhesResultado?.categoria?.carreiras_associadas && (
                <Card size="small" title="Carreiras Associadas">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(() => {
                      let lista: string | string[] = detalhesResultado.categoria.carreiras_associadas || '';
                      if (typeof lista === 'undefined' || lista === null) {
                        lista = '';
                      }
                      if (typeof lista === 'string') {
                        lista = lista.includes('\n') ? lista.split(/\r?\n/) : lista.split(',');
                      }
                      if (!Array.isArray(lista)) return null;
                      return lista
                        .map((carreira) => typeof carreira === 'string' ? carreira.trim() : carreira)
                        .filter(Boolean)
                        .map((carreira, index) => (
                          <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
                            {carreira}
                          </Tag>
                        ));
                    })()}
                  </div>
                </Card>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
