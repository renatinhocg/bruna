import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Typography, 
  Tag,
  Popconfirm,
  message,
  Avatar,
  Drawer,
  Descriptions,
  Tabs
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const AdminClientes = () => {
  const [clientes, setClientes] = useState([
    {
      key: '1',
      id: 1,
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      profissao: 'Analista de Sistemas',
      empresa: 'Tech Solutions',
      status: 'ativo',
      dataRegistro: '2024-01-15',
      ultimaSessao: '2024-12-05',
      totalSessoes: 8,
      proximaSessao: '2024-12-15 14:00'
    },
    {
      key: '2',
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
      profissao: 'Gerente de Projetos',
      empresa: 'Innovate Corp',
      status: 'ativo',
      dataRegistro: '2024-02-20',
      ultimaSessao: '2024-12-03',
      totalSessoes: 12,
      proximaSessao: '2024-12-18 16:00'
    },
    {
      key: '3',
      id: 3,
      nome: 'Pedro Costa',
      email: 'pedro@email.com',
      telefone: '(11) 77777-7777',
      profissao: 'Designer UX',
      empresa: 'Creative Studio',
      status: 'inativo',
      dataRegistro: '2024-03-10',
      ultimaSessao: '2024-11-20',
      totalSessoes: 5,
      proximaSessao: null
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [form] = Form.useForm();

  const handleAddCliente = () => {
    setEditingCliente(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    form.setFieldsValue(cliente);
    setModalVisible(true);
  };

  const handleViewCliente = (cliente) => {
    setSelectedCliente(cliente);
    setDrawerVisible(true);
  };

  const handleDeleteCliente = (clienteId) => {
    setClientes(prev => prev.filter(c => c.id !== clienteId));
    message.success('Cliente excluído com sucesso!');
  };

  const handleSubmit = (values) => {
    if (editingCliente) {
      setClientes(prev => prev.map(c => 
        c.id === editingCliente.id 
          ? { ...c, ...values }
          : c
      ));
      message.success('Cliente atualizado com sucesso!');
    } else {
      const novoCliente = {
        ...values,
        key: String(Date.now()),
        id: Date.now(),
        dataRegistro: new Date().toISOString().split('T')[0],
        totalSessoes: 0,
        ultimaSessao: null,
        proximaSessao: null
      };
      setClientes(prev => [...prev, novoCliente]);
      message.success('Cliente adicionado com sucesso!');
    }
    setModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.nome}</div>
            <div style={{ color: '#666', fontSize: 12 }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Profissão',
      key: 'profissao',
      render: (_, record) => (
        <div>
          <div>{record.profissao}</div>
          <div style={{ color: '#666', fontSize: 12 }}>{record.empresa}</div>
        </div>
      ),
    },
    {
      title: 'Telefone',
      dataIndex: 'telefone',
      key: 'telefone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ativo' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Ativo', value: 'ativo' },
        { text: 'Inativo', value: 'inativo' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Sessões',
      dataIndex: 'totalSessoes',
      key: 'totalSessoes',
      sorter: (a, b) => a.totalSessoes - b.totalSessoes,
    },
    {
      title: 'Última Sessão',
      dataIndex: 'ultimaSessao',
      key: 'ultimaSessao',
      render: (data) => data ? new Date(data).toLocaleDateString('pt-BR') : '-'
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewCliente(record)}
            size="small"
          >
            Ver
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditCliente(record)}
            size="small"
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir este cliente?"
            onConfirm={() => handleDeleteCliente(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Gerenciamento de Clientes</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddCliente}
          size="large"
        >
          Novo Cliente
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={clientes}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} clientes`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal para Criar/Editar Cliente */}
      <Modal
        title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={5}>Informações Pessoais</Title>
              <Form.Item
                name="nome"
                label="Nome Completo"
                rules={[{ required: true, message: 'Por favor, insira o nome!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Digite o nome completo" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Por favor, insira o email!' },
                  { type: 'email', message: 'Email inválido!' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Digite o email" />
              </Form.Item>

              <Form.Item
                name="telefone"
                label="Telefone"
                rules={[{ required: true, message: 'Por favor, insira o telefone!' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="(11) 99999-9999" />
              </Form.Item>
            </div>

            <div>
              <Title level={5}>Informações Profissionais</Title>
              <Form.Item
                name="profissao"
                label="Profissão"
                rules={[{ required: true, message: 'Por favor, insira a profissão!' }]}
              >
                <Input placeholder="Digite a profissão" />
              </Form.Item>

              <Form.Item
                name="empresa"
                label="Empresa"
              >
                <Input placeholder="Digite a empresa" />
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Por favor, selecione o status!' }]}
              >
                <Select placeholder="Selecione o status">
                  <Option value="ativo">Ativo</Option>
                  <Option value="inativo">Inativo</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingCliente ? 'Atualizar' : 'Criar'}
                </Button>
              </Space>
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* Drawer para Detalhes do Cliente */}
      <Drawer
        title="Detalhes do Cliente"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
      >
        {selectedCliente && (
          <Tabs>
            <TabPane tab="Informações Gerais" key="1">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Nome">{selectedCliente.nome}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedCliente.email}</Descriptions.Item>
                <Descriptions.Item label="Telefone">{selectedCliente.telefone}</Descriptions.Item>
                <Descriptions.Item label="Profissão">{selectedCliente.profissao}</Descriptions.Item>
                <Descriptions.Item label="Empresa">{selectedCliente.empresa}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={selectedCliente.status === 'ativo' ? 'green' : 'red'}>
                    {selectedCliente.status.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Data de Registro">
                  {new Date(selectedCliente.dataRegistro).toLocaleDateString('pt-BR')}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="Histórico de Sessões" key="2">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Total de Sessões">{selectedCliente.totalSessoes}</Descriptions.Item>
                <Descriptions.Item label="Última Sessão">
                  {selectedCliente.ultimaSessao ? 
                    new Date(selectedCliente.ultimaSessao).toLocaleDateString('pt-BR') : 
                    'Nenhuma sessão realizada'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Próxima Sessão">
                  {selectedCliente.proximaSessao || 'Nenhuma sessão agendada'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
};

export default AdminClientes;
