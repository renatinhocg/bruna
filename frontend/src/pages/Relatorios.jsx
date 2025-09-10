import React from 'react';
import { Card, Row, Col, Statistic, Table, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const Relatorios = () => {
  // Dados fictícios para demonstração
  const agendamentosPorMes = [
    { mes: 'Jan', agendamentos: 12, concluidos: 10 },
    { mes: 'Fev', agendamentos: 19, concluidos: 16 },
    { mes: 'Mar', agendamentos: 15, concluidos: 14 },
    { mes: 'Abr', agendamentos: 22, concluidos: 20 },
    { mes: 'Mai', agendamentos: 18, concluidos: 17 },
    { mes: 'Jun', agendamentos: 25, concluidos: 22 },
  ];

  const tiposSessao = [
    {
      key: '1',
      tipo: 'Sessão de Coaching',
      total: 45,
      concluidas: 42,
      taxa: '93%'
    },
    {
      key: '2',
      tipo: 'Avaliação',
      total: 18,
      concluidas: 18,
      taxa: '100%'
    },
    {
      key: '3',
      tipo: 'Follow-up',
      total: 22,
      concluidas: 20,
      taxa: '91%'
    },
  ];

  const columns = [
    {
      title: 'Tipo de Sessão',
      dataIndex: 'tipo',
      key: 'tipo',
    },
    {
      title: 'Total Agendado',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'Concluídas',
      dataIndex: 'concluidas',
      key: 'concluidas',
    },
    {
      title: 'Taxa de Conclusão',
      dataIndex: 'taxa',
      key: 'taxa',
    },
  ];

  return (
    <div>
      <Title level={2}>Relatórios e Estatísticas</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total de Sessões (6 meses)"
              value={111}
              suffix="sessões"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Taxa de Conclusão Geral"
              value={94}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Receita Estimada"
              value={15750}
              prefix="R$ "
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Média Mensal"
              value={18.5}
              suffix="sessões"
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={14}>
          <Card title="Agendamentos por Mês" style={{ marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={agendamentosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="agendamentos" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="Agendamentos"
                />
                <Line 
                  type="monotone" 
                  dataKey="concluidos" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  name="Concluídos"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Performance por Tipo de Sessão">
            <Table
              columns={columns}
              dataSource={tiposSessao}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Relatorios;
