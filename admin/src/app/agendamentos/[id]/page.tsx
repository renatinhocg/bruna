"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import { Card, Row, Col, Button, Tag, Space, Form, Input, Select, Upload, message, Timeline, Divider, Descriptions, Alert, Spin } from 'antd';
import { ArrowLeftOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined, SaveOutlined, UploadOutlined, HistoryOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('pt-br');
dayjs.extend(relativeTime);

const { TextArea } = Input;

interface Agendamento {
  id: number;
  titulo: string;
  usuario_id: number;
  data_hora: string;
  tipo?: string;
  duracao_minutos?: number;
  status?: string;
  observacoes?: string;
  usuario?: { nome: string; email?: string; telefone?: string; data_nascimento?: string; };
}

interface HistoricoAgendamento {
  id: number;
  titulo: string;
  data_hora: string;
  status: string;
  tipo?: string;
  sessoes?: Array<{
    id: number;
    documentos?: string;
  }>;
}

interface Sessao {
  id?: number;
  agendamento_id: number;
  registro_sessao: string;
  tarefa_casa?: string;
  observacoes?: string;
  documentos?: string[];
}

export default function AtendimentoPage() {
  const router = useRouter();
  const params = useParams();
  const agendamentoId = params?.id as string;
  const apiUrlRaw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
  const apiUrl = apiUrlRaw.endsWith('/') ? apiUrlRaw.slice(0, -1) : apiUrlRaw;
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [historico, setHistorico] = useState<HistoricoAgendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const fetchAgendamento = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await fetch(`${apiUrl}/agendamentos/${agendamentoId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erro ao buscar agendamento');
      const data = await res.json();
      setAgendamento(data);
      const sessaoRes = await fetch(`${apiUrl}/sessoes/agendamento/${agendamentoId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (sessaoRes.ok) {
        const sessaoData = await sessaoRes.json();
        form.setFieldsValue({ 
          registro_sessao: sessaoData.registro_sessao, 
          tarefa_casa: sessaoData.tarefa_casa, 
          observacoes: sessaoData.observacoes 
        });
        
        // Carregar documentos anexados
        if (sessaoData.documentos) {
          try {
            const docs = typeof sessaoData.documentos === 'string' 
              ? JSON.parse(sessaoData.documentos) 
              : sessaoData.documentos;
            
            if (Array.isArray(docs) && docs.length > 0) {
              const uploadedFiles: UploadFile[] = docs.map((doc: string, index: number) => {
                const fileName = doc.split('/').pop() || `documento-${index + 1}`;
                return {
                  uid: `${index}`,
                  name: fileName,
                  status: 'done' as const,
                  url: doc,
                };
              });
              setFileList(uploadedFiles);
            }
          } catch (err) {
            console.error('Erro ao parsear documentos:', err);
          }
        }
      }
    } catch (error) {
      message.error('Erro ao carregar dados do agendamento');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [agendamentoId, apiUrl, form]);

  const fetchHistorico = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!agendamento?.usuario_id) return;
      const res = await fetch(`${apiUrl}/agendamentos?usuario_id=${agendamento.usuario_id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        // Buscar sessões para cada agendamento
        const agendamentosComSessoes = await Promise.all(
          data.map(async (a: HistoricoAgendamento) => {
            try {
              const sessaoRes = await fetch(`${apiUrl}/sessoes/agendamento/${a.id}`, { headers: { Authorization: `Bearer ${token}` } });
              if (sessaoRes.ok) {
                const sessao = await sessaoRes.json();
                return { ...a, sessoes: [sessao] };
              }
            } catch { /* Ignora erros */ }
            return a;
          })
        );
        const historicoFiltrado = agendamentosComSessoes
          .filter((a: HistoricoAgendamento) => a.id !== parseInt(agendamentoId) && (a.status === 'concluido' || a.status === 'realizado'))
          .sort((a: HistoricoAgendamento, b: HistoricoAgendamento) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime());
        setHistorico(historicoFiltrado);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }, [agendamento?.usuario_id, agendamentoId, apiUrl]);

  useEffect(() => { if (agendamentoId) fetchAgendamento(); }, [agendamentoId, fetchAgendamento]);
  useEffect(() => { if (agendamento) fetchHistorico(); }, [agendamento, fetchHistorico]);

  const handleStatusChange = async (novoStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await fetch(`${apiUrl}/agendamentos/${agendamentoId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: novoStatus }) });
      if (!res.ok) throw new Error('Erro ao atualizar status');
      message.success('Status atualizado com sucesso!');
      setAgendamento(prev => prev ? { ...prev, status: novoStatus } : null);
    } catch (error) {
      message.error('Erro ao atualizar status');
      console.error(error);
    }
  };

  const handleSalvarSessao = async (values: { registro_sessao: string; tarefa_casa?: string; observacoes?: string }) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      // Mapear arquivos para incluir URL ou nome
      const documentos = fileList.map(f => {
        const response = typeof f.response === 'string' ? f.response : undefined;
        return f.url || response || f.name;
      });
      
      const sessaoData: Sessao = { 
        agendamento_id: parseInt(agendamentoId), 
        registro_sessao: values.registro_sessao, 
        tarefa_casa: values.tarefa_casa, 
        observacoes: values.observacoes, 
        documentos: documentos 
      };
      
      const checkRes = await fetch(`${apiUrl}/sessoes/agendamento/${agendamentoId}`, { headers: { Authorization: `Bearer ${token}` } });
      let res;
      if (checkRes.ok) {
        const existingSessao = await checkRes.json();
        res = await fetch(`${apiUrl}/sessoes/${existingSessao.id}`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
          body: JSON.stringify(sessaoData) 
        });
      } else {
        res = await fetch(`${apiUrl}/sessoes`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
          body: JSON.stringify(sessaoData) 
        });
      }
      if (!res.ok) throw new Error('Erro ao salvar sessão');
      message.success('Sessão salva com sucesso!');
      if (agendamento?.status === 'agendado') await handleStatusChange('realizado');
    } catch (error) {
      message.error('Erro ao salvar sessão');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleConcluirAtendimento = async () => {
    try {
      const values = await form.validateFields();
      await handleSalvarSessao(values);
      await handleStatusChange('concluido');
      message.success('Atendimento concluído com sucesso!');
      setTimeout(() => router.push('/agendamentos'), 1000);
    } catch {
      message.error('Por favor, preencha todos os campos obrigatórios');
    }
  };

  const handleUpload = async (file: File | Blob) => {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', 'documento-sessao');

    try {
      const res = await fetch(`${apiUrl}/arquivos/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const fileName = (file as File).name || 'arquivo';
        console.log('Upload bem-sucedido:', data);
        message.success(`${fileName} enviado com sucesso!`);
        return data.url;
      } else {
        const errorData = await res.text();
        console.error('Erro no upload:', res.status, errorData);
        const fileName = (file as File).name || 'arquivo';
        message.error(`Erro ao enviar ${fileName}`);
        return false;
      }
    } catch (error) {
      console.error('Exceção no upload:', error);
      const fileName = (file as File).name || 'arquivo';
      message.error(`Erro ao enviar ${fileName}`);
      return false;
    }
  };

  const uploadProps: UploadProps = { 
    fileList, 
    onChange: ({ fileList: newFileList }) => {
      console.log('FileList atualizado:', newFileList);
      setFileList(newFileList);
    }, 
    customRequest: async (options) => {
      const file = options.file as File;
      const url = await handleUpload(file);
      console.log('URL retornada do upload:', url);
      if (url && options.onSuccess) {
        // Retornar apenas a URL string como response
        options.onSuccess(url, new XMLHttpRequest());
      } else if (options.onError) {
        options.onError(new Error('Upload failed'));
      }
    },
    onDownload: (file) => {
      console.log('Tentando download:', file);
      const url = file.url || file.response;
      console.log('URL para download:', url);
      if (url && (typeof url === 'string') && url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        message.error('URL do arquivo não encontrada');
      }
    },
    onPreview: (file) => {
      console.log('Tentando preview:', file);
      const url = file.url || file.response;
      console.log('URL para preview:', url);
      if (url && (typeof url === 'string') && url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        message.error('URL do arquivo não encontrada');
      }
    }
  };
  const getStatusColor = (status?: string) => { switch (status) { case 'pendente': return 'orange'; case 'agendado': return 'blue'; case 'realizado': return 'green'; case 'concluido': return 'success'; case 'cancelado': return 'red'; default: return 'default'; } };

  if (loading) return (<AdminLayout><div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div></AdminLayout>);
  if (!agendamento) return (<AdminLayout><Alert message="Agendamento não encontrado" type="error" showIcon /></AdminLayout>);

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/agendamentos')} style={{ marginBottom: 16 }}>Voltar</Button>
        
        {/* Card de destaque com informações principais */}
        <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
          <Row gutter={24} align="middle">
            <Col xs={24} md={12}>
              <div style={{ color: 'white' }}>
                <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Cliente</div>
                <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 16 }}>
                  <UserOutlined style={{ marginRight: 12 }} />
                  {agendamento.usuario?.nome || 'Cliente'}
                </h2>
                <div style={{ fontSize: 16, opacity: 0.95 }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {dayjs(agendamento.data_hora).format('dddd, DD [de] MMMM [de] YYYY')}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'right' }}>
              <div style={{ color: 'white' }}>
                <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
                  <ClockCircleOutlined style={{ marginRight: 12 }} />
                  {dayjs(agendamento.data_hora).format('HH:mm')}
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  Duração: {agendamento.duracao_minutos || 60} minutos
                </div>
                <div style={{ marginTop: 16 }}>
                  <Space>
                    <Select 
                      value={agendamento.status} 
                      onChange={handleStatusChange} 
                      style={{ width: 150 }}
                      size="large"
                    >
                      <Select.Option value="pendente">Pendente</Select.Option>
                      <Select.Option value="agendado">Agendado</Select.Option>
                      <Select.Option value="realizado">Realizado</Select.Option>
                      <Select.Option value="concluido">Concluído</Select.Option>
                      <Select.Option value="cancelado">Cancelado</Select.Option>
                    </Select>
                    <Tag color={getStatusColor(agendamento.status)} style={{ fontSize: 14, padding: '4px 12px' }}>
                      {agendamento.status?.charAt(0).toUpperCase() + (agendamento.status?.slice(1) || '')}
                    </Tag>
                  </Space>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Registro da Sessão" style={{ marginBottom: 24 }}>
            <Form form={form} layout="vertical" onFinish={handleSalvarSessao}>
              <Form.Item 
                label="Registro da Sessão" 
                name="registro_sessao" 
                rules={[{ required: true, message: 'Por favor, registre a sessão' }]}
              >
                <TextArea 
                  rows={8} 
                  placeholder="Descreva detalhadamente o que foi abordado na sessão, progressos observados, técnicas utilizadas, etc." 
                />
              </Form.Item>

              <Form.Item label="Tarefa de Casa" name="tarefa_casa">
                <TextArea 
                  rows={4} 
                  placeholder="Descreva as tarefas ou exercícios que o cliente deve realizar até a próxima sessão" 
                />
              </Form.Item>

              <Form.Item label="Observações Adicionais" name="observacoes">
                <TextArea 
                  rows={3} 
                  placeholder="Observações gerais, pontos de atenção, etc." 
                />
              </Form.Item>

              <Form.Item label="Anexar Documentos">
                <Upload {...uploadProps} multiple>
                  <Button icon={<UploadOutlined />}>
                    Selecionar Arquivos
                  </Button>
                </Upload>
                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                  Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB por arquivo)
                </div>
              </Form.Item>
              <Divider />
              <Space><Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={saving}>Salvar Sessão</Button><Button type="primary" style={{ background: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={handleConcluirAtendimento} loading={saving}>Concluir Atendimento</Button></Space>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<Space><UserOutlined /> Dados do Cliente</Space>} style={{ marginBottom: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Nome">{agendamento.usuario?.nome || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Email">{agendamento.usuario?.email || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Telefone">{agendamento.usuario?.telefone || 'N/A'}</Descriptions.Item>
              {agendamento.usuario?.data_nascimento && (<Descriptions.Item label="Data de Nascimento">{dayjs(agendamento.usuario.data_nascimento).format('DD/MM/YYYY')}</Descriptions.Item>)}
            </Descriptions>
          </Card>
          <Card title={<Space><CalendarOutlined /> Dados do Agendamento</Space>} style={{ marginBottom: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Data">{dayjs(agendamento.data_hora).format('DD/MM/YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Hora">{dayjs(agendamento.data_hora).format('HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Tipo"><Tag color="cyan">{agendamento.tipo || 'Sessão'}</Tag></Descriptions.Item>
              <Descriptions.Item label="Duração"><Space><ClockCircleOutlined />{agendamento.duracao_minutos || 60} minutos</Space></Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title={<Space><HistoryOutlined /> Histórico de Atendimentos</Space>}>
            {historico.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                Primeiro atendimento do cliente
              </div>
            ) : (
              <Timeline
                items={historico.slice(0, 5).map(item => {
                  let documentos: string[] = [];
                  try {
                    if (item.sessoes?.[0]?.documentos) {
                      const parsed = JSON.parse(item.sessoes[0].documentos);
                      // Garantir que seja array de strings
                      documentos = Array.isArray(parsed) 
                        ? parsed.map(d => typeof d === 'string' ? d : (d?.url || String(d)))
                        : [];
                    }
                  } catch (err) {
                    console.error('Erro ao parsear documentos:', err);
                  }
                  
                  return {
                    color: getStatusColor(item.status),
                    children: (
                      <div key={item.id}>
                        <div style={{ fontWeight: 500 }}>{item.titulo}</div>
                        <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                          {dayjs(item.data_hora).format('DD/MM/YYYY HH:mm')}
                        </div>
                        {item.tipo && (
                          <Tag color="cyan" style={{ marginTop: 4, fontSize: 11 }}>
                            {item.tipo}
                          </Tag>
                        )}
                        {documentos.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                              📎 Anexos ({documentos.length})
                            </div>
                            <Space wrap>
                              {documentos.map((doc: string, idx: number) => {
                                // Extrair nome do arquivo da URL
                                const fileName = doc.includes('/') ? decodeURIComponent(doc.split('/').pop() || doc) : doc;
                                const isUrl = doc.startsWith('http');
                                
                                return (
                                  <a 
                                    key={idx}
                                    href={isUrl ? doc : undefined}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={fileName}
                                    style={{ textDecoration: 'none' }}
                                  >
                                    <Tag 
                                      icon={<UploadOutlined />} 
                                      style={{ fontSize: 10, marginBottom: 2, cursor: 'pointer' }}
                                      color={isUrl ? 'blue' : 'default'}
                                    >
                                      {fileName}
                                    </Tag>
                                  </a>
                                );
                              })}
                            </Space>
                          </div>
                        )}
                      </div>
                    )
                  };
                })}
              />
            )}
            {historico.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="link" size="small">
                  Ver todos ({historico.length} atendimentos)
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
}
