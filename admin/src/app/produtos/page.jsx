'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Switch,
  Select,
  message,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined
} from '@ant-design/icons';
import AdminLayout from '../../components/AdminLayout';

const { TextArea } = Input;
const { Option } = Select;

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api/produtos`);
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      message.error('Erro ao carregar produtos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (produto = null) => {
    setEditingProduto(produto);
    if (produto) {
      form.setFieldsValue({
        ...produto,
        features: produto.features?.join('\n') || ''
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setEditingProduto(null);
    form.resetFields();
  };

  const salvarProduto = async (values) => {
    try {
      const features = values.features
        ? values.features.split('\n').map(f => f.trim()).filter(f => f)
        : [];

      const dados = {
        ...values,
        features,
        preco: parseFloat(values.preco),
        preco_original: values.preco_original ? parseFloat(values.preco_original) : null
      };

      const url = editingProduto
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api/produtos/${editingProduto.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api/produtos`;

      const method = editingProduto ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar produto');
      }

      message.success(`Produto ${editingProduto ? 'atualizado' : 'criado'} com sucesso!`);
      fecharModal();
      carregarProdutos();
    } catch (error) {
      message.error(error.message);
      console.error(error);
    }
  };

  const deletarProduto = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api/produtos/${id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar produto');
      }

      message.success('Produto deletado com sucesso!');
      carregarProdutos();
    } catch (error) {
      message.error(error.message);
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Produto',
      dataIndex: 'nome',
      key: 'nome',
      render: (nome, record) => (
        <Space>
          <span style={{ fontSize: '20px' }}>{record.icone}</span>
          <span>{nome}</span>
          {record.destaque && <StarOutlined style={{ color: '#faad14' }} />}
        </Space>
      )
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => <code>{slug}</code>
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_teste',
      key: 'tipo_teste',
      render: (tipo) => (
        <Tag color={tipo === 'combo' ? 'purple' : 'blue'}>
          {tipo?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Preço',
      dataIndex: 'preco',
      key: 'preco',
      render: (preco, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
            R$ {parseFloat(preco).toFixed(2)}
          </span>
          {record.preco_original && (
            <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#999' }}>
              R$ {parseFloat(record.preco_original).toFixed(2)}
            </span>
          )}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      key: 'ativo',
      render: (ativo) => (
        <Tag
          icon={ativo ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={ativo ? 'success' : 'default'}
        >
          {ativo ? 'Ativo' : 'Inativo'}
        </Tag>
      )
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => abrirModal(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja deletar?"
            description="Esta ação não pode ser desfeita."
            onConfirm={() => deletarProduto(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Deletar
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <Card
        title={<span style={{ fontSize: '20px', fontWeight: 'bold' }}>🛍️ Gestão de Produtos</span>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => abrirModal()}
          >
            Novo Produto
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={produtos}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingProduto ? 'Editar Produto' : 'Novo Produto'}
        open={modalVisible}
        onCancel={fecharModal}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={salvarProduto}
          initialValues={{
            ativo: true,
            destaque: false,
            ordem: 0
          }}
        >
          <Form.Item
            name="nome"
            label="Nome do Produto"
            rules={[{ required: true, message: 'Nome obrigatório' }]}
          >
            <Input placeholder="Ex: Teste DISC" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (URL)"
            rules={[{ required: true, message: 'Slug obrigatório' }]}
            extra="Usado na URL. Ex: teste-disc"
          >
            <Input placeholder="teste-disc" />
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[{ required: true, message: 'Descrição obrigatória' }]}
          >
            <TextArea rows={3} placeholder="Descrição do produto..." />
          </Form.Item>

          <Space size="large" style={{ width: '100%' }}>
            <Form.Item
              name="preco"
              label="Preço Atual (R$)"
              rules={[{ required: true, message: 'Preço obrigatório' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                style={{ width: '150px' }}
              />
            </Form.Item>

            <Form.Item
              name="preco_original"
              label="Preço Original (R$)"
              extra="Deixe vazio se não houver desconto"
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                style={{ width: '150px' }}
              />
            </Form.Item>
          </Space>

          <Space size="large" style={{ width: '100%' }}>
            <Form.Item
              name="tipo_teste"
              label="Tipo de Teste"
            >
              <Select style={{ width: '200px' }} placeholder="Selecione">
                <Option value="disc">DISC</Option>
                <Option value="dominancia">Dominância</Option>
                <Option value="inteligencias">Inteligências</Option>
                <Option value="combo">Combo</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="icone"
              label="Ícone (Emoji)"
            >
              <Input placeholder="🎯" style={{ width: '100px' }} />
            </Form.Item>

            <Form.Item
              name="ordem"
              label="Ordem"
            >
              <InputNumber min={0} style={{ width: '100px' }} />
            </Form.Item>
          </Space>

          <Form.Item
            name="features"
            label="Features (uma por linha)"
          >
            <TextArea
              rows={4}
              placeholder="Análise completa do perfil&#10;Relatório detalhado em PDF&#10;Gráficos personalizados"
            />
          </Form.Item>

          <Space size="large">
            <Form.Item name="ativo" label="Ativo" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="destaque" label="Destaque" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>

          <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProduto ? 'Atualizar' : 'Criar'} Produto
              </Button>
              <Button onClick={fecharModal}>Cancelar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
