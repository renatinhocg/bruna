import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Button } from 'antd';
import { 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  
  // Dados fictícios para demonstração - do ponto de vista do cliente
  const stats = {
    proximasSessoes: 2,
    sessoesConcluidas: 8,
    testesRealizados: 3
  };

  const proximasSeSSoes = [
    {
      key: '1',
      data: '2024-12-15',
      horario: '14:00',
      tipo: 'Sessão de Coaching',
      status: 'confirmado',
      coach: 'Dr. João Silva'
    },
    {
      key: '2',
      data: '2024-12-18',
      horario: '16:00',
      tipo: 'Follow-up',
      status: 'agendado',
      coach: 'Dr. João Silva'
    }
  ];

  const columns = [
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
    },
    {
      title: 'Horário',
      dataIndex: 'horario',
      key: 'horario',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
    },
    {
      title: 'Coach',
      dataIndex: 'coach',
      key: 'coach',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'confirmado' ? 'green' : 'blue'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Bem-vindo(a), {user?.nome || user?.email}!</Title>
      <p>Aqui você pode acompanhar suas sessões e gerenciar seus agendamentos.</p>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Próximas Sessões"
              value={stats.proximasSessoes}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Sessões Concluídas"
              value={stats.sessoesConcluidas}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Testes Realizados"
              value={stats.testesRealizados}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card 
            title="Suas Próximas Sessões" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/agendar')}
              >
                Agendar Nova Sessão
              </Button>
            }
            style={{ marginBottom: 24 }}
          >
            <Table
              columns={columns}
              dataSource={proximasSeSSoes}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Dicas Rápidas" style={{ marginBottom: 24 }}>
            <ul style={{ paddingLeft: 20 }}>
              <li>Prepare suas perguntas antes da sessão</li>
              <li>Tenha seus objetivos claros em mente</li>
              <li>Chegue 5 minutos antes do horário</li>
              <li>Mantenha um ambiente silencioso</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
