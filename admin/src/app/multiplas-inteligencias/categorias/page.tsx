'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, Breadcrumb } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AdminLayout from '../../../components/AdminLayout';
import apiService from '../../../services/api.js';

// Importação dinâmica do editor para evitar problemas de SSR
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  resultado: string;
  caracteristicas_inteligente?: string;
  carreiras_associadas?: string;
  cor: string;
  created_at: string;
  updated_at: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [resultadoValue, setResultadoValue] = useState('');
  const [caracteristicasValue, setCaracteristicasValue] = useState('');
  const [carreirasValue, setCarreirasValue] = useState('');
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      fetchCategorias();
    }
  }, [router]);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategorias();
      setCategorias(response.data || []);
    } catch (error) {
      message.error('Erro ao carregar categorias');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategoria(null);
    form.resetFields();
    setResultadoValue('');
    setCaracteristicasValue('');
    setCarreirasValue('');
    setModalVisible(true);
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    form.setFieldsValue(categoria);
    setResultadoValue(categoria.resultado || '');
    setCaracteristicasValue(categoria.caracteristicas_inteligente || '');
    setCarreirasValue(categoria.carreiras_associadas || '');
    setModalVisible(true);
  };

  const handleSubmit = async (values: { 
    nome: string; 
    descricao: string; 
    resultado: string; 
    caracteristicas_inteligente?: string;
    carreiras_associadas?: string;
    cor: string 
  }) => {
    try {
      const formData = {
        ...values,
        resultado: resultadoValue,
        caracteristicas_inteligente: caracteristicasValue,
        carreiras_associadas: carreirasValue
      };
      
      if (editingCategoria) {
        await apiService.updateCategoria(editingCategoria.id, formData);
        message.success('Categoria atualizada com sucesso!');
      } else {
        await apiService.createCategoria(formData);
        message.success('Categoria criada com sucesso!');
      }
      setModalVisible(false);
      fetchCategorias();
    } catch (error) {
      message.error('Erro ao salvar categoria');
      console.error('Erro:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteCategoria(id);
      message.success('Categoria excluída com sucesso!');
      fetchCategorias();
    } catch (error) {
      message.error('Erro ao excluir categoria');
      console.error('Erro:', error);
    }
  };

  const columns = [
    {
      title: 'Categoria',
      key: 'categoria',
      render: (record: Categoria) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 24,
              height: 24,
              minWidth: 24,
              minHeight: 24,
              borderRadius: '50%',
              backgroundColor: record.cor,
              marginRight: 12,
              flexShrink: 0
            }}
          />
          <div style={{ fontWeight: 500 }}>{record.nome}</div>
        </div>
      )
    },
    {
      title: 'Cor',
      dataIndex: 'cor',
      key: 'cor',
      render: (cor: string) => (
        <Tag color={cor} style={{ borderColor: cor }}>
          {cor}
        </Tag>
      )
    },
    {
      title: 'Criado em',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR')
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (record: Categoria) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Tem certeza que deseja excluir?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const cores = [
    '#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1',
    '#13c2c2', '#f5222d', '#a0d911', '#fadb14', '#2f54eb'
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Breadcrumb 
          style={{ marginBottom: 16 }}
          items={[
            {
              title: 'Dashboard',
              href: '/dashboard',
            },
            {
              title: 'Múltiplas Inteligências',
              href: '/multiplas-inteligencias',
            },
            {
              title: 'Categorias',
            },
          ]}
        />
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <TagsOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                Categorias de Inteligências
              </h2>
              <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                Gerencie os tipos de inteligências múltiplas
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="large"
            >
              Nova Categoria
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={categorias}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </Card>

        <Modal
          title={editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={1000}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="nome"
              label="Nome da Categoria"
              rules={[{ required: true, message: 'Por favor, insira o nome' }]}
            >
              <Input placeholder="Ex: Inteligência Linguística" />
            </Form.Item>

            <Form.Item
              name="descricao"
              label="Descrição"
              rules={[{ required: true, message: 'Por favor, insira uma descrição' }]}
            >
              <Input.TextArea 
                rows={3}
                placeholder="Descreva as características desta inteligência..."
              />
            </Form.Item>

            <Form.Item
              name="resultado"
              label="Resultado"
              rules={[
                { required: true, message: 'Por favor, insira o resultado' },
                { 
                  validator: () => {
                    if (!resultadoValue || resultadoValue.trim() === '') {
                      return Promise.reject(new Error('Por favor, insira o resultado'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                <MDEditor
                  value={resultadoValue}
                  onChange={(value) => setResultadoValue(value || '')}
                  preview="edit"
                  height={200}
                  data-color-mode="light"
                />
              </div>
            </Form.Item>

            <Form.Item
              name="caracteristicas_inteligente"
              label="Características da Inteligência"
            >
              <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                <MDEditor
                  value={caracteristicasValue}
                  onChange={(value) => setCaracteristicasValue(value || '')}
                  preview="edit"
                  height={180}
                  data-color-mode="light"
                />
              </div>
            </Form.Item>

            <Form.Item
              name="carreiras_associadas"
              label="Carreiras Associadas"
            >
              <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                <MDEditor
                  value={carreirasValue}
                  onChange={(value) => setCarreirasValue(value || '')}
                  preview="edit"
                  height={180}
                  data-color-mode="light"
                />
              </div>
            </Form.Item>

            <Form.Item
              name="cor"
              label="Cor"
              rules={[{ required: true, message: 'Por favor, selecione uma cor' }]}
            >
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {cores.map((cor) => (
                  <div
                    key={cor}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: cor,
                      cursor: 'pointer',
                      border: form.getFieldValue('cor') === cor ? '3px solid #000' : '2px solid #d9d9d9'
                    }}
                    onClick={() => form.setFieldValue('cor', cor)}
                  />
                ))}
              </div>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingCategoria ? 'Atualizar' : 'Criar'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
