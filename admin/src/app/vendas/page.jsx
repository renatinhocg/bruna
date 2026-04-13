'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Space,
  Select,
  DatePicker,
  Button,
  Statistic,
  Row,
  Col,
  message
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import AdminLayout from '../../components/AdminLayout';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function VendasPage() {
  const [compras, setCompras] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    status: undefined,
    produto_id: undefined,
    periodo: 'mes'
  });

  useEffect(() => {
    carregarCompras();
    carregarEstatisticas();
  }, [filtros]);

  const carregarCompras = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.produto_id) params.append('produto_id', filtros.produto_id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api/compras/todas?${params}`
      );
      const data = await response.json();
      setCompras(data);
    } catch (error) {
      message.error('Erro ao carregar compras');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api/produtos/stats/vendas?periodo=${filtros.periodo}`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const statusConfig = {
    pendente: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pendente' },
    pago: { color: 'success', icon: <CheckCircleOutlined />, text: 'Pago' },
    cancelado: { color: 'error', icon: <CloseCircleOutlined />, text: 'Cancelado' },
    expirado: { color: 'default', icon: <CloseCircleOutlined />, text: 'Expirado' }
  };

  const aprovarCompra = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api/compras/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pago' })
      });
      message.success('Compra aprovada!');
      carregarCompras();
    } catch (err) {
      message.error('Erro ao aprovar compra');
    }
  };

  const cancelarCompra = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api/compras/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelado' })
      });
      message.success('Compra cancelada!');
      carregarCompras();
    } catch (err) {
      message.error('Erro ao cancelar compra');
    }
  };

  const deletarCompra = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api/compras/${id}`, {
        method: 'DELETE'
      });
      message.success('Compra removida!');
      carregarCompras();
    } catch (err) {
      message.error('Erro ao remover compra');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Produto',
      dataIndex: ['produto', 'nome'],
      key: 'produto',
      render: (nome, record) => (
        <Space>
          <span style={{ fontSize: '18px' }}>{record.produto?.icone}</span>
          <span>{nome}</span>
        </Space>
      )
    },
    {
      title: 'Valor',
      dataIndex: 'valor',
      key: 'valor',
      render: (valor) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          R$ {parseFloat(valor).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = statusConfig[status] || statusConfig.pendente;
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: 'Pagamento',
      dataIndex: 'metodo_pagamento',
      key: 'metodo_pagamento',
      render: (metodo) => (
        <Tag color="blue">{metodo?.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Data',
      dataIndex: 'criado_em',
      key: 'criado_em',
      render: (data) => dayjs(data).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Pago em',
      dataIndex: 'paid_at',
      key: 'paid_at',
      render: (data) => data ? dayjs(data).format('DD/MM/YYYY HH:mm') : '-'
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <Space>
          {record.status !== 'pago' && (
            <Button size="small" type="primary" onClick={() => aprovarCompra(record.id)}>Aprovar</Button>
          )}
          {record.status !== 'cancelado' && (
            <Button size="small" danger onClick={() => cancelarCompra(record.id)}>Cancelar</Button>
          )}
          <Button size="small" onClick={() => deletarCompra(record.id)}>Excluir</Button>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      {/* Estatísticas */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total de Vendas"
                value={stats.totalVendas}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Receita Total"
                value={stats.receitaTotal}
                prefix="R$"
                precision={2}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Ticket Médio"
                value={stats.totalVendas > 0 ? (stats.receitaTotal / stats.totalVendas).toFixed(2) : 0}
                prefix="R$"
                precision={2}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Select
                value={filtros.periodo}
                onChange={(value) => setFiltros({ ...filtros, periodo: value })}
                style={{ width: '100%' }}
              >
                <Option value="hoje">Hoje</Option>
                <Option value="semana">7 dias</Option>
                <Option value="mes">30 dias</Option>
                <Option value="ano">1 ano</Option>
                <Option value="total">Total</Option>
              </Select>
            </Card>
          </Col>
        </Row>
      )}

      {/* Produtos mais vendidos */}
      {stats?.vendasPorProduto && stats.vendasPorProduto.length > 0 && (
        <Card 
          title="📊 Produtos Mais Vendidos" 
          style={{ marginBottom: '24px' }}
        >
          <Row gutter={16}>
            {stats.vendasPorProduto.slice(0, 4).map((item) => (
              <Col span={6} key={item.produto_id}>
                <Card size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <span style={{ fontSize: '24px' }}>{item.produto_icone}</span>
                    <span style={{ fontWeight: 'bold' }}>{item.produto_nome}</span>
                    <Statistic
                      value={item.quantidade}
                      suffix="vendas"
                      valueStyle={{ fontSize: '18px' }}
                    />
                    <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                      R$ {parseFloat(item.receita).toFixed(2)}
                    </span>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Tabela de compras */}
      <Card
        title={<span style={{ fontSize: '20px', fontWeight: 'bold' }}>💰 Histórico de Vendas</span>}
        extra={
          <Space>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: 150 }}
              value={filtros.status}
              onChange={(value) => setFiltros({ ...filtros, status: value })}
            >
              <Option value="pendente">Pendente</Option>
              <Option value="pago">Pago</Option>
              <Option value="cancelado">Cancelado</Option>
              <Option value="expirado">Expirado</Option>
            </Select>
            <Button onClick={carregarCompras}>Atualizar</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={compras}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      {/* Últimas vendas */}
      {stats?.ultimasCompras && stats.ultimasCompras.length > 0 && (
        <Card 
          title="🕐 Últimas Vendas" 
          style={{ marginTop: '24px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {stats.ultimasCompras.map((compra) => (
              <div 
                key={compra.id}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px'
                }}
              >
                <Space>
                  <span style={{ fontSize: '20px' }}>{compra.icone}</span>
                  <span>{compra.produto}</span>
                  <Tag color="blue">{compra.metodo_pagamento?.toUpperCase()}</Tag>
                </Space>
                <Space>
                  <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    R$ {compra.valor}
                  </span>
                  <span style={{ color: '#999' }}>
                    {dayjs(compra.data).format('DD/MM/YYYY HH:mm')}
                  </span>
                </Space>
              </div>
            ))}
          </Space>
        </Card>
      )}
    </AdminLayout>
  );
}
