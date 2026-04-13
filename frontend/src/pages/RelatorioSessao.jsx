import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Space,
  Spin,
  Empty,
  message,
  Divider
} from 'antd';
import { 
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const { Title } = Typography;

const RelatorioSessao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agendamento, setAgendamento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgendamento();
  }, [id]);

  const fetchAgendamento = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/agendamentos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar relatório');
      }

      const data = await response.json();
      
      console.log('=== DADOS DO RELATÓRIO ===');
      console.log('Agendamento completo:', data);
      console.log('Sessões:', data.sessoes);
      console.log('Resumo (agendamento):', data.resumo_sessao);
      console.log('Próximos passos (agendamento):', data.proximos_passos);
      console.log('Anexos (agendamento):', data.anexos);
      
      // Se houver sessão, pegar dados da última sessão
      if (data.sessoes && data.sessoes.length > 0) {
        const ultimaSessao = data.sessoes[0]; // Já vem ordenado por data desc
        console.log('Última sessão:', ultimaSessao);
        console.log('Registro:', ultimaSessao.registro_sessao);
        console.log('Tarefa:', ultimaSessao.tarefa_casa);
        console.log('Observações:', ultimaSessao.observacoes);
        console.log('Documentos:', ultimaSessao.documentos);
        
        // Mesclar dados da sessão no agendamento
        data.registro_sessao = ultimaSessao.registro_sessao;
        data.tarefa_casa = ultimaSessao.tarefa_casa;
        data.observacoes = ultimaSessao.observacoes;
        
        // Garantir que documentos seja um array
        if (ultimaSessao.documentos) {
          try {
            data.documentos = typeof ultimaSessao.documentos === 'string' 
              ? JSON.parse(ultimaSessao.documentos) 
              : Array.isArray(ultimaSessao.documentos) 
              ? ultimaSessao.documentos 
              : [];
          } catch (e) {
            console.error('Erro ao parsear documentos:', e);
            data.documentos = [];
          }
        } else {
          data.documentos = [];
        }
      }
      
      // Garantir que anexos seja um array
      if (data.anexos) {
        try {
          data.anexos = typeof data.anexos === 'string' 
            ? JSON.parse(data.anexos) 
            : Array.isArray(data.anexos) 
            ? data.anexos 
            : [];
        } catch (e) {
          console.error('Erro ao parsear anexos:', e);
          data.anexos = [];
        }
      } else {
        data.anexos = [];
      }
      
      // Verificar se o relatório está visível para o cliente
      if (data.visivel_cliente === false) {
        message.warning('Este relatório não está disponível');
        navigate('/cliente/agendamentos');
        return;
      }
      
      setAgendamento(data);
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      message.error('Erro ao carregar relatório da sessão');
      navigate('/cliente/agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado': return 'green';
      case 'pendente': return 'orange';
      case 'agendado': return 'blue';
      case 'concluido': return 'blue';
      case 'cancelado': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Aguardando Confirmação';
      case 'agendado': return 'Agendado';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'sessao': return 'Sessão';
      case 'consulta': return 'Consulta';
      case 'avaliacao': return 'Avaliação';
      case 'outro': return 'Outro';
      default: return tipo;
    }
  };

  const downloadAnexo = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'anexo';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎥';
      case 'mp3':
      case 'wav': return '🎵';
      case 'zip':
      case 'rar': return '📦';
      default: return '📎';
    }
  };

  const renderAnexos = (anexosJson) => {
    if (!anexosJson) return null;
    
    try {
      const anexos = JSON.parse(anexosJson);
      if (!anexos || anexos.length === 0) return null;

      return (
        <div style={{ marginBottom: 32 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 16,
            gap: 12
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 20
            }}>
              <PaperClipOutlined />
            </div>
            <Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>
              Anexos ({anexos.length})
            </Title>
          </div>
          
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {anexos.map((url, index) => {
              const filename = url.split('/').pop() || `arquivo-${index + 1}`;
              const decodedFilename = decodeURIComponent(filename);
              
              return (
                <div
                  key={index}
                  onClick={() => downloadAnexo(url, decodedFilename)}
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: '#f0f9ff',
                    padding: 20,
                    borderRadius: 12,
                    border: '1px solid #bae6fd',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 172, 254, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: 36 }}>{getFileIcon(decodedFilename)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: 600, 
                      color: '#0ea5e9',
                      marginBottom: 4,
                      fontSize: 15
                    }}>
                      {decodedFilename}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      Clique para baixar
                    </div>
                  </div>
                  <Button 
                    type="primary"
                    icon={<PaperClipOutlined />}
                    size="large"
                    style={{ 
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      border: 'none',
                      borderRadius: 10
                    }}
                  >
                    Baixar
                  </Button>
                </div>
              );
            })}
          </Space>
        </div>
      );
    } catch (error) {
      console.error('Erro ao parsear anexos:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" tip="Carregando relatório..." />
        </div>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div style={{ padding: '24px' }}>
        <Empty description="Relatório não encontrado" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" onClick={() => navigate('/cliente/agendamentos')}>
            Voltar para Agendamentos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#ffffff',
      padding: '24px',
      paddingBottom: '48px'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Breadcrumb / Voltar */}
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/cliente/agendamentos')}
          size="large"
          style={{ marginBottom: 24 }}
        >
          Voltar para Agendamentos
        </Button>
        
        {/* Layout Principal: Sidebar + Conteúdo */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          
          {/* Sidebar com Informações da Sessão */}
          <Card 
            style={{ 
              width: 320,
              height: 'fit-content',
              position: 'sticky',
              top: 24,
              border: '1px solid #e8e8e8',
              boxShadow: 'none'
            }}
          >
            <Title level={3} style={{ marginTop: 0, marginBottom: 16, color: '#262626' }}>
              {agendamento.titulo}
            </Title>
            
            <Divider style={{ margin: '16px 0' }} />
            
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#262626' }}>
                  <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  {dayjs(agendamento.data_hora).format('DD/MM/YYYY')}
                </div>
              </div>
              
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Horário</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#262626' }}>
                  <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  {dayjs(agendamento.data_hora).format('HH:mm')}
                </div>
              </div>
              
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duração</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#262626' }}>
                  {agendamento.duracao_minutos} minutos
                </div>
              </div>
              
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                <Tag color={getStatusColor(agendamento.status)} style={{ fontSize: 13 }}>
                  {getStatusText(agendamento.status)}
                </Tag>
              </div>
              
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipo</div>
                <Tag color="blue" style={{ fontSize: 13 }}>
                  {getTipoText(agendamento.tipo)}
                </Tag>
              </div>
            </Space>
          </Card>
          
          {/* Área de Conteúdo Principal */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              
              {/* Resumo da Sessão */}
              {agendamento.resumo_sessao && (
                <div>
                  <Title level={4} style={{ 
                    margin: '0 0 16px 0', 
                    color: '#262626',
                    fontSize: 18,
                    fontWeight: 600
                  }}>
                    Resumo da Sessão
                  </Title>
                  <Card 
                    style={{ 
                      border: '1px solid #e8e8e8',
                      boxShadow: 'none'
                    }}
                  >
                    <div style={{ 
                      lineHeight: 1.8,
                      color: '#595959',
                      fontSize: 15
                    }}>
                      {agendamento.resumo_sessao}
                    </div>
                  </Card>
                </div>
              )}

              {/* Tarefa de Casa */}
              {agendamento.tarefa_casa && (
                <div>
                  <Title level={4} style={{ 
                    margin: '0 0 16px 0', 
                    color: '#262626',
                    fontSize: 18,
                    fontWeight: 600
                  }}>
                    Tarefa de Casa
                  </Title>
                  <Card 
                    style={{ 
                      border: '1px solid #e8e8e8',
                      boxShadow: 'none',
                      borderLeft: '4px solid #1890ff'
                    }}
                  >
                    <div style={{ 
                      lineHeight: 1.8,
                      color: '#595959',
                      fontSize: 15
                    }}>
                      {agendamento.tarefa_casa}
                    </div>
                  </Card>
                </div>
              )}

              {/* Observações */}
              {agendamento.observacoes && (
                <div>
                  <Title level={4} style={{ 
                    margin: '0 0 16px 0', 
                    color: '#262626',
                    fontSize: 18,
                    fontWeight: 600
                  }}>
                    Observações
                  </Title>
                  <Card 
                    style={{ 
                      border: '1px solid #e8e8e8',
                      boxShadow: 'none'
                    }}
                  >
                    <div style={{ 
                      lineHeight: 1.8,
                      color: '#595959',
                      fontSize: 15
                    }}>
                      {agendamento.observacoes}
                    </div>
                  </Card>
                </div>
              )}

              {/* Próximos Passos */}
              {agendamento.proximos_passos && (
                <div>
                  <Title level={4} style={{ 
                    margin: '0 0 16px 0', 
                    color: '#262626',
                    fontSize: 18,
                    fontWeight: 600
                  }}>
                    Próximos Passos
                  </Title>
                  <Card 
                    style={{ 
                      border: '1px solid #e8e8e8',
                      boxShadow: 'none',
                      borderLeft: '4px solid #52c41a'
                    }}
                  >
                    <div style={{ 
                      lineHeight: 1.8,
                      color: '#595959',
                      fontSize: 15
                    }}>
                      {agendamento.proximos_passos}
                    </div>
                  </Card>
                </div>
              )}

              {/* Recomendações */}
              {agendamento.recomendacoes && (
                <div>
                  <Title level={4} style={{ 
                    margin: '0 0 16px 0', 
                    color: '#262626',
                    fontSize: 18,
                    fontWeight: 600
                  }}>
                    Recomendações
                  </Title>
                  <Card 
                    style={{ 
                      border: '1px solid #e8e8e8',
                      boxShadow: 'none',
                      borderLeft: '4px solid #faad14'
                    }}
                  >
                    <div style={{ 
                      lineHeight: 1.8,
                      color: '#595959',
                      fontSize: 15
                    }}>
                      {agendamento.recomendacoes}
                    </div>
                  </Card>
                </div>
              )}

              {/* Anexos */}
              {agendamento.anexos && agendamento.anexos.length > 0 && (
                <div>
                  <Title level={4} style={{ 
                    margin: '0 0 16px 0', 
                    color: '#262626',
                    fontSize: 18,
                    fontWeight: 600
                  }}>
                    Anexos
                  </Title>
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    {agendamento.anexos.map((anexo, index) => (
                      <Card
                        key={index}
                        hoverable
                        style={{
                          cursor: 'pointer',
                          border: '1px solid #e8e8e8',
                          boxShadow: 'none',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => window.open(anexo.url, '_blank')}
                        bodyStyle={{ 
                          padding: '14px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12
                        }}
                      >
                        <DownloadOutlined style={{ 
                          fontSize: 18,
                          color: '#1890ff'
                        }} />
                        <div style={{
                          flex: 1,
                          fontSize: 15,
                          color: '#262626',
                          fontWeight: 500
                        }}>
                          {anexo.nome || 'Sem nome'}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Documentos da Sessão */}
              {agendamento.documentos && agendamento.documentos.length > 0 && (
                <div>
                  <Title level={4} style={{ 
                    margin: '0 0 16px 0', 
                    color: '#262626',
                    fontSize: 18,
                    fontWeight: 600
                  }}>
                    Documentos da Sessão
                  </Title>
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    {agendamento.documentos.map((doc, index) => (
                      <Card
                        key={index}
                        hoverable
                        style={{
                          cursor: 'pointer',
                          border: '1px solid #e8e8e8',
                          boxShadow: 'none',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => window.open(doc.url, '_blank')}
                        bodyStyle={{ 
                          padding: '14px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12
                        }}
                      >
                        <DownloadOutlined style={{ 
                          fontSize: 18,
                          color: '#1890ff'
                        }} />
                        <div style={{
                          flex: 1,
                          fontSize: 15,
                          color: '#262626',
                          fontWeight: 500
                        }}>
                          {doc.nome || 'Sem nome'}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            </Space>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default RelatorioSessao;
