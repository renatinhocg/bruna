'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Popconfirm, Space, InputNumber, Tag, Breadcrumb } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import apiService from '../../../services/api';

interface Possibilidade {
  id: number;
  texto: string;
  valor: number;
  descricao?: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export default function PossibilidadesPage() {
  const [possibilidades, setPossibilidades] = useState<Possibilidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPossibilidade, setEditingPossibilidade] = useState<Possibilidade | null>(null);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      fetchPossibilidades();
    }
  }, [router]);

  const fetchPossibilidades = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPossibilidades();
      
      if (response.success) {
        setPossibilidades(response.data || []);
      } else {
        message.error('Erro ao carregar possibilidades');
      }
    } catch (error) {
      console.error('Erro ao buscar possibilidades:', error);
      message.error('Erro ao carregar possibilidades');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    texto: string;
    valor: number;
    descricao?: string;
    ordem: number;
  }) => {
    try {
      setLoading(true);
      
      if (editingPossibilidade) {
        const response = await apiService.updatePossibilidade(editingPossibilidade.id, values);
        if (response.success) {
          message.success('Possibilidade atualizada com sucesso!');
          setModalVisible(false);
          setEditingPossibilidade(null);
          form.resetFields();
          await fetchPossibilidades();
        } else {
          message.error(response.message || 'Erro ao atualizar possibilidade');
        }
      } else {
        const response = await apiService.createPossibilidade(values);
        if (response.success) {
          message.success('Possibilidade criada com sucesso!');
          setModalVisible(false);
          form.resetFields();
          await fetchPossibilidades();
        } else {
          message.error(response.message || 'Erro ao criar possibilidade');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar possibilidade:', error);
      message.error('Erro ao salvar possibilidade');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (possibilidade: Possibilidade) => {
    setEditingPossibilidade(possibilidade);
    form.setFieldsValue({
      texto: possibilidade.texto,
      valor: possibilidade.valor,
      descricao: possibilidade.descricao,
      ordem: possibilidade.ordem
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await apiService.deletePossibilidade(id);
      
      if (response.success) {
        message.success('Possibilidade excluída com sucesso!');
        await fetchPossibilidades();
      } else {
        message.error(response.message || 'Erro ao excluir possibilidade');
      }
    } catch (error) {
      console.error('Erro ao excluir possibilidade:', error);
      message.error('Erro ao excluir possibilidade');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setModalVisible(false);
    setEditingPossibilidade(null);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Texto',
      dataIndex: 'texto',
      key: 'texto',
      width: '30%',
      render: (texto: string, record: Possibilidade) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '16px' }}>{texto}</div>
          {record.descricao && (
            <div style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
              {record.descricao}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Valor',
      dataIndex: 'valor',
      key: 'valor',
      width: '15%',
      render: (valor: number) => (
        <Tag color={
          valor === 0 ? 'red' : 
          valor === 1 ? 'orange' : 
          valor === 2 ? 'yellow' : 
          valor === 3 ? 'blue' : 
          'green'
        }>
          {valor}
        </Tag>
      ),
    },
    {
      title: 'Ordem',
      dataIndex: 'ordem',
      key: 'ordem',
      width: '10%',
      sorter: (a: Possibilidade, b: Possibilidade) => a.ordem - b.ordem,
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      key: 'ativo',
      width: '10%',
      render: (ativo: boolean) => (
        <Tag color={ativo ? 'green' : 'red'}>
          {ativo ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: '15%',
      render: (_: unknown, record: Possibilidade) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Tem certeza que deseja excluir esta possibilidade?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
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
              title: 'Opções de Resposta',
            },
          ]}
        />

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <SettingOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                Opções de Resposta
              </h2>
              <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                Gerencie a escala de respostas do teste (Discordo Completamente até Concordo Totalmente)
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              size="large"
            >
              Nova Possibilidade
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={possibilidades}
            rowKey="id"
            loading={loading}
            pagination={{
              total: possibilidades.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} de ${total} possibilidades`,
            }}
          />
        </Card>

        <Modal
          title={editingPossibilidade ? 'Editar Possibilidade' : 'Nova Possibilidade'}
          open={modalVisible}
          onCancel={resetModal}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="texto"
              label="Texto da Possibilidade"
              rules={[
                { required: true, message: 'Por favor, insira o texto da possibilidade' },
                { min: 2, message: 'O texto deve ter pelo menos 2 caracteres' },
                { max: 100, message: 'O texto deve ter no máximo 100 caracteres' }
              ]}
            >
              <Input placeholder="Ex: Discordo Completamente, Concordo Totalmente..." />
            </Form.Item>

            <Form.Item
              name="valor"
              label="Valor Numérico"
              rules={[
                { required: true, message: 'Por favor, insira o valor' },
                { type: 'number', min: 1, max: 5, message: 'O valor deve estar entre 1 e 5' }
              ]}
            >
              <InputNumber 
                min={1} 
                max={5} 
                style={{ width: '100%' }} 
                placeholder="Valor de 1 a 5 (1=Discordo Totalmente, 5=Concordo Totalmente)"
              />
            </Form.Item>

            <Form.Item
              name="ordem"
              label="Ordem de Exibição"
              rules={[
                { required: true, message: 'Por favor, insira a ordem' },
                { type: 'number', min: 1, message: 'A ordem deve ser maior que 0' }
              ]}
            >
              <InputNumber 
                min={1} 
                style={{ width: '100%' }} 
                placeholder="Ordem de exibição (1, 2, 3...)"
              />
            </Form.Item>

            <Form.Item
              name="descricao"
              label="Descrição (Opcional)"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Descrição adicional da possibilidade"
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={resetModal}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingPossibilidade ? 'Atualizar' : 'Criar'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
