import React from 'react';
import { Row, Col, Card, Statistic, Typography, List, Avatar } from 'antd';
import { UserOutlined, FileTextOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title } = Typography;

function Dashboard({ user }) {
  const stats = [
    {
      title: 'Testes Realizados',
      value: 3,
      icon: <FileTextOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Agendamentos',
      value: 2,
      icon: <CalendarOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Pontuação Total',
      value: 85,
      icon: <TrophyOutlined />,
      color: '#faad14'
    }
  ];

  const recentActivities = [
    {
      title: 'Teste de Personalidade Myers-Briggs',
      description: 'Completado em 15/09/2024',
      avatar: <FileTextOutlined />
    },
    {
      title: 'Sessão de Coaching',
      description: 'Agendada para 20/09/2024',
      avatar: <CalendarOutlined />
    },
    {
      title: 'Avaliação de Carreira',
      description: 'Em andamento',
      avatar: <UserOutlined />
    }
  ];

  return (
    <div>
      <Title level={2}>Bem-vindo, {user?.nome || 'Usuário'}!</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={8} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<span style={{ color: stat.color, fontSize: '24px' }}>{stat.icon}</span>}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Atividades Recentes" style={{ height: '100%' }}>
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={item.avatar} style={{ backgroundColor: '#1890ff' }} />}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Próximos Passos" style={{ height: '100%' }}>
            <List
              dataSource={[
                'Complete o teste de avaliação de carreira',
                'Agende sua próxima sessão de coaching',
                'Revise seus objetivos profissionais',
                'Atualize seu currículo'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#52c41a' }}>✓</Avatar>}
                    title={item}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;