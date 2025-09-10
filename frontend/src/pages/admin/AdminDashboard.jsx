import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Progress, List } from 'antd';
import { 
  TeamOutlined,
  CalendarOutlined, 
  DollarOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const AdminDashboard = ({ user }) => {
  // Dados estatísticos
  const stats = {
    totalClientes: 42,
    agendamentosHoje: 6,
    receitaMensal: 8400,
    taxaConclusao: 94
  };

  // Agendamentos de hoje
  const agendamentosHoje = [
    {
      key: '1',
      horario: '09:00',
      cliente: 'João Silva',
      tipo: 'Sessão de Coaching',
      status: 'confirmado'
    },
    {
      key: '2',
      horario: '10:30',
      cliente: 'Maria Santos',
      tipo: 'Avaliação',
      status: 'confirmado'
    },
    {
      key: '3',
      horario: '14:00',
      cliente: 'Pedro Costa',
      tipo: 'Follow-up',
      status: 'pendente'
    },
    {
      key: '4',
      horario: '15:30',
      cliente: 'Ana Lima',
      tipo: 'Sessão de Coaching',
      status: 'confirmado'
    }
  ];

  // Clientes recentes
  const clientesRecentes = [
    { nome: 'Carlos Oliveira', acao: 'Cadastrou-se no sistema', tempo: '2 horas atrás' },
    { nome: 'Fernanda Rocha', acao: 'Agendou uma sessão', tempo: '4 horas atrás' },
    { nome: 'Ricardo Mendes', acao: 'Completou avaliação', tempo: '1 dia atrás' },
    { nome: 'Julia Santos', acao: 'Cancelou agendamento', tempo: '2 dias atrás' }
  ];

  const columns = [
    {
      title: 'Horário',
      dataIndex: 'horario',
      key: 'horario',
      width: 80
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'confirmado' ? 'green' : 'orange'}>
          {status === 'confirmado' ? 'Confirmado' : 'Pendente'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard Administrativo</Title>
      <p>Visão geral do seu negócio de coaching</p>
      
      {/* Cards de Estatísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total de Clientes"
              value={stats.totalClientes}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Agendamentos Hoje"
              value={stats.agendamentosHoje}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Receita Mensal"
              value={stats.receitaMensal}
              prefix="R$ "
              precision={2}
              valueStyle={{ color: '#f56a00' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Taxa de Conclusão"
              value={stats.taxaConclusao}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress 
              percent={stats.taxaConclusao} 
              size="small" 
              showInfo={false}
              strokeColor="#722ed1"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Agendamentos de Hoje */}
        <Col xs={24} lg={14}>
          <Card 
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Agendamentos de Hoje
              </span>
            }
          >
            <Table
              columns={columns}
              dataSource={agendamentosHoje}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Atividades Recentes */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <span>
                <UserOutlined style={{ marginRight: 8 }} />
                Atividades Recentes
              </span>
            }
          >
            <List
              dataSource={clientesRecentes}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<UserOutlined style={{ color: '#1890ff' }} />}
                    title={item.nome}
                    description={
                      <div>
                        <div>{item.acao}</div>
                        <small style={{ color: '#999' }}>{item.tempo}</small>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Resumo Rápido */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Sessões Esta Semana"
              value={18}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Novos Clientes (Mês)"
              value={7}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Taxa de Retenção"
              value={87}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
