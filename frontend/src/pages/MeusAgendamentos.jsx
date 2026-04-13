import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, List, Button, Typography, Tag, Modal, Form, Input, 
  DatePicker, Select, message, Row, Col, Empty, Dropdown,
  Space, Popconfirm, Descriptions, Drawer
} from 'antd';
import { 
  CalendarOutlined, PlusOutlined, ClockCircleOutlined,
  EditOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined,
  HeartOutlined, GoogleOutlined, AppleOutlined, PlayCircleOutlined,
  HistoryOutlined, FolderOutlined, PaperClipOutlined
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/pt-br';
import axios from 'axios';
import DailyMeet from '../components/DailyMeet';

// Configurar moment para português
moment.locale('pt-br');

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

function Agendamentos({ user }) {
  const navigate = useNavigate();
  
  // Helper: nome dos dias da semana em português
  const diasSemanaPT = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const formatDayName = (dataHora) => {
    try {
      const d = moment(dataHora).day();
      const nome = diasSemanaPT[d] || '';
      return nome.charAt(0).toUpperCase() + nome.slice(1);
    } catch (e) {
      return '';
    }
  };

  // Forçar locale pt-br no momento da renderização
  React.useEffect(() => {
    moment.locale('pt-br');
  }, []);

  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [dailyVisible, setDailyVisible] = useState(false);
  const [dailyRoomName, setDailyRoomName] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAgendamentos();
  }, [user]); // Reagir quando o usuário mudar

  const fetchAgendamentos = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Pegar usuário do localStorage como no Dashboard
      let usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      
      console.log('👤 Usuário:', usuario);
      console.log('🆔 User ID:', usuario.id);
      
      const response = await axios.get(`${API_BASE_URL}/api/agendamentos`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { usuario_id: usuario.id }
      });
      
      console.log('📅 Agendamentos recebidos:', response.data);
      console.log('📎 Primeiro agendamento completo:', response.data[0]);
      
      const agendamentosReais = response.data || [];
      setAgendamentos(agendamentosReais);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAgendamento = () => {
    setEditingAgendamento(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditAgendamento = (agendamento) => {
    setEditingAgendamento(agendamento);
    const dataHora = moment(agendamento.data_hora);
    form.setFieldsValue({
      ...agendamento,
      data: dataHora.format('YYYY-MM-DD'),
      hora: dataHora.format('HH:mm')
    });
    setModalVisible(true);
  };

  const handleViewDetails = (agendamento) => {
    navigate(`/cliente/agendamentos/${agendamento.id}`);
  };

  const handleJoinVideo = (agendamento) => {
    const roomName = `agendamento_${agendamento.id}`;
    setDailyRoomName(roomName);
    setDailyVisible(true);
  };

  const handleDeleteAgendamento = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/agendamentos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Agendamento excluído com sucesso!');
      fetchAgendamentos();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      message.error('Erro ao excluir agendamento');
    }
  };

  const handleSubmitAgendamento = async (values) => {
    try {
      const token = localStorage.getItem('token');
      
      // Pegar usuário do localStorage
      let usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      
      if (!values.data || !values.hora) {
        message.error('Data e hora são obrigatórias!');
        return;
      }
      
      const dataHora = moment(`${values.data} ${values.hora}`, 'YYYY-MM-DD HH:mm');

      const payload = {
        titulo: values.titulo,
        descricao: values.descricao,
        data_hora: dataHora.toISOString(),
        duracao_minutos: values.duracao_minutos,
        tipo: values.tipo,
        status: values.status || 'agendado',
        usuario_id: usuario.id
      };

      if (editingAgendamento) {
        await axios.put(`${API_BASE_URL}/api/agendamentos/${editingAgendamento.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Agendamento atualizado com sucesso!');
      } else {
        await axios.post(`${API_BASE_URL}/api/agendamentos`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Agendamento criado com sucesso!');
      }

      setModalVisible(false);
      form.resetFields();
      fetchAgendamentos();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      message.error('Erro ao salvar agendamento');
    }
  };

  const addToGoogleCalendar = (agendamento) => {
    const dataInicio = moment(agendamento.data_hora);
    const dataFim = dataInicio.clone().add(agendamento.duracao_minutos, 'minutes');
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(agendamento.titulo)}&dates=${dataInicio.format('YYYYMMDDTHHmmss')}/${dataFim.format('YYYYMMDDTHHmmss')}&details=${encodeURIComponent(agendamento.descricao || '')}&sf=true&output=xml`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const generateICS = (agendamento) => {
    const dataInicio = moment(agendamento.data_hora);
    const dataFim = dataInicio.clone().add(agendamento.duracao_minutos, 'minutes');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${dataInicio.format('YYYYMMDDTHHmmss')}`,
      `DTEND:${dataFim.format('YYYYMMDDTHHmmss')}`,
      `SUMMARY:${agendamento.titulo}`,
      `DESCRIPTION:${agendamento.descricao || ''}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agendamento-${agendamento.id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    
    message.success('Arquivo de calendário baixado!');
  };

  const getCalendarMenuItems = (agendamento) => [
    {
      key: 'google',
      label: 'Google Calendar',
      icon: <CalendarOutlined />,
      onClick: () => addToGoogleCalendar(agendamento)
    },
    {
      key: 'apple',
      label: 'Apple Calendar / Outlook (.ics)',
      icon: <DownloadOutlined />,
      onClick: () => generateICS(agendamento)
    }
  ];

  const formatarDataHora = (dataHora) => {
    return moment(dataHora).format('DD/MM/YYYY [às] HH:mm');
  };

  // Separar agendamentos em próximos e anteriores
  const agora = moment();
  
  const proximosAgendamentos = agendamentos
    .filter(a => moment(a.data_hora).isAfter(agora) || moment(a.data_hora).isSame(agora, 'day'))
    .sort((a, b) => moment(a.data_hora).diff(moment(b.data_hora)));
  
  const agendamentosAnteriores = agendamentos
    .filter(a => moment(a.data_hora).isBefore(agora, 'day'))
    .sort((a, b) => moment(b.data_hora).diff(moment(a.data_hora)));
  
  console.log('🕐 Agora:', agora.format('DD/MM/YYYY HH:mm'));
  console.log('📅 Próximos:', proximosAgendamentos.length);
  console.log('📅 Anteriores:', agendamentosAnteriores.length);
  
  // Renderizar JSX
  return (
    <div style={{ 
      padding: window.innerWidth < 768 ? '20px 16px' : '40px 48px',
      maxWidth: '1400px',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Header com título e estatísticas */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a1d2e' }}>
          Meus Agendamentos
        </Title>
        <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
          <div>
            <Text type="secondary" style={{ fontSize: '14px' }}>Total de agendamentos</Text>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#1a1d2e' }}>
              {agendamentos.length}
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '14px' }}>Próximos eventos</Text>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#4FD1C5' }}>
              {proximosAgendamentos.length}
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '14px' }}>Eventos anteriores</Text>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#8b5cf6' }}>
              {agendamentosAnteriores.length}
            </div>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Coluna Esquerda - Próximos Eventos */}
        <Col xs={24} lg={12}>
          <Title level={4} style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '600', color: '#1a1d2e' }}>
            Próximos eventos
          </Title>
          
          {proximosAgendamentos.length > 0 ? (
            <Card
              style={{
                borderRadius: '12px',
                border: 'none'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              {/* Destaque para evento de hoje (se houver) */}
              {proximosAgendamentos[0] && moment(proximosAgendamentos[0].data_hora).isSame(moment(), 'day') && (
                <div style={{
                  background: 'linear-gradient(135deg, #4FD1C5 0%, #3DBFB3 100%)',
                  padding: '20px',
                  borderRadius: '10px',
                  color: 'white',
                  marginBottom: '20px',
                }}>
                  <Tag style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px' }}>Hoje</Tag>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ fontSize: '36px', fontWeight: 700 }}>
                        {moment(proximosAgendamentos[0].data_hora).format('HH:mm')}
                      </div>
                      <div>
                        <Title level={5} style={{ color: 'white', margin: 0 }}>{proximosAgendamentos[0].titulo || 'Próximo agendamento'}</Title>
                        <Text style={{ color: 'rgba(255,255,255,0.9)' }}>{proximosAgendamentos[0].descricao}</Text>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Button 
                        size="small" 
                        icon={<PlayCircleOutlined />} 
                        style={{ 
                          background: 'white', 
                          color: '#1a1d2e', 
                          border: 'none', 
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinVideo(proximosAgendamentos[0]);
                        }}
                      >
                        Iniciar
                      </Button>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                          size="small" 
                          icon={<GoogleOutlined />} 
                          style={{ 
                            background: 'rgba(255,255,255,0.2)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToGoogleCalendar(proximosAgendamentos[0]);
                          }}
                        >
                          Google
                        </Button>
                        <Button 
                          size="small" 
                          icon={<AppleOutlined />} 
                          style={{ 
                            background: 'rgba(255,255,255,0.2)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            generateICS(proximosAgendamentos[0]);
                          }}
                        >
                          Apple
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista dos próximos (exceto o de hoje, já destacado) */}
              {proximosAgendamentos.filter(a => !moment(a.data_hora).isSame(moment(), 'day')).slice(0, 5).map((agendamento, index) => (
                <div key={agendamento.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0' }}>
                  <div style={{ flex: 1 }}>
                    <Title level={5} style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a1d2e' }}>{agendamento.titulo || 'Próximo agendamento'}</Title>
                    <Row gutter={24} style={{ marginTop: 12 }}>
                      <Col span={12}>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Dia</Text>
                        <Text strong style={{ display: 'block', fontSize: 14 }}>{moment(agendamento.data_hora).format('DD/MM/YYYY')}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{formatDayName(agendamento.data_hora)}</Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Horário</Text>
                        <Text strong style={{ fontSize: 14 }}>{moment(agendamento.data_hora).format('HH:mm')}</Text>
                      </Col>
                    </Row>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 20 }}>
                    <Button danger size="small" icon={<GoogleOutlined />} onClick={() => addToGoogleCalendar(agendamento)} style={{ borderRadius: 8, minWidth: 180 }}>Adicionar google agenda</Button>
                    <Button size="small" icon={<AppleOutlined />} onClick={() => generateICS(agendamento)} style={{ borderRadius: 8, background: '#1a1d2e', color: 'white', border: 'none', minWidth: 180 }}>Adicionar apple agenda</Button>
                  </div>
                </div>
              ))}
            </Card>
          ) : (
            <Empty description="Nenhum evento próximo" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Col>

        {/* Coluna Direita - Eventos Anteriores */}
        <Col xs={24} lg={12}>
          <Title level={4} style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '600', color: '#1a1d2e' }}>
            Eventos Anteriores
          </Title>

          {agendamentosAnteriores.length > 0 ? (
            <Card
              style={{
                borderRadius: '12px',
                border: 'none'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              {agendamentosAnteriores.slice(0, 5).map((agendamento, index) => (
                <div key={agendamento.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Title level={5} style={{ margin: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#1a1d2e' }}>
                        {agendamento.titulo || 'Sessão de atendimento'}
                      </Title>
                      
                      <Row gutter={24}>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                            Dia
                          </Text>
                          <Text strong style={{ fontSize: '14px', display: 'block', color: '#262626' }}>
                            {moment(agendamento.data_hora).format('DD/MM/YYYY')}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                            {formatDayName(agendamento.data_hora)}
                          </Text>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                            Horário
                          </Text>
                          <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                            {moment(agendamento.data_hora).format('HH:mm')}
                          </Text>
                        </Col>
                      </Row>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', marginLeft: '24px' }}>
                      {(() => {
                        // Verificar anexos: pode vir como array, número, ou precisamos contar
                        const temAnexos = agendamento.anexos?.length > 0 || 
                                         agendamento.num_anexos > 0 || 
                                         agendamento.registros_sessao?.length > 0;
                        const qtdAnexos = agendamento.anexos?.length || 
                                         agendamento.num_anexos || 
                                         agendamento.registros_sessao?.length || 
                                         (agendamento.status === 'concluido' ? 1 : 0);
                        
                        console.log('📎 Anexos do agendamento:', agendamento.id, {
                          anexos: agendamento.anexos,
                          num_anexos: agendamento.num_anexos,
                          registros: agendamento.registros_sessao,
                          temAnexos,
                          qtdAnexos
                        });
                        
                        return temAnexos && (
                          <Tag 
                            icon={<PaperClipOutlined />} 
                            style={{ 
                              fontSize: '12px', 
                              borderRadius: '6px',
                              background: '#f5f5f5',
                              border: '1px solid #d9d9d9',
                              color: '#595959',
                              padding: '4px 12px'
                            }}
                          >
                            {qtdAnexos} {qtdAnexos === 1 ? 'anexo' : 'anexos'}
                          </Tag>
                        );
                      })()}
                      
                      <Button
                        type="primary"
                        size="small"
                        icon={<FolderOutlined />}
                        onClick={() => handleViewDetails(agendamento)}
                        style={{
                          borderRadius: '8px',
                          background: '#1a1d2e',
                          border: 'none',
                          fontSize: '13px',
                          height: '36px',
                          minWidth: '110px'
                        }}
                      >
                        Detalhes
                      </Button>
                    </div>
                  </div>
                  
                  {index < agendamentosAnteriores.slice(0, 5).length - 1 && (
                    <div style={{ 
                      height: '1px', 
                      background: '#f0f0f0', 
                      margin: '20px 0' 
                    }} />
                  )}
                </div>
              ))}
            </Card>
          ) : (
            <Empty
              description="Nenhum evento anterior"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Col>
      </Row>

      {/* Modal para criar/editar agendamento */}
      <Modal
        title={editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={650}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitAgendamento}
        >
          <Form.Item
            name="titulo"
            label="Título"
            rules={[{ required: true, message: 'Por favor, insira o título!' }]}
          >
            <Input placeholder="Ex: Sessão de Coaching - Planejamento de Carreira" />
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[{ required: true, message: 'Por favor, insira a descrição!' }]}
          >
            <Input.TextArea
              placeholder="Descreva o objetivo da sessão..."
              rows={3}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tipo"
                label="Tipo de Sessão"
                rules={[{ required: true, message: 'Por favor, selecione o tipo!' }]}
              >
                <Select placeholder="Selecione o tipo">
                  <Option value="sessao">Sessão de Coaching</Option>
                  <Option value="avaliacao">Avaliação</Option>
                  <Option value="follow_up">Follow-up</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Por favor, selecione o status!' }]}
              >
                <Select placeholder="Selecione o status">
                  <Option value="agendado">Agendado</Option>
                  <Option value="confirmado">Confirmado</Option>
                  <Option value="cancelado">Cancelado</Option>
                  <Option value="concluido">Concluído</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="data"
            label="Data"
            rules={[{ required: true, message: 'Por favor, selecione a data!' }]}
          >
            <Input
              type="date"
              style={{ 
                width: '100%',
                height: '32px'
              }}
              min={moment().format('YYYY-MM-DD')}
            />
          </Form.Item>

          <Form.Item
            name="hora"
            label="Horário"
            rules={[{ required: true, message: 'Por favor, insira o horário!' }]}
          >
            <Input
              placeholder="14:30"
              maxLength={5}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="duracao_minutos"
            label="Duração (minutos)"
            rules={[{ required: true, message: 'Por favor, selecione a duração!' }]}
          >
            <Select placeholder="Selecione a duração">
              <Option value={30}>30 minutos</Option>
              <Option value={45}>45 minutos</Option>
              <Option value={60}>1 hora</Option>
              <Option value={90}>1 hora e 30 minutos</Option>
              <Option value={120}>2 horas</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingAgendamento ? 'Atualizar' : 'Criar'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer para detalhes do agendamento */}
      <Drawer
        title="Detalhes do Agendamento"
        placement="right"
        onClose={() => setDetailsVisible(false)}
        open={detailsVisible}
        width={400}
      >
        {selectedAgendamento && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Título">
              {selectedAgendamento.titulo}
            </Descriptions.Item>
            <Descriptions.Item label="Descrição">
              {selectedAgendamento.descricao}
            </Descriptions.Item>
            <Descriptions.Item label="Data e Hora">
              {formatarDataHora(selectedAgendamento.data_hora)}
            </Descriptions.Item>
            <Descriptions.Item label="Duração">
              {selectedAgendamento.duracao_minutos} minutos
            </Descriptions.Item>
          </Descriptions>
        )}
        
        {selectedAgendamento && (
          <div style={{ marginTop: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Dropdown
                menu={{ items: getCalendarMenuItems(selectedAgendamento) }}
                trigger={['click']}
                placement="bottomLeft"
              >
                <Button 
                  type="primary"
                  icon={<CalendarOutlined />}
                  block
                >
                  Adicionar à Minha Agenda
                </Button>
              </Dropdown>
              

            </Space>
          </div>
        )}
      </Drawer>

      <DailyMeet
        visible={dailyVisible}
        roomName={dailyRoomName}
        displayName={user?.nome || 'Usuário'}
        onClose={() => setDailyVisible(false)}
      />
    </div>
  );
}

export default Agendamentos;
