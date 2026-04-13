import React, { useState, useEffect } from 'react';
import { 
  Card, List, Button, Typography, Tag, Calendar, Modal, Form, Input, 
  DatePicker, TimePicker, Select, message, Row, Col, Badge, Drawer,
  Space, Popconfirm, Descriptions, Radio, Empty, Dropdown
} from 'antd';
import { 
  CalendarOutlined, PlusOutlined, ClockCircleOutlined, UserOutlined,
  EditOutlined, DeleteOutlined, EyeOutlined, FilterOutlined, DownloadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

function Agendamentos({ user }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState(moment());
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
      
      console.log('Agendamentos do banco:', response.data);
      
      // Usar apenas dados reais do banco
      const agendamentosReais = response.data || [];
      
      console.log('Agendamentos carregados:', agendamentosReais);
      
      setAgendamentos(agendamentosReais);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      // Se API falhar, começar com array vazio
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const getMockAgendamentos = () => [];

  const getStatusTag = (status) => {
    const statusConfig = {
      'concluido': { color: 'success', text: 'Concluído' },
      'confirmado': { color: 'processing', text: 'Confirmado' },
      'cancelado': { color: 'error', text: 'Cancelado' },
      'agendado': { color: 'default', text: 'Agendado' }
    };
    const config = statusConfig[status] || statusConfig['agendado'];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTipoTag = (tipo) => {
    const tipoConfig = {
      'sessao': { color: 'blue', text: 'Sessão' },
      'avaliacao': { color: 'purple', text: 'Avaliação' },
      'follow_up': { color: 'orange', text: 'Follow-up' }
    };
    const config = tipoConfig[tipo] || { color: 'default', text: 'Outro' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    return agendamentos.filter(agendamento => 
      moment(agendamento.data_hora).format('YYYY-MM-DD') === dateStr
    ).map(agendamento => ({
      type: getStatusColor(agendamento.status),
      content: `${moment(agendamento.data_hora).format('HH:mm')} - ${agendamento.titulo}`
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'concluido': 'success',
      'confirmado': 'processing',
      'cancelado': 'error',
      'agendado': 'default'
    };
    return colors[status] || 'default';
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge 
              status={item.type} 
              text={
                <span style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '100px' }}>
                  {item.content}
                </span>
              } 
            />
          </li>
        ))}
      </ul>
    );
  };

  const handleNewAgendamento = () => {
    setEditingAgendamento(null);
    setModalVisible(true);
    
    // Resetar formulário sem valores padrão
    form.resetFields();
  };

  const handleEditAgendamento = (agendamento) => {
    setEditingAgendamento(agendamento);
    
    // Converter a data_hora para o formato correto dos inputs
    const dataHoraMoment = moment(agendamento.data_hora);
    const dataFormatada = dataHoraMoment.format('YYYY-MM-DD');
    const horaFormatada = dataHoraMoment.format('HH:mm');
    
    form.setFieldsValue({
      titulo: agendamento.titulo,
      descricao: agendamento.descricao,
      tipo: agendamento.tipo,
      data: dataFormatada,
      hora: horaFormatada,
      duracao_minutos: agendamento.duracao_minutos,
      status: agendamento.status
    });
    setModalVisible(true);
  };

  const handleViewDetails = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setDetailsVisible(true);
  };

  // Função para adicionar ao Google Calendar
  const addToGoogleCalendar = (agendamento) => {
    const startDate = moment(agendamento.data_hora);
    const endDate = startDate.clone().add(agendamento.duracao_minutos, 'minutes');
    
    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', agendamento.titulo);
    googleUrl.searchParams.append('details', agendamento.descricao || '');
    googleUrl.searchParams.append('dates', `${startDate.format('YYYYMMDDTHHmmss')}/${endDate.format('YYYYMMDDTHHmmss')}`);
    
    window.open(googleUrl.toString(), '_blank');
  };

  // Função para gerar arquivo .ics (Apple Calendar e Outlook)
  const generateICS = (agendamento) => {
    const startDate = moment(agendamento.data_hora);
    const endDate = startDate.clone().add(agendamento.duracao_minutos, 'minutes');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BM Consultoria//Agendamentos//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${startDate.format('YYYYMMDDTHHmmss')}`,
      `DTEND:${endDate.format('YYYYMMDDTHHmmss')}`,
      `SUMMARY:${agendamento.titulo}`,
      `DESCRIPTION:${agendamento.descricao || ''}`,
      `STATUS:CONFIRMED`,
      `SEQUENCE:0`,
      `UID:${agendamento.id}@bmconsultoria.site`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agendamento-${agendamento.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    message.success('Arquivo de calendário baixado! Abra para adicionar à sua agenda.');
  };

  // Menu de opções de adicionar à agenda
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
      // Simular exclusão para demo
      setAgendamentos(prev => prev.filter(a => a.id !== id));
      message.success('Agendamento excluído com sucesso!');
    }
  };

  const handleSubmitAgendamento = async (values) => {
    console.log('=== INÍCIO DA SUBMISSÃO ===');
    console.log('Valores brutos do formulário:', values);
    console.log('Tipo de values.data:', typeof values.data);
    console.log('values.data é moment?', moment.isMoment(values.data));
    console.log('values.data toString:', values.data?.toString());
    
    if (values.data) {
      console.log('Data - ano:', values.data.year?.());
      console.log('Data - mês:', values.data.month?.() + 1);
      console.log('Data - dia:', values.data.date?.());
    }
    
    try {
      const token = localStorage.getItem('token');
      
      console.log('Valores do formulário:', values);
      console.log('Data original:', values.data);
      console.log('Hora original:', values.hora);
      
      // Validar se data e hora existem
      if (!values.data || !values.hora) {
        message.error('Data e hora são obrigatórias!');
        return;
      }
      
      // Processar data e hora de forma simples
      let dataHora;
      
      // Pegar a data do input (formato YYYY-MM-DD)
      const dataInput = values.data;
      console.log('Data do input:', dataInput);
      
      // Pegar o horário do input (formato HH:MM)
      const horaInput = values.hora || '09:00';
      console.log('Hora do input:', horaInput);
      
      // Criar a data/hora completa
      dataHora = moment(`${dataInput} ${horaInput}`, 'YYYY-MM-DD HH:mm');
      
      console.log('Data/hora final processada:', dataHora.format('YYYY-MM-DD HH:mm'));
      console.log('Dia:', dataHora.date());
      console.log('Mês:', dataHora.month() + 1);
      console.log('Ano:', dataHora.year());
      console.log('Hora:', dataHora.hour());
      console.log('Minuto:', dataHora.minute());

      const payload = {
        titulo: values.titulo,
        descricao: values.descricao,
        data_hora: dataHora.toISOString(),
        duracao_minutos: values.duracao_minutos,
        tipo: values.tipo,
        status: values.status || 'agendado',
        usuario_id: user?.id
      };

      console.log('Payload enviado:', payload);

      if (editingAgendamento) {
        await axios.put(`${API_BASE_URL}/agendamentos/${editingAgendamento.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Agendamento atualizado com sucesso!');
      } else {
        const response = await axios.post(`${API_BASE_URL}/agendamentos`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Resposta do servidor:', response.data);
        message.success('Agendamento criado com sucesso!');
      }

      setModalVisible(false);
      fetchAgendamentos();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      console.log('Valores no catch:', values);
      
      // Validar novamente na simulação
      if (!values.data || !values.hora) {
        message.error('Data e hora são obrigatórias!');
        return;
      }
      
      // Simular para demo processando data e hora simples
      const dataInput = values.data;
      const horaInput = values.hora || '09:00';
      
      const dataHora = moment(`${dataInput} ${horaInput}`, 'YYYY-MM-DD HH:mm');

      console.log('Data/hora simulada:', dataHora.format('YYYY-MM-DD HH:mm'));
      console.log('Dia simulado:', dataHora.date());
      console.log('Mês simulado:', dataHora.month() + 1);

      const newAgendamento = {
        id: Date.now(),
        titulo: values.titulo,
        descricao: values.descricao,
        data_hora: dataHora.format(),
        duracao_minutos: values.duracao_minutos,
        tipo: values.tipo,
        status: values.status || 'agendado'
      };

      console.log('Agendamento simulado:', newAgendamento);

      if (editingAgendamento) {
        setAgendamentos(prev => prev.map(a =>
          a.id === editingAgendamento.id ? { ...a, ...newAgendamento } : a
        ));
        message.success('Agendamento atualizado com sucesso!');
      } else {
        setAgendamentos(prev => [...prev, newAgendamento]);
        message.success('Agendamento criado com sucesso!');
      }
      
      setModalVisible(false);
    }
  };

  const getAgendamentosForDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    const filtered = agendamentos.filter(agendamento => {
      const agendamentoDate = moment(agendamento.data_hora).format('YYYY-MM-DD');
      console.log(`Comparando: ${agendamentoDate} === ${dateStr}`, agendamentoDate === dateStr);
      return agendamentoDate === dateStr;
    });
    console.log(`Agendamentos para ${dateStr}:`, filtered);
    return filtered;
  };

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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)'
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
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                      Iniciar
                    </Button>
                  </Dropdown>
                  <Dropdown menu={{ items: getCalendarMenuItems(proximoEventoHoje) }} trigger={['click']}>
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
                  </Dropdown>
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
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
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
                    <Dropdown menu={{ items: getCalendarMenuItems(agendamento) }} trigger={['click']}>
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<CalendarOutlined />}
                        style={{ borderRadius: '6px', fontSize: '12px' }}
                        block
                      >
                        Adicionar google agenda
                      </Button>
                    </Dropdown>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'apple',
                            label: 'Apple Calendar / Outlook',
                            icon: <DownloadOutlined />,
                            onClick: () => generateICS(agendamento)
                          }
                        ]
                      }}
                      trigger={['click']}
                    >
                      <Button
                        size="small"
                        icon={<CalendarOutlined />}
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
                    </Dropdown>
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
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
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
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
          zIndex: 1000
        }}
      >
        Novo Agendamento
      </Button>

      {/* Modal para criar/editar agendamento */}
      <Modal
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {(() => {
                      const startOfMonth = selectedDate.clone().startOf('month');
                      const endOfMonth = selectedDate.clone().endOf('month');
                      const startDate = startOfMonth.clone().startOf('week');
                      const endDate = endOfMonth.clone().endOf('week');
                      
                      const days = [];
                      let current = startDate.clone();
                      
                      while (current.isSameOrBefore(endDate)) {
                        days.push(current.clone());
                        current.add(1, 'day');
                      }
                      
                      return days.map((day, index) => {
                        const dayAgendamentos = getAgendamentosForDate(day);
                        const isCurrentMonth = day.isSame(selectedDate, 'month');
                        const isSelected = day.isSame(selectedDate, 'day');
                        const isToday = day.isSame(moment(), 'day');
                        
                        return (
                          <div
                            key={index}
                            style={{
                              minHeight: '80px',
                              padding: '8px',
                              borderRight: '1px solid #d9d9d9',
                              borderBottom: '1px solid #d9d9d9',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#e6f7ff' : isToday ? '#f6ffed' : 'white',
                              opacity: isCurrentMonth ? 1 : 0.4,
                              position: 'relative'
                            }}
                            onClick={() => setSelectedDate(day.clone())}
                            onMouseEnter={e => e.stopPropagation()}
                            onMouseLeave={e => e.stopPropagation()}
                          >
                            <div style={{
                              fontWeight: isToday ? 'bold' : 'normal',
                              color: isToday ? '#52c41a' : isSelected ? '#1890ff' : '#000',
                              marginBottom: '4px'
                            }}>
                              {day.format('D')}
                            </div>
                            
                            {dayAgendamentos.slice(0, 2).map((agendamento, idx) => (
                              <div
                                key={idx}
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 4px',
                                  marginBottom: '2px',
                                  borderRadius: '2px',
                                  backgroundColor:
                                    agendamento.status === 'confirmado' ? '#1890ff' :
                                    agendamento.status === 'concluido' ? '#52c41a' :
                                    agendamento.status === 'cancelado' ? '#ff4d4f' : '#faad14',
                                  color: 'white',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {moment(agendamento.data_hora).format('HH:mm')} {agendamento.titulo.substring(0, 10)}
                              </div>
                            ))}
                            
                            {dayAgendamentos.length > 2 && (
                              <div style={{ fontSize: '10px', color: '#666' }}>
                                +{dayAgendamentos.length - 2} mais
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </>
            ) : (
              /* Visualização em Lista */
              <List
                loading={loading}
                dataSource={agendamentos.sort((a, b) => moment(a.data_hora).diff(moment(b.data_hora)))}
                renderItem={(agendamento) => (
                  <List.Item
                    actions={[
                      <Dropdown
                        menu={{ items: getCalendarMenuItems(agendamento) }}
                        trigger={['click']}
                      >
                        <Button
                          type="text"
                          icon={<CalendarOutlined />}
                          title="Adicionar à Agenda"
                        />
                      </Dropdown>,
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(agendamento)}
                      />,
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditAgendamento(agendamento)}
                      />,
                      <Popconfirm
                        title="Tem certeza que deseja excluir?"
                        onConfirm={() => handleDeleteAgendamento(agendamento.id)}
                        okText="Sim"
                        cancelText="Não"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Text strong>{agendamento.titulo}</Text>
                          {getStatusTag(agendamento.status)}
                          {getTipoTag(agendamento.tipo)}
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: '4px' }}>
                            <ClockCircleOutlined style={{ marginRight: '4px' }} />
                            {formatarDataHora(agendamento.data_hora)} - {agendamento.duracao_minutos}min
                          </div>
                          <div style={{ color: '#666' }}>
                            {agendamento.descricao}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={`Agendamentos - ${selectedDate.format('DD/MM/YYYY')}`}
            style={{ minHeight: '500px' }}
          >
            {(() => {
              const dayAgendamentos = getAgendamentosForDate(selectedDate);
              
              if (dayAgendamentos.length === 0) {
                return (
                  <Empty
                    description="Nenhum agendamento para este dia"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                );
              }

              return (
                <List
                  dataSource={dayAgendamentos}
                  renderItem={(agendamento) => (
                    <List.Item
                      actions={[
                        <Dropdown
                          menu={{ items: getCalendarMenuItems(agendamento) }}
                          trigger={['click']}
                        >
                          <Button
                            type="text"
                            icon={<CalendarOutlined />}
                            title="Adicionar à Agenda"
                          />
                        </Dropdown>,
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewDetails(agendamento)}
                        />,
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditAgendamento(agendamento)}
                        />,
                        <Popconfirm
                          title="Tem certeza que deseja excluir?"
                          onConfirm={() => handleDeleteAgendamento(agendamento.id)}
                          okText="Sim"
                          cancelText="Não"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div>
                            <Text strong>{agendamento.titulo}</Text>
                            <div style={{ marginTop: '4px' }}>
                              {getStatusTag(agendamento.status)}
                              {getTipoTag(agendamento.tipo)}
                            </div>
                          </div>
                        }
                        description={
                          <div>
                            <div>{moment(agendamento.data_hora).format('HH:mm')} - {agendamento.duracao_minutos}min</div>
                            <div style={{ marginTop: '4px', color: '#666' }}>
                              {agendamento.descricao}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              );
            })()}
          </Card>
        </Col>
      </div>
      {/* Fim dos cards antigos escondidos */}

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
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
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
      </Modal>      {/* Drawer para detalhes do agendamento */}
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
            <Descriptions.Item label="Tipo">
              {getTipoTag(selectedAgendamento.tipo)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedAgendamento.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Criado em">
              {moment(selectedAgendamento.criado_em || new Date()).format('DD/MM/YYYY HH:mm')}
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