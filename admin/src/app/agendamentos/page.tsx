"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import DailyMeet from '../../components/DailyMeet';
import { Card, Row, Col, Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, Calendar, Dropdown } from 'antd';
import { DownOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, PlusOutlined, UnorderedListOutlined, GoogleOutlined, VideoCameraOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';

interface Usuario {
  id: number;
  nome: string;
  email?: string;
}

interface Agendamento {
  id: number;
  titulo: string;
  usuario_id: number;
  data_hora: string;
  tipo?: string;
  duracao_minutos?: number;
  status?: string;
  usuario?: {
    nome: string;
    email?: string;
    avatar_url?: string;
  };
}

interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  hangoutLink?: string;
  htmlLink?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  attendees?: { email: string; displayName?: string; responseStatus?: string; self?: boolean }[];
  creator?: { email: string; displayName?: string };
  organizer?: { email: string; displayName?: string };
  _account?: string;
}

function isToday(dateStr: string) {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isNext7Days(dateStr: string) {
  const today = new Date();
  const date = new Date(dateStr);
  const diff = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= 7;
}

export default function AgendamentosPage() {
  const router = useRouter();
  
  // URLs base para API
  const apiUrlRaw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
  const apiUrl = apiUrlRaw.endsWith('/') ? apiUrlRaw.slice(0, -1) : apiUrlRaw;
  // Google endpoints sempre precisam de /api/google/accounts
  const apiGoogle = apiUrl.endsWith('/api') ? `${apiUrl}/google/accounts` : `${apiUrl}/api/google/accounts`;
  const [googleAccounts, setGoogleAccounts] = useState<{ id: number; email: string; is_active: boolean }[]>([]);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<number | 'all' | null>(null);
  const [selectedGoogleEvent, setSelectedGoogleEvent] = useState<GoogleEvent | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  // Buscar contas Google sincronizadas
  useEffect(() => {
    async function fetchAccounts() {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) return;
      try {
        const res = await fetch(`${apiGoogle}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGoogleAccounts(Array.isArray(data) ? data : []);
          if (data.length > 0 && selectedGoogleAccount === null) setSelectedGoogleAccount(data[0].id);
        }
      } catch {}
    }
    fetchAccounts();

    // Refetch ao voltar do callback do Google
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchAccounts();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [selectedGoogleAccount, apiGoogle]);
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]);
  // Controle de mês visível no calendário
  const [calendarMonth, setCalendarMonth] = useState(dayjs());
  // Buscar eventos do Google Calendar da conta selecionada e mês visível
  useEffect(() => {
    async function fetchGoogleEvents() {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token || !selectedGoogleAccount) {
        setGoogleEvents([]);
        return;
      }
      // Calcular início e fim do mês visível
      const start = calendarMonth.startOf('month').toISOString();
      const end = calendarMonth.endOf('month').toISOString();
      try {
        if (selectedGoogleAccount === 'all') {
          // Buscar eventos de todas as contas sincronizadas
          const allEvents: GoogleEvent[] = [];
          await Promise.all(googleAccounts.map(async acc => {
            const res = await fetch(`${apiGoogle}/${acc.id}/events?timeMin=${encodeURIComponent(start)}&timeMax=${encodeURIComponent(end)}`,
              { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) allEvents.push(...data.map(ev => ({ ...ev, _account: acc.email })));
            }
          }));
          setGoogleEvents(allEvents);
        } else {
          const res = await fetch(`${apiGoogle}/${selectedGoogleAccount}/events?timeMin=${encodeURIComponent(start)}&timeMax=${encodeURIComponent(end)}`,
            { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            setGoogleEvents(Array.isArray(data) ? data : []);
          } else {
            setGoogleEvents([]);
          }
        }
      } catch {
        setGoogleEvents([]);
      }
    }
    fetchGoogleEvents();
  }, [selectedGoogleAccount, calendarMonth, googleAccounts, apiGoogle]);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  // modalLoading removido pois não é utilizado
  const [editAgendamento, setEditAgendamento] = useState<Agendamento | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form] = Form.useForm();
  
  // Estados dos filtros
  const [filtroStatus, setFiltroStatus] = useState<string>('Todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('Todos');
  const [filtroCliente, setFiltroCliente] = useState<string | number>('Todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  
  // Estados para videochamada
  const [jitsiVisible, setJitsiVisible] = useState(false);
  const [jitsiRoomName, setJitsiRoomName] = useState('');

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  const res = await fetch(`${apiUrl}/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Erro ao buscar usuários');
        const data = await res.json();
        setUsuarios(data);
      } catch {
        setUsuarios([]);
      }
    }
    fetchUsuarios();
  }, [apiUrl]);

  useEffect(() => {
    async function fetchAgendamentos() {
      try {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  const res = await fetch(`${apiUrl}/agendamentos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Erro ao buscar agendamentos');
        const data = await res.json();
        setAgendamentos(data as Agendamento[]);
      } catch {
        setAgendamentos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAgendamentos();
  }, [apiUrl]);

  const handleNovo = () => {
    setEditAgendamento(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Função para adicionar ao Google Calendar
  const addToGoogleCalendar = (agendamento: Agendamento) => {
    const startDate = dayjs(agendamento.data_hora);
    const endDate = startDate.add(agendamento.duracao_minutos || 60, 'minutes');
    
    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', agendamento.titulo);
    googleUrl.searchParams.append('details', `Cliente: ${agendamento.usuario?.nome || ''}`);
    googleUrl.searchParams.append('dates', `${startDate.format('YYYYMMDDTHHmmss')}/${endDate.format('YYYYMMDDTHHmmss')}`);
    
    window.open(googleUrl.toString(), '_blank');
  };

  // Função para gerar arquivo .ics (Apple Calendar e Outlook)
  const generateICS = (agendamento: Agendamento) => {
    const startDate = dayjs(agendamento.data_hora);
    const endDate = startDate.add(agendamento.duracao_minutos || 60, 'minutes');
    
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
      `DESCRIPTION:Cliente: ${agendamento.usuario?.nome || ''}`,
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
  };

  const handleJoinVideo = (agendamento: Agendamento) => {
    const roomName = `agendamento_${agendamento.id}`;
    setJitsiRoomName(roomName);
    setJitsiVisible(true);
  };

  const isAgendamentoHoje = (dataHora: string) => {
    const hoje = dayjs().startOf('day');
    const dataAgendamento = dayjs(dataHora).startOf('day');
    return dataAgendamento.isSame(hoje);
  };

  const isAgendamentoFuturo = (dataHora: string) => {
    return dayjs(dataHora).isAfter(dayjs());
  };
  
  const handleEditar = (agendamento: Agendamento) => {
    setEditAgendamento(agendamento);
    form.setFieldsValue(agendamento);
    setModalVisible(true);
  };

  const handleSalvar = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      // Converter dayjs para ISO string
      if (values.data_hora) {
        values.data_hora = dayjs(values.data_hora).toISOString();
      }

      const url = editAgendamento 
        ? `${apiUrl}/agendamentos/${editAgendamento.id}`
        : `${apiUrl}/agendamentos`;
      
      const method = editAgendamento ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.erro || 'Erro ao salvar agendamento');
      }

      // Recarregar agendamentos
      const resAgendamentos = await fetch(`${apiUrl}/agendamentos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resAgendamentos.json();
      setAgendamentos(data);

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar agendamento: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  // Aplicar filtros
  const agendamentosFiltrados = agendamentos.filter(a => {
    // Filtro de status
    if (filtroStatus !== 'Todos' && a.status !== filtroStatus) return false;
    
    // Filtro de tipo
    if (filtroTipo !== 'Todos' && a.tipo !== filtroTipo) return false;
    
    // Filtro de cliente
    if (filtroCliente !== 'Todos' && a.usuario_id !== filtroCliente) return false;
    
    // Filtro de período
    if (filtroPeriodo) {
      const dataAgendamento = dayjs(a.data_hora);
      const [inicio, fim] = filtroPeriodo;
      if (dataAgendamento.isBefore(inicio, 'day') || dataAgendamento.isAfter(fim, 'day')) return false;
    }
    
    return true;
  });

  const total = agendamentosFiltrados.length;
  const hoje = agendamentosFiltrados.filter(a => isToday(a.data_hora)).length;
  const proximos7 = agendamentosFiltrados.filter(a => isNext7Days(a.data_hora)).length;
  
  // Separar agendamentos em próximos e concluídos
  const agendamentosProximos = agendamentosFiltrados.filter(a => a.status !== 'concluido');
  const agendamentosConcluidos = agendamentosFiltrados.filter(a => a.status === 'concluido');

  const columns = [
    {
      title: 'Data/Hora',
      dataIndex: 'data_hora',
      key: 'data_hora',
      render: (text: string) => {
        const date = new Date(text);
        return (
          <span>
            {isNaN(date.getTime()) ? '-' : date.toLocaleDateString()}<br />
            <span style={{ color: '#888', fontSize: 12 }}>{isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
        );
      },
    },
    {
      title: 'Cliente',
      dataIndex: ['usuario', 'nome'],
      key: 'cliente_nome',
      render: (_: unknown, record: Agendamento) => (
        <Space><UserOutlined />{record.usuario?.nome || `Cliente #${record.usuario_id}`}</Space>
      ),
    },
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo: string) => tipo ? <Tag color="cyan">{tipo}</Tag> : null,
    },
    {
      title: 'Duração',
      dataIndex: 'duracao_minutos',
      key: 'duracao_minutos',
      render: (min: number) => min ? <><ClockCircleOutlined /> {min} min</> : null,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => status ? <Tag color={status === 'pendente' ? 'orange' : status === 'agendado' ? 'blue' : 'green'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag> : null,
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: unknown, record: Agendamento) => (
        <Space>
          {(isAgendamentoHoje(record.data_hora) || isAgendamentoFuturo(record.data_hora)) && 
           ['confirmado', 'agendado'].includes(record.status || '') && (
            <Button
              type="primary"
              icon={<VideoCameraOutlined />}
              onClick={() => handleJoinVideo(record)}
              size="small"
              style={{
                background: isAgendamentoHoje(record.data_hora) ? '#52c41a' : undefined,
                borderColor: isAgendamentoHoje(record.data_hora) ? '#52c41a' : undefined
              }}
              title="Entrar na videochamada"
            />
          )}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'google',
                  label: 'Google Calendar',
                  icon: <GoogleOutlined />,
                  onClick: () => addToGoogleCalendar(record)
                },
                {
                  key: 'ics',
                  label: 'Apple / Outlook (.ics)',
                  icon: <CalendarOutlined />,
                  onClick: () => generateICS(record)
                }
              ]
            }}
            trigger={['click']}
          >
            <Button size="small" icon={<CalendarOutlined />}>
              Agenda <DownOutlined />
            </Button>
          </Dropdown>
          <Button 
            size="small" 
            type={record.status === 'concluido' ? 'default' : 'primary'}
            onClick={() => router.push(`/agendamentos/${record.id}`)}
          >
            {record.status === 'concluido' ? 'Ver' : 'Iniciar'}
          </Button>
          <Button size="small" type="link" onClick={() => handleEditar(record)}>Editar</Button>
          <Button size="small" type="link" danger>Excluir</Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Agendamentos</h1>

      {/* Filtros */}
      <Card style={{ marginBottom: 24 }}>
        <Form layout="inline">
          <Form.Item label="Status">
            <Select 
              value={filtroStatus} 
              onChange={setFiltroStatus}
              style={{ minWidth: 120 }}
            >
              <Select.Option value="Todos">Todos</Select.Option>
              <Select.Option value="agendado">Agendado</Select.Option>
              <Select.Option value="pendente">Pendente</Select.Option>
              <Select.Option value="realizado">Realizado</Select.Option>
              <Select.Option value="concluido">Concluído</Select.Option>
              <Select.Option value="cancelado">Cancelado</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Tipo">
            <Select 
              value={filtroTipo}
              onChange={setFiltroTipo}
              style={{ minWidth: 120 }}
            >
              <Select.Option value="Todos">Todos</Select.Option>
              <Select.Option value="sessao">Sessão</Select.Option>
              <Select.Option value="consulta">Consulta</Select.Option>
              <Select.Option value="avaliacao">Avaliação</Select.Option>
              <Select.Option value="outro">Outro</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Cliente">
            <Select 
              value={filtroCliente}
              onChange={setFiltroCliente}
              style={{ minWidth: 200 }}
              showSearch
              filterOption={(input, option) => {
                const label = option?.label || option?.children;
                return String(label).toLowerCase().includes(input.toLowerCase());
              }}
            >
              <Select.Option value="Todos">Todos</Select.Option>
              {usuarios.map(u => (
                <Select.Option key={u.id} value={u.id}>{u.nome}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Período">
            <DatePicker.RangePicker 
              value={filtroPeriodo}
              onChange={(dates) => setFiltroPeriodo(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
              style={{ minWidth: 220 }} 
            />
          </Form.Item>
          <Form.Item>
            <Button 
              onClick={() => {
                setFiltroStatus('Todos');
                setFiltroTipo('Todos');
                setFiltroCliente('Todos');
                setFiltroPeriodo(null);
              }}
            >
              Limpar Filtros
            </Button>
          </Form.Item>
        </Form>
      </Card>
      {/* Cards de estatísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><div style={{ fontSize: 16 }}>Total de Agendamentos</div><div style={{ fontSize: 28, fontWeight: 600 }}><CalendarOutlined /> {total}</div></Card></Col>
        <Col span={6}><Card><div style={{ fontSize: 16 }}>Agendamentos Hoje</div><div style={{ fontSize: 28, fontWeight: 600 }}><CalendarOutlined /> {hoje}</div></Card></Col>
        <Col span={6}><Card><div style={{ fontSize: 16 }}>Próximos 7 Dias</div><div style={{ fontSize: 28, fontWeight: 600 }}><ClockCircleOutlined /> {proximos7}</div></Card></Col>
        <Col span={6}><Card><div style={{ fontSize: 16 }}>Concluídos</div><div style={{ fontSize: 28, fontWeight: 600, color: '#52c41a' }}><CalendarOutlined /> {agendamentosConcluidos.length}</div></Card></Col>
      </Row>

      {/* Botões de ação estilizados e alternância de visão */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Space>
          <Space.Compact>
            <Button
              icon={<UnorderedListOutlined />}
              type={view === 'list' ? 'primary' : 'default'}
              style={{ fontWeight: 500, minWidth: 90 }}
              onClick={() => setView('list')}
            >
              Lista
            </Button>
            <Button
              icon={<CalendarOutlined />}
              type={view === 'calendar' ? 'primary' : 'default'}
              style={{ fontWeight: 500, minWidth: 110 }}
              onClick={() => setView('calendar')}
            >
              Calendário
            </Button>
          </Space.Compact>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNovo}
            style={{ fontWeight: 500, minWidth: 170 }}
          >
            Novo Agendamento
          </Button>
          <Dropdown
            menu={{
              items: [
                ...googleAccounts.map(acc => ({
                  key: acc.id.toString(),
                  label: (
                    <span style={{ fontWeight: acc.id === selectedGoogleAccount ? 600 : 400 }}>
                      {acc.email}
                      <Button
                        size="small"
                        type="link"
                        icon={<DeleteOutlined />}
                        danger
                        style={{ marginLeft: 8 }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
                          const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
                          await fetch(`${apiUrl}/google/accounts/${acc.id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          setGoogleAccounts(prev => prev.filter(a => a.id !== acc.id));
                          if (selectedGoogleAccount === acc.id) setSelectedGoogleAccount(null);
                        }}
                      >Desincronizar</Button>
                    </span>
                  ),
                  onClick: () => setSelectedGoogleAccount(acc.id),
                })),
                { type: 'divider' },
                {
                  key: 'add',
                  label: (
                    <span><PlusCircleOutlined /> Sincronizar outra conta</span>
                  ),
                  onClick: async () => {
                    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
                    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
                    const res = await fetch(`${apiUrl}/google/login`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }
                }
              ]
            }}
            trigger={['click']}
          >
            <Button
              icon={<GoogleOutlined />}
              style={{ background: '#4285F4', color: '#fff', border: 'none', fontWeight: 500, minWidth: 210 }}
            >
              {googleAccounts.length > 0
                ? (<span>{googleAccounts.find(a => a.id === selectedGoogleAccount)?.email || 'Selecionar conta Google'} <DownOutlined /></span>)
                : 'Conectar Google Agenda'}
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* Modal de cadastro/edição */}
      <Modal
        title={editAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSalvar}
        okText={editAgendamento ? 'Atualizar' : 'Criar'}
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'agendado', tipo: 'sessao', duracao_minutos: 60 }}
        >
          <Form.Item name="usuario_id" label="Cliente" rules={[{ required: true, message: 'Selecione o cliente' }]}> 
            <Select showSearch placeholder="Selecione o cliente">
              {usuarios.map((u) => (
                <Select.Option key={u.id} value={u.id}>{u.nome} {u.email && `(${u.email})`}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Informe o título' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="descricao" label="Descrição"> 
            <Input.TextArea placeholder="Descreva o objetivo do agendamento (opcional)" />
          </Form.Item>
          <Form.Item name="data_hora" label="Data e Hora" rules={[{ required: true, message: 'Informe a data e hora' }]}> 
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duracao_minutos" label="Duração (minutos)" rules={[{ required: true, message: 'Informe a duração' }]}> 
            <Select>
              <Select.Option value={30}>30 minutos</Select.Option>
              <Select.Option value={60}>1 hora</Select.Option>
              <Select.Option value={90}>1h30</Select.Option>
              <Select.Option value={120}>2 horas</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: 'Selecione o tipo' }]}> 
            <Select>
              <Select.Option value="sessao">Sessão</Select.Option>
              <Select.Option value="outro">Outro</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Selecione o status' }]}> 
            <Select>
              <Select.Option value="agendado">Agendado</Select.Option>
              <Select.Option value="pendente">Pendente</Select.Option>
              <Select.Option value="concluido">Concluído</Select.Option>
              <Select.Option value="cancelado">Cancelado</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Alternância entre lista e calendário */}
      {view === 'list' ? (
        <>
          {/* Seção de Próximos Agendamentos */}
          <Card 
            title={<span style={{ fontSize: 18, fontWeight: 600 }}>📅 Próximos Agendamentos</span>} 
            style={{ marginBottom: 24 }}
          >
            <Table
              columns={columns}
              dataSource={agendamentosProximos}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'Nenhum agendamento próximo' }}
            />
          </Card>

          {/* Seção de Agendamentos Concluídos */}
          <Card 
            title={<span style={{ fontSize: 18, fontWeight: 600 }}>✅ Agendamentos Concluídos</span>}
          >
            <Table
              columns={columns}
              dataSource={agendamentosConcluidos}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'Nenhum agendamento concluído' }}
            />
          </Card>
        </>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
          <Calendar
            value={calendarMonth}
            onPanelChange={date => setCalendarMonth(dayjs(date))}
            dateCellRender={date => {
              const dayAgs = agendamentos.filter(ag => dayjs(ag.data_hora).isSame(date, 'day'));
              const dayGoogle = googleEvents.filter(ev => {
                const evDate = ev.start?.dateTime || ev.start?.date;
                return evDate && dayjs(evDate).isSame(date, 'day');
              });
              return (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {dayAgs.map(ag => (
                    <li key={ag.id}>
                      <Tag color="blue" style={{ marginBottom: 2, maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                        {ag.usuario?.nome || `Cliente #${ag.usuario_id}`}
                      </Tag>
                    </li>
                  ))}
                  {dayGoogle.map(ev => {
                    // Definir cor por conta Google
                    const googleColors = ['green', 'volcano', 'geekblue', 'purple', 'magenta', 'gold', 'cyan', 'lime'];
                    let color = 'green';
                    if (ev._account) {
                      const idx = googleAccounts.findIndex(acc => acc.email === ev._account);
                      color = googleColors[idx % googleColors.length];
                    } else if (selectedGoogleAccount && selectedGoogleAccount !== 'all') {
                      const idx = googleAccounts.findIndex(acc => acc.id === selectedGoogleAccount);
                      color = googleColors[idx % googleColors.length];
                    }
                    return (
                      <li key={ev.id}>
                        <Tag
                          color={color}
                          style={{ marginBottom: 2, maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', cursor: 'pointer' }}
                          onClick={e => {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            const popoverHeight = 280; // altura estimada do popover
                            let y = rect.top;
                            // Se não couber embaixo, mostra acima
                            if (rect.bottom + popoverHeight > window.innerHeight - 24) {
                              y = rect.top - popoverHeight;
                              if (y < 0) y = 8; // nunca sair do topo
                            }
                            setPopoverPos({ x: rect.right + 8, y });
                            setSelectedGoogleEvent(ev);
                          }}
                        >
                          {ev.summary}
                        </Tag>
                      </li>
                    );
                  })}
      {/* Popover de detalhes do evento Google */}
      {selectedGoogleEvent && popoverPos && (
        <div
          style={{
            position: 'fixed',
            left: popoverPos.x,
            top: popoverPos.y,
            zIndex: 9999,
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #eee',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: 24,
            minWidth: 340,
            maxWidth: 400,
            fontSize: 16,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>{selectedGoogleEvent.summary}</span>
            <Button type="text" size="small" onClick={() => { setSelectedGoogleEvent(null); setPopoverPos(null); }}>×</Button>
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>Data/Hora:</b> {selectedGoogleEvent.start?.dateTime ? dayjs(selectedGoogleEvent.start.dateTime).format('DD/MM/YYYY HH:mm') : selectedGoogleEvent.start?.date ? dayjs(selectedGoogleEvent.start.date).format('DD/MM/YYYY') : '-'}
            {selectedGoogleEvent.end?.dateTime && selectedGoogleEvent.start?.dateTime &&
              <> - {dayjs(selectedGoogleEvent.end.dateTime).format('HH:mm')}</>}
          </div>
          {selectedGoogleEvent.hangoutLink && (
            <div style={{ marginBottom: 8 }}>
              <a href={selectedGoogleEvent.hangoutLink} target="_blank" rel="noopener noreferrer">
                <Button type="primary">Entrar com o Google Meet</Button>
              </a>
            </div>
          )}
          {selectedGoogleEvent.location && (
            <div style={{ marginBottom: 8 }}><b>Local:</b> {selectedGoogleEvent.location}</div>
          )}
          {selectedGoogleEvent.attendees && selectedGoogleEvent.attendees.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <b>Convidados:</b>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {selectedGoogleEvent.attendees.map((a, i) => (
                  <li key={a.email + i} style={{ color: a.self ? '#1890ff' : undefined }}>
                    {a.displayName || a.email} {a.responseStatus === 'accepted' ? '✔️' : a.responseStatus === 'declined' ? '❌' : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedGoogleEvent.creator && (
            <div style={{ marginBottom: 8 }}><b>Criado por:</b> {selectedGoogleEvent.creator.displayName || selectedGoogleEvent.creator.email}</div>
          )}
          {selectedGoogleEvent.description && (
            <div style={{ marginBottom: 8 }}><b>Descrição:</b><br />
              <span style={{ whiteSpace: 'pre-line' }}>{selectedGoogleEvent.description}</span>
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <a href={selectedGoogleEvent.htmlLink} target="_blank" rel="noopener noreferrer">Abrir no Google Agenda</a>
          </div>
        </div>
      )}
                </ul>
              );
            }}
            fullscreen={true}
          />
        </div>
      )}

      <DailyMeet
        visible={jitsiVisible}
        roomName={jitsiRoomName}
        displayName="BM Consultoria"
        onClose={() => setJitsiVisible(false)}
      />
    </AdminLayout>
  );
}