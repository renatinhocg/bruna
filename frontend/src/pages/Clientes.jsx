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
  message 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined 
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Clientes = () => {
  const [clientes, setClientes] = useState([
    {
      key: '1',
      id: 1,
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      profissao: 'Analista de Sistemas',
      status: 'ativo',
      dataRegistro: '2024-01-15'
    },
    {
      key: '2',
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
      profissao: 'Gerente de Projetos',
      status: 'ativo',
      dataRegistro: '2024-02-20'
    },
    {
      key: '3',
      id: 3,
      nome: 'Pedro Costa',
      email: 'pedro@email.com',
      telefone: '(11) 77777-7777',
      profissao: 'Designer UX',
      status: 'inativo',
      dataRegistro: '2024-03-10'
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
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

  const handleDeleteCliente = (clienteId) => {
    setClientes(prev => prev.filter(c => c.id !== clienteId));
    message.success('Cliente excluído com sucesso!');
  };

  const handleSubmit = (values) => {
    if (editingCliente) {
      // Editar cliente existente
      setClientes(prev => prev.map(c => 
        c.id === editingCliente.id 
          ? { ...c, ...values }
          : c
      ));
      message.success('Cliente atualizado com sucesso!');
    } else {
      // Adicionar novo cliente
      const novoCliente = {
        ...values,
        key: String(Date.now()),
        id: Date.now(),
        dataRegistro: new Date().toISOString().split('T')[0]
      };
      setClientes(prev => [...prev, novoCliente]);
      message.success('Cliente adicionado com sucesso!');
    }
    setModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      sorter: (a, b) => a.nome.localeCompare(b.nome),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Telefone',
      dataIndex: 'telefone',
      key: 'telefone',
    },
    {
      title: 'Profissão',
      dataIndex: 'profissao',
      key: 'profissao',
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
      title: 'Data Registro',
      dataIndex: 'dataRegistro',
      key: 'dataRegistro',
      sorter: (a, b) => new Date(a.dataRegistro) - new Date(b.dataRegistro),
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
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
        />
      </Card>

      <Modal
        title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="nome"
            label="Nome Completo"
            rules={[{ required: true, message: 'Por favor, insira o nome!' }]}
          >
            <Input placeholder="Digite o nome completo" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor, insira o email!' },
              { type: 'email', message: 'Email inválido!' }
            ]}
          >
            <Input placeholder="Digite o email" />
          </Form.Item>

          <Form.Item
            name="telefone"
            label="Telefone"
            rules={[{ required: true, message: 'Por favor, insira o telefone!' }]}
          >
            <Input placeholder="(11) 99999-9999" />
          </Form.Item>

          <Form.Item
            name="profissao"
            label="Profissão"
            rules={[{ required: true, message: 'Por favor, insira a profissão!' }]}
          >
            <Input placeholder="Digite a profissão" />
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
        </Form>
      </Modal>
    </div>
  );
};

export default Clientes;
