'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Table, Space } from 'antd';
import {
  BarChartOutlined,
  UserOutlined,
  ProjectOutlined,
  CalendarOutlined,
  RiseOutlined,
  BulbOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import AdminLayout from '../../components/AdminLayout';

const { Title, Text } = Typography;

export default function RelatoriosPage() {
  const testStats = [
    { name: 'Teste DISC', count: 142, percent: 85, color: '#3b82f6' },
    { name: 'Dominância Cerebral', count: 98, percent: 60, color: '#10b981' },
    { name: 'Múltiplas Inteligências', count: 120, percent: 75, color: '#8b5cf6' }
  ];

  const recentActivites = [
    { key: '1', usuario: 'João Carlos', teste: 'Teste DISC', data: '01/06/2026', status: 'Concluído' },
    { key: '2', usuario: 'Mariana Souza', teste: 'Múltiplas Inteligências', data: '31/05/2026', status: 'Concluído' },
    { key: '3', usuario: 'Ricardo Pereira', teste: 'Dominância Cerebral', data: '30/05/2026', status: 'Concluído' },
    { key: '4', usuario: 'Fernanda Lima', teste: 'Teste DISC', data: '28/05/2026', status: 'Concluído' }
  ];

  const columns = [
    { title: 'Usuário / Cliente', dataIndex: 'usuario', key: 'usuario', render: (text: string) => <strong>{text}</strong> },
    { title: 'Avaliação', dataIndex: 'teste', key: 'teste' },
    { title: 'Data de Conclusão', dataIndex: 'data', key: 'data' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <Text type="success">{status}</Text>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <BarChartOutlined style={{ marginRight: 8, color: '#7c3aed' }} />
            Relatórios e Métricas
          </Title>
          <Text type="secondary">
            Visão geral de testes realizados, crescimento de usuários e dados de engajamento da plataforma.
          </Text>
        </div>

        {/* Stats Grid */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 8 }}>
              <Statistic
                title="Total de Testes Realizados"
                value={360}
                prefix={<RiseOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 8 }}>
              <Statistic
                title="Usuários Ativos"
                value={254}
                prefix={<UserOutlined style={{ color: '#10b981', marginRight: 8 }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 8 }}>
              <Statistic
                title="Vagas Abertas"
                value={18}
                prefix={<ProjectOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 8 }}>
              <Statistic
                title="Sessões Agendadas"
                value={42}
                prefix={<CalendarOutlined style={{ color: '#f59e0b', marginRight: 8 }} />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Test Distribution Chart Column */}
          <Col xs={24} lg={10}>
            <Card title="Distribuição de Testes" bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 8, height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '8px 0' }}>
                {testStats.map((item) => (
                  <div key={item.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <Text type="secondary">{item.count} testes</Text>
                    </div>
                    <Progress percent={item.percent} strokeColor={item.color} showInfo={false} strokeWidth={8} />
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Recent Activity Table Column */}
          <Col xs={24} lg={14}>
            <Card title="Atividades Recentes de Avaliação" bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 8, height: '100%' }}>
              <Table
                columns={columns}
                dataSource={recentActivites}
                pagination={false}
                size="middle"
                style={{ borderRadius: 8, overflow: 'hidden' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
