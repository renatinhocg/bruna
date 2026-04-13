'use client';

import { Typography, Card, Row, Col, Statistic, Table, Button, Avatar, Tag } from 'antd';
import {
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';

const { Title } = Typography;

const mockStats = {
  totalClientes: 156,
  agendamentosHoje: 8,
  sessoesMes: 124,
  taxaCrescimento: 12.5
};

const mockAgendamentos = [
  {
    key: '1',
    cliente: 'João Silva',
    titulo: 'Sessão de Coaching',
    hora: '09:00',
    status: 'confirmado'
  },
  {
    key: '2',
    cliente: 'Maria Santos',
    titulo: 'Avaliação de Carreira',
    hora: '14:00',
    status: 'pendente'
  },
  {
    key: '3',
    cliente: 'Pedro Costa',
    titulo: 'Follow-up',
    hora: '16:30',
    status: 'confirmado'
  }
];

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar size="small" style={{ marginRight: 8, backgroundColor: '#1890ff' }}>
            {text.charAt(0)}
          </Avatar>
          {text}
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
      dataIndex: 'hora',
      key: 'hora',
      render: (hora: string) => (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          {hora}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'confirmado' ? 'green' : 'orange'}>
          {status === 'confirmado' ? 'Confirmado' : 'Pendente'}
        </Tag>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div>
        <Title level={2}>Dashboard</Title>
        
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total de Clientes"
                value={mockStats.totalClientes}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Agendamentos Hoje"
                value={mockStats.agendamentosHoje}
                prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Sessões este Mês"
                value={mockStats.sessoesMes}
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Crescimento"
                value={mockStats.taxaCrescimento}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="Agendamentos de Hoje"
          extra={<Button type="primary">Ver Todos</Button>}
        >
          <Table 
            dataSource={mockAgendamentos} 
            columns={columns} 
            pagination={false}
            size="middle"
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
