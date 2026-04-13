import React, { useState, useEffect } from 'react';
import { 
  Card, List, Button, Typography, Tag, Modal, Form, Input, 
  DatePicker, Select, message, Row, Col, Empty, Dropdown,
  Space, Popconfirm, Descriptions, Drawer
} from 'antd';
import { 
  CalendarOutlined, PlusOutlined, ClockCircleOutlined,
  EditOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

function Agendamentos({ user }) {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/agendamentos`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { usuario_id: user?.id }
      });
      
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
    setSelectedAgendamento(agendamento);
    setDetailsVisible(true);
  };

  const handleDeleteAgendamento = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/agendamentos/${id}`, {
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
        usuario_id: user?.id
      };

      if (editingAgendamento) {
        await axios.put(`${API_BASE_URL}/agendamentos/${editingAgendamento.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Agendamento atualizado com sucesso!');
      } else {
        await axios.post(`${API_BASE_URL}/agendamentos`, payload, {
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
    .filter(a => moment(a.data_hora).isAfter(agora))
    .sort((a, b) => moment(a.data_hora).diff(moment(b.data_hora)));
  
  const agendamentosAnteriores = agendamentos
    .filter(a => moment(a.data_hora).isSameOrBefore(agora))
    .sort((a, b) => moment(b.data_hora).diff(moment(a.data_hora)));

  const sessoesRealizadas = agendamentosAnteriores.filter(a => a.status === 'concluido').length;
  const proximasSessoes = proximosAgendamentos.length;

  // Pegar o próximo evento hoje
  const proximoEventoHoje = proximosAgendamentos.find(a => moment(a.data_hora).isSame(agora, 'day'));

  return (
    <div style={{ 
      padding: window.innerWidth < 768 ? '20px 16px' : '40px 48px',
      maxWidth: '1400px',
      margin: '0 auto',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '32px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>Meus agendamentos</Title>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Card size="small" style={{ textAlign: 'center', minWidth: '140px', borderRadius: '12px' }}>
            <Title level={3} style={{ margin: 0, color: '#1890ff', fontSize: '32px' }}>{proximasSessoes}</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>Próximas<br/>Sessões</Text>
          </Card>
          <Card size="small" style={{ textAlign: 'center', minWidth: '140px', borderRadius: '12px' }}>
            <Title level={3} style={{ margin: 0, color: '#52c41a', fontSize: '32px' }}>{sessoesRealizadas}</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>Sessões<br/>realizadas</Text>
          </Card>
        </div>
      </div>

      <Row gutter={[28, 28]}>
        {/* Coluna Esquerda - Próximos Eventos */}
        <Col xs={24} lg={12}>
          <Title level={4} style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
            Próximos eventos
          </Title>

          {/* Card do Evento de Hoje (se houver) */}
          {proximoEventoHoje && (
            <Card
              style={{
                marginBottom: '24px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #FF1493 0%, #FF4500 100%)',
                border: '5px solid yellow',
                boxShadow: '0 0 20px rgba(255,20,147,0.5)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'white' }}>
                <Tag color="green" style={{ marginBottom: '12px' }}>Hoje</Tag>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    lineHeight: '1',
                    minWidth: '60px'
                  }}>
                    {moment(proximoEventoHoje.data_hora).format('HH:mm')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Title level={5} style={{ color: 'white', marginBottom: '4px', fontSize: '18px' }}>
                      {proximoEventoHoje.titulo}
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
                      {proximoEventoHoje.descricao}
                    </Text>
                  </div>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      background: '#FF5722',
                      color: 'white',
                      border: '3px solid yellow',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      fontSize: '18px',
                      padding: '12px 32px',
                      height: 'auto'
                    }}
                    onClick={(e) => {
                      alert('🚀 BOTÃO FUNCIONANDO! VERSÃO NOVA!');
                      console.log('=== BOTÃO INICIAR TESTE CLICADO ===');
                      console.log('Event:', e);
                      console.log('Navigate function:', navigate);
                      e.preventDefault();
                      e.stopPropagation();
                      navigate('/cliente/testes');
                    }}
                  >
                    🔥 CLIQUE AQUI - TESTE NOVO 🔥
                  </Button>
                  <Dropdown menu={{ items: getCalendarMenuItems(proximoEventoHoje) }} trigger={['click']}>
                    <Button
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px'
                      }}
                      icon={<CalendarOutlined />}
                    >
                      Adicionar à Agenda
                    </Button>
                  </Dropdown>
                  <Popconfirm
                    title="Tem certeza que deseja excluir?"
                    onConfirm={() => handleDeleteAgendamento(proximoEventoHoje.id)}
                    okText="Sim"
                    cancelText="Não"
                  >
                    <Button
                      danger
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px'
                      }}
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                  <Button
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px'
                    }}
                    icon={<ClockCircleOutlined />}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Lista de Próximos Eventos */}
          {proximosAgendamentos.filter(a => !proximoEventoHoje || a.id !== proximoEventoHoje.id).slice(0, 3).map((agendamento) => (
            <Card
              key={agendamento.id}
              style={{
                marginBottom: '16px',
                borderRadius: '12px'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Dia</Text>
                    <Title level={4} style={{ margin: '4px 0', fontSize: '20px' }}>
                      {moment(agendamento.data_hora).format('DD/MM/YYYY')}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {moment(agendamento.data_hora).format('dddd')}
                    </Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Horário</Text>
                    <Title level={4} style={{ margin: '4px 0', fontSize: '20px' }}>
                      {moment(agendamento.data_hora).format('HH:mm')}
                    </Title>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', justifyContent: 'center' }}>
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<CalendarOutlined />}
                      onClick={() => addToGoogleCalendar(agendamento)}
                      style={{ borderRadius: '6px', fontSize: '12px' }}
                      block
                    >
                      Adicionar google agenda
                    </Button>
                    <Button
                      size="small"
                      icon={<CalendarOutlined />}
                      onClick={() => generateICS(agendamento)}
                      style={{
                        background: '#1a1d2e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                      block
                    >
                      Adicionar apple agenda
                    </Button>
                  </div>
                </Col>
              </Row>
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                <Title level={5} style={{ marginBottom: '4px', fontSize: '15px' }}>
                  {agendamento.titulo}
                </Title>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {agendamento.descricao}
                </Text>
              </div>
            </Card>
          ))}

          {proximosAgendamentos.length === 0 && (
            <Empty
              description="Nenhum evento próximo"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Col>

        {/* Coluna Direita - Eventos Anteriores */}
        <Col xs={24} lg={12}>
          <Title level={4} style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
            Eventos Anteriores
          </Title>

          {agendamentosAnteriores.slice(0, 5).map((agendamento) => (
            <Card
              key={agendamento.id}
              style={{
                marginBottom: '16px',
                borderRadius: '12px'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <Title level={5} style={{ marginBottom: '4px', fontSize: '16px' }}>
                    {agendamento.titulo}
                  </Title>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      <CalendarOutlined style={{ marginRight: '4px' }} />
                      {moment(agendamento.data_hora).format('DD/MM/YYYY')}
                    </Text>
                  </div>
                </div>
                <Tag icon={<ClockCircleOutlined />} color="default" style={{ fontSize: '12px' }}>
                  3 anexos
                </Tag>
              </div>
              
              <Row gutter={8}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Dia</Text>
                  <Text strong style={{ fontSize: '14px' }}>
                    {moment(agendamento.data_hora).format('DD/MM/YYYY')}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    {moment(agendamento.data_hora).format('dddd')}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Horário</Text>
                  <Text strong style={{ fontSize: '14px' }}>
                    {moment(agendamento.data_hora).format('HH:mm')}
                  </Text>
                </Col>
              </Row>

              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(agendamento)}
                style={{
                  marginTop: '12px',
                  borderRadius: '6px',
                  background: '#1a1d2e',
                  border: 'none'
                }}
                block
              >
                Detalhes
              </Button>
            </Card>
          ))}

          {agendamentosAnteriores.length === 0 && (
            <Empty
              description="Nenhum evento anterior"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Col>
      </Row>

      {/* Botão Flutuante para Novo Agendamento */}
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        onClick={handleNewAgendamento}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          height: '56px',
          borderRadius: '28px',
          paddingLeft: '24px',
          paddingRight: '24px',
          fontSize: '16px',
          fontWeight: '500',
          zIndex: 1000
        }}
      >
        Novo Agendamento
      </Button>

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
              
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button 
                  icon={<EditOutlined />}
                  onClick={() => {
                    setDetailsVisible(false);
                    handleEditAgendamento(selectedAgendamento);
                  }}
                >
                  Editar
                </Button>
                <Popconfirm
                  title="Tem certeza que deseja excluir?"
                  onConfirm={() => {
                    handleDeleteAgendamento(selectedAgendamento.id);
                    setDetailsVisible(false);
                  }}
                  okText="Sim"
                  cancelText="Não"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Excluir
                  </Button>
                </Popconfirm>
              </Space>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default Agendamentos;
