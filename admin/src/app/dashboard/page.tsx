'use client';

import { Typography, Card, Row, Col, Statistic, Table, Button, Avatar, Tag, Spin, Empty, Badge } from 'antd';
import {
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import apiService from '@/services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const { Title, Text } = Typography;

interface Agendamento {
  id: number;
  titulo: string;
  data_hora: string;
  status: string;
  usuario?: {
    nome: string;
    avatar_url?: string;
  };
}

interface Teste {
  id: number;
  created_at: string;
  autorizado: boolean;
  usuario?: {
    nome: string;
    avatar_url?: string;
  };
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  avatar_url?: string;
}

interface Contato {
  id: number;
  nome: string;
  email: string;
  status: string;
}

interface DashboardStats {
  totalUsuarios: number;
  novosUsuarios: number;
  totalTestes: number;
  agendamentosHoje: number;
  contatosPendentes: number;
  agendamentosHojeList: Agendamento[];
}

interface RecentActivities {
  testesRecentes: Teste[];
  usuariosRecentes: Usuario[];
  contatosRecentes: Contato[];
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    novosUsuarios: 0,
    totalTestes: 0,
    agendamentosHoje: 0,
    contatosPendentes: 0,
    agendamentosHojeList: []
  });
  const [activities, setActivities] = useState<RecentActivities>({
    testesRecentes: [],
    usuariosRecentes: [],
    contatosRecentes: []
  });

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, recentActivities] = await Promise.all([
        apiService.getDashboardOverview(),
        apiService.getRecentActivities()
      ]);
      
      setStats(dashboardStats);
      setActivities(recentActivities);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const agendamentosColumns = [
    {
      title: 'Cliente',
      key: 'cliente',
      render: (record: Agendamento) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size="small" 
            style={{ marginRight: 8, backgroundColor: '#1890ff' }}
            src={record.usuario?.avatar_url}
          >
            {record.usuario?.nome?.charAt(0) || '?'}
          </Avatar>
          {record.usuario?.nome || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
    },
    {
      title: 'Horário',
      key: 'horario',
      render: (record: Agendamento) => (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          {dayjs(record.data_hora).format('HH:mm')}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          pendente: 'orange',
          confirmado: 'green',
          concluido: 'blue',
          cancelado: 'red'
        };
        const labels: Record<string, string> = {
          pendente: 'Pendente',
          confirmado: 'Confirmado',
          concluido: 'Concluído',
          cancelado: 'Cancelado'
        };
        return (
          <Tag color={colors[status] || 'default'}>
            {labels[status] || status}
          </Tag>
        );
      },
    },
  ];

  const testesColumns = [
    {
      title: 'Usuário',
      key: 'usuario',
      render: (record: Teste) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size="small" 
            style={{ marginRight: 8, backgroundColor: '#52c41a' }}
            src={record.usuario?.avatar_url}
          >
            {record.usuario?.nome?.charAt(0) || '?'}
          </Avatar>
          {record.usuario?.nome || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Tipo',
      key: 'tipo',
      render: () => (
        <Tag icon={<BulbOutlined />} color="purple">
          Múltiplas Inteligências
        </Tag>
      ),
    },
    {
      title: 'Data',
      key: 'data',
      render: (record: Teste) => dayjs(record.created_at).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'autorizado',
      key: 'autorizado',
      render: (autorizado: boolean) => (
        <Tag color={autorizado ? 'green' : 'orange'}>
          {autorizado ? 'Autorizado' : 'Pendente'}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
          <Button type="primary" onClick={loadDashboardData}>
            Atualizar Dados
          </Button>
        </div>
        
        {/* Cards de Estatísticas */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => router.push('/usuarios')}>
              <Statistic
                title="Total de Usuários"
                value={stats.totalUsuarios}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
                suffix={
                  stats.novosUsuarios > 0 && (
                    <Badge 
                      count={`+${stats.novosUsuarios} novos`} 
                      style={{ backgroundColor: '#52c41a', marginLeft: 8 }}
                    />
                  )
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => router.push('/agendamentos')}>
              <Statistic
                title="Agendamentos Hoje"
                value={stats.agendamentosHoje}
                prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => router.push('/multiplas-inteligencias')}>
              <Statistic
                title="Testes Realizados"
                value={stats.totalTestes}
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => router.push('/contatos')}>
              <Statistic
                title="Contatos Pendentes"
                value={stats.contatosPendentes}
                prefix={<MessageOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Agendamentos de Hoje */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} xl={16}>
            <Card
              title={
                <span>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Agendamentos de Hoje
                </span>
              }
              extra={<Button type="link" onClick={() => router.push('/agendamentos')}>Ver Todos</Button>}
            >
              {stats.agendamentosHojeList.length > 0 ? (
                <Table 
                  dataSource={stats.agendamentosHojeList} 
                  columns={agendamentosColumns} 
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              ) : (
                <Empty 
                  description="Nenhum agendamento para hoje"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>

          {/* Resumo Rápido */}
          <Col xs={24} xl={8}>
            <Card 
              title={
                <span>
                  <CheckCircleOutlined style={{ marginRight: 8 }} />
                  Resumo Rápido
                </span>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Novos Usuários (30 dias)</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <UserAddOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                    <Text strong style={{ fontSize: '20px' }}>{stats.novosUsuarios}</Text>
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Testes Pendentes</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <ClockCircleOutlined style={{ color: '#faad14', fontSize: '20px' }} />
                    <Text strong style={{ fontSize: '20px' }}>
                      {activities.testesRecentes.filter((t: Teste) => !t.autorizado).length}
                    </Text>
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Contatos Não Lidos</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <MessageOutlined style={{ color: '#722ed1', fontSize: '20px' }} />
                    <Text strong style={{ fontSize: '20px' }}>{stats.contatosPendentes}</Text>
                  </div>
                </div>

                <Button 
                  type="primary" 
                  block 
                  style={{ marginTop: '16px' }}
                  onClick={() => router.push('/multiplas-inteligencias')}
                >
                  Ver Testes Pendentes
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Atividades Recentes */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title={
                <span>
                  <TrophyOutlined style={{ marginRight: 8 }} />
                  Testes Recentes
                </span>
              }
              extra={<Button type="link" onClick={() => router.push('/multiplas-inteligencias')}>Ver Todos</Button>}
            >
              {activities.testesRecentes.length > 0 ? (
                <Table 
                  dataSource={activities.testesRecentes} 
                  columns={testesColumns} 
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              ) : (
                <Empty 
                  description="Nenhum teste realizado recentemente"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
