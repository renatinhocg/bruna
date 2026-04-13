'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Popconfirm, Space, Select, Tag, Breadcrumb, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import apiService from '../../../services/api.js';

interface Pergunta {
  id: number;
  texto: string;
  categoria_id: number;
  categoria?: {
    id: number;
    nome: string;
    cor: string;
  };
  tipo: string;
  ordem: number;
  obrigatoria: boolean;
  ativo: boolean;
  possibilidades?: object[];
  _count?: {
    possibilidades: number;
  };
  created_at: string;
  updated_at: string;
}

interface Categoria {
  id: number;
  nome: string;
  cor: string;
}

export default function PerguntasPage() {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPergunta, setEditingPergunta] = useState<Pergunta | null>(null);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      fetchPerguntas();
      fetchCategorias();
    }
  }, [router]);

  const fetchPerguntas = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPerguntas();
      setPerguntas(response.data || []);
    } catch (error) {
      message.error('Erro ao carregar perguntas');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await apiService.getCategorias();
      setCategorias(response.data || []);
    } catch (error) {
      message.error('Erro ao carregar categorias');
      console.error('Erro:', error);
    }
  };

  const handleCreate = () => {
    setEditingPergunta(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (pergunta: Pergunta) => {
    setEditingPergunta(pergunta);
    form.setFieldsValue({
      texto: pergunta.texto,
      categoria_id: pergunta.categoria_id,
      tipo: pergunta.tipo,
      ordem: pergunta.ordem,
      obrigatoria: pergunta.obrigatoria
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: { 
    texto: string; 
    categoria_id: number;
    tipo: string;
    ordem?: number;
    obrigatoria: boolean;
  }) => {
    try {
      if (editingPergunta) {
        await apiService.updatePergunta(editingPergunta.id, values);
        message.success('Pergunta atualizada com sucesso!');
      } else {
        await apiService.createPergunta(values);
        message.success('Pergunta criada com sucesso!');
      }
      setModalVisible(false);
      fetchPerguntas();
    } catch (error) {
      message.error('Erro ao salvar pergunta');
      console.error('Erro:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deletePergunta(id);
      message.success('Pergunta excluída com sucesso!');
      fetchPerguntas();
    } catch (error) {
      message.error('Erro ao excluir pergunta');
      console.error('Erro:', error);
    }
  };

  const columns = [
    {
      title: 'Pergunta',
      key: 'pergunta',
      render: (record: Pergunta) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.categoria && (
            <div
              style={{
                width: 24,
                height: 24,
                minWidth: 24,
                minHeight: 24,
                borderRadius: '50%',
                backgroundColor: record.categoria.cor,
                marginRight: 12,
                flexShrink: 0
              }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.texto}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {record.categoria && (
                <Tag color={record.categoria.cor}>
                  {record.categoria.nome}
                </Tag>
              )}
              <Tag color={record.tipo === 'multipla_escolha' ? 'blue' : 'green'}>
                {record.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Escala'}
              </Tag>
              {record.obrigatoria && (
                <Tag color="red">Obrigatória</Tag>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Ordem',
      dataIndex: 'ordem',
      key: 'ordem',
      width: 80,
      sorter: (a: Pergunta, b: Pergunta) => a.ordem - b.ordem,
    },
    {
      title: 'Possibilidades',
      key: 'possibilidades',
      width: 120,
      render: (record: Pergunta) => (
        <Tag color="cyan">
          {record._count?.possibilidades || 0}
        </Tag>
      )
    },
    {
      title: 'Criado em',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR')
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 120,
      render: (record: Pergunta) => (
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

  const tiposPerguntas = [
    { value: 'multipla_escolha', label: 'Múltipla Escolha' },
    { value: 'escala', label: 'Escala' }
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
              title: 'Perguntas',
            },
          ]}
        />
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <QuestionCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                Perguntas do Teste
              </h2>
              <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                Gerencie as perguntas das múltiplas inteligências
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="large"
            >
              Nova Pergunta
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={perguntas}
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
          title={editingPergunta ? 'Editar Pergunta' : 'Nova Pergunta'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="categoria_id"
              label="Categoria"
              rules={[{ required: true, message: 'Por favor, selecione uma categoria' }]}
            >
              <Select placeholder="Selecione uma categoria">
                {categorias.map((categoria) => (
                  <Select.Option key={categoria.id} value={categoria.id}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: categoria.cor,
                          marginRight: 8
                        }}
                      />
                      {categoria.nome}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="texto"
              label="Texto da Pergunta"
              rules={[{ required: true, message: 'Por favor, insira o texto da pergunta' }]}
            >
              <Input.TextArea 
                rows={3}
                placeholder="Digite a pergunta..."
              />
            </Form.Item>

            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="tipo"
                label="Tipo de Pergunta"
                rules={[{ required: true, message: 'Por favor, selecione o tipo' }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Selecione o tipo">
                  {tiposPerguntas.map((tipo) => (
                    <Select.Option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="ordem"
                label="Ordem"
                style={{ flex: 1 }}
              >
                <Input 
                  type="number"
                  placeholder="Ordem (opcional)"
                  min={1}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="obrigatoria"
              label="Pergunta Obrigatória"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingPergunta ? 'Atualizar' : 'Criar'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
}