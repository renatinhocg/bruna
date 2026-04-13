'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Button, 
  Modal, 
  message, 
  Space, 
  Select,
  Row,
  Col,
  Statistic,
  Typography,
  Popconfirm,
  Descriptions,
  Badge
} from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';

const { Title } = Typography;
const { Option } = Select;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002/api';

interface Contato {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  mensagem: string;
  status: 'novo' | 'lido' | 'respondido';
  created_at: string;
  updated_at: string;
  impulso?: boolean;
}

interface Stats {
  total: number;
  novos: number;
  lidos: number;
  respondidos: number;
}

export default function ContatosPage() {
  const router = useRouter();
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, novos: 0, lidos: 0, respondidos: 0 });
  const [loading, setLoading] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [contatoSelecionado, setContatoSelecionado] = useState<Contato | null>(null);

  const carregarContatos = async () => {
    setLoading(true);
    try {
      const url = filtroStatus 
        ? `${API_BASE_URL}/contatos?status=${filtroStatus}`
        : `${API_BASE_URL}/contatos`;
      const response = await fetch(url);
      const data = await response.json();
      setContatos(data);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      message.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  const carregarStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contatos/stats/resumo`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    carregarContatos();
    carregarStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroStatus]);

  const atualizarStatus = async (id: number, novoStatus: string) => {
    try {
      await fetch(`${API_BASE_URL}/contatos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
      message.success('Status atualizado com sucesso');
      carregarContatos();
      carregarStats();
      if (contatoSelecionado?.id === id) {
        setContatoSelecionado({ ...contatoSelecionado, status: novoStatus as 'novo' | 'lido' | 'respondido' });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      message.error('Erro ao atualizar status');
    }
  };

  const deletarContato = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/contatos/${id}`, { method: 'DELETE' });
      message.success('Contato deletado com sucesso');
      carregarContatos();
      carregarStats();
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      message.error('Erro ao deletar contato');
    }
  };

  const visualizarDetalhes = async (contato: Contato) => {
    setContatoSelecionado(contato);
    setModalVisible(true);
    
    // Marcar como lido automaticamente se for novo
    if (contato.status === 'novo') {
      await atualizarStatus(contato.id, 'lido');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo':
        return 'blue';
      case 'lido':
        return 'orange';
      case 'respondido':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'novo':
        return <ClockCircleOutlined />;
      case 'lido':
        return <EyeOutlined />;
      case 'respondido':
        return <CheckCircleOutlined />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: 'IMPULSO',
      dataIndex: 'impulso',
      key: 'impulso',
      align: 'center' as const,
      render: (impulso: boolean) => impulso ? <Tag color="orange">IMPULSO</Tag> : null,
      width: 90,
      filters: [
        { text: 'Sim', value: true },
        { text: 'Não', value: false },
      ],
      onFilter: (value: boolean | React.Key, record: Contato) => Boolean(record.impulso) === value,
    },
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      render: (text: string, record: Contato) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: record.status === 'novo' ? 600 : 400 }}>
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => (
        <Space>
          <MailOutlined style={{ color: '#52c41a' }} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Telefone',
      dataIndex: 'telefone',
      key: 'telefone',
      render: (text: string) => text ? (
        <Space>
          <PhoneOutlined style={{ color: '#faad14' }} />
          {text}
        </Space>
      ) : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Novo', value: 'novo' },
        { text: 'Lido', value: 'lido' },
        { text: 'Respondido', value: 'respondido' },
      ],
      onFilter: (value: boolean | React.Key, record: Contato) => record.status === value,
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Data',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString('pt-BR'),
      sorter: (a: Contato, b: Contato) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: unknown, record: Contato) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => visualizarDetalhes(record)}
          >
            Ver
          </Button>
          <Select
            value={record.status}
            style={{ width: 140 }}
            onChange={(value) => atualizarStatus(record.id, value)}
          >
            <Option value="novo">Novo</Option>
            <Option value="lido">Lido</Option>
            <Option value="respondido">Respondido</Option>
          </Select>
          <Popconfirm
            title="Deletar contato?"
            description="Esta ação não pode ser desfeita."
            onConfirm={() => deletarContato(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Title level={2}>
          <MessageOutlined /> Contatos da Landing Page
        </Title>

        {/* Estatísticas */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total de Contatos"
                value={stats.total}
                prefix={<MessageOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Novos"
                value={stats.novos}
                valueStyle={{ color: '#1890ff' }}
                prefix={<Badge status="processing" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Lidos"
                value={stats.lidos}
                valueStyle={{ color: '#faad14' }}
                prefix={<EyeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Respondidos"
                value={stats.respondidos}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filtros */}
        <Card style={{ marginBottom: 24 }}>
          <Space>
            <span>Filtrar por status:</span>
            <Select
              style={{ width: 200 }}
              placeholder="Todos os status"
              allowClear
              value={filtroStatus || undefined}
              onChange={(value) => setFiltroStatus(value || '')}
            >
              <Option value="novo">Novo</Option>
              <Option value="lido">Lido</Option>
              <Option value="respondido">Respondido</Option>
            </Select>
            <Button onClick={carregarContatos}>Atualizar</Button>
          </Space>
        </Card>

        {/* Tabela */}
        <Card>
          <Table
            columns={columns}
            dataSource={contatos}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total de ${total} contatos`,
            }}
          />
        </Card>

        {/* Modal de Detalhes */}
        <Modal
          title={
            <Space>
              <MessageOutlined />
              <span>Detalhes do Contato</span>
            </Space>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          width={700}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Fechar
            </Button>,
            contatoSelecionado && contatoSelecionado.status !== 'respondido' && (
              <Button
                key="respondido"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  atualizarStatus(contatoSelecionado.id, 'respondido');
                  setModalVisible(false);
                }}
              >
                Marcar como Respondido
              </Button>
            ),
            contatoSelecionado && (
              <Popconfirm
                key="delete"
                title="Deletar este contato?"
                description="Esta ação não pode ser desfeita."
                onConfirm={() => deletarContato(contatoSelecionado.id)}
                okText="Sim"
                cancelText="Não"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Deletar
                </Button>
              </Popconfirm>
            ),
          ]}
        >
          {contatoSelecionado && (
            <div>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Nome">
                  <strong>{contatoSelecionado.nome}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Origem">
                  {contatoSelecionado.impulso ? (
                    <Tag color="orange">IMPULSO</Tag>
                  ) : (
                    <Tag color="default">Site</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="E-mail">
                  <a href={`mailto:${contatoSelecionado.email}`}>
                    {contatoSelecionado.email}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Telefone">
                  {contatoSelecionado.telefone ? (
                    <a href={`tel:${contatoSelecionado.telefone}`}>
                      {contatoSelecionado.telefone}
                    </a>
                  ) : (
                    'Não informado'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag icon={getStatusIcon(contatoSelecionado.status)} color={getStatusColor(contatoSelecionado.status)}>
                    {contatoSelecionado.status.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Data do Contato">
                  {new Date(contatoSelecionado.created_at).toLocaleString('pt-BR')}
                </Descriptions.Item>
                <Descriptions.Item label="Última Atualização">
                  {new Date(contatoSelecionado.updated_at).toLocaleString('pt-BR')}
                </Descriptions.Item>
              </Descriptions>

              <Card 
                title="Mensagem" 
                style={{ marginTop: 16 }}
                bodyStyle={{ 
                  background: '#f5f5f5', 
                  padding: 20,
                  borderRadius: 8 
                }}
              >
                <p style={{ 
                  whiteSpace: 'pre-wrap', 
                  margin: 0,
                  lineHeight: 1.6,
                  fontSize: 15
                }}>
                  {contatoSelecionado.mensagem}
                </p>
              </Card>

              <Card 
                title="Ações Rápidas" 
                style={{ marginTop: 16 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    icon={<MailOutlined />} 
                    block
                    onClick={() => window.open(`mailto:${contatoSelecionado.email}?subject=Re: Contato via site`)}
                  >
                    Responder por E-mail
                  </Button>
                  {contatoSelecionado.telefone && (
                    <Button 
                      type="default" 
                      icon={<PhoneOutlined />} 
                      block
                      onClick={() => window.open(`https://wa.me/55${contatoSelecionado.telefone?.replace(/\D/g, '') || ''}`)}
                    >
                      Responder por WhatsApp
                    </Button>
                  )}
                </Space>
              </Card>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
