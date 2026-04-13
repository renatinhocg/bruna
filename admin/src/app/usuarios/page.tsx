'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Avatar, 
  Tag, 
  Space,
  Popconfirm,
  Upload,
  notification
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  CameraOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import apiService from '../../services/api.js';
import AdminLayout from '../../components/AdminLayout';

const { Option } = Select;

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo: 'cliente' | 'admin';
  status: 'ativo' | 'inativo';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [testesModalVisible, setTestesModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [selectedUserForTests, setSelectedUserForTests] = useState<Usuario | null>(null);
  const [userTestPermissions, setUserTestPermissions] = useState<{[key: string]: boolean}>({
    disc: false,
    dominancia: false,
    inteligencias: false
  });
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();

  const loadUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      api.error({
        message: 'Erro ao carregar usuários',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      loadUsuarios();
    }
  }, [router, loadUsuarios]);

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setAvatarFile(null);
    setAvatarPreview(null);
    setModalVisible(true);
  };

  const handleEditUser = (user: Usuario) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setAvatarFile(null);
    setAvatarPreview(user.avatar_url || null);
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await apiService.deleteUser(userId);
      api.success({
        message: '✅ Usuário excluído com sucesso!',
        placement: 'topRight'
      });
      await loadUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      api.error({
        message: `❌ Erro ao excluir usuário: ${errorMessage}`,
        placement: 'topRight'
      });
    }
  };

  const handleOpenTestsModal = async (user: Usuario) => {
    setSelectedUserForTests(user);
    setLoading(true);
    
    try {
      // Carregar permissões de testes do usuário da API
      const permissions = await apiService.getUserTestPermissions(user.id);
      setUserTestPermissions(permissions);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      // Se não encontrar, define como bloqueado
      setUserTestPermissions({
        disc: false,
        dominancia: false,
        inteligencias: false
      });
    } finally {
      setLoading(false);
    }
    
    setTestesModalVisible(true);
  };

  const handleTestPermissionChange = (testType: string, enabled: boolean) => {
    setUserTestPermissions(prev => ({
      ...prev,
      [testType]: enabled
    }));
  };

  const handleSaveTestPermissions = async () => {
    if (!selectedUserForTests) return;

    setLoading(true);
    try {
      await apiService.updateUserTestPermissions(selectedUserForTests.id, userTestPermissions);
      
      api.success({
        message: '✅ Permissões de testes atualizadas com sucesso!',
        placement: 'topRight'
      });
      setTestesModalVisible(false);
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      api.error({
        message: '❌ Erro ao atualizar permissões',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    nome: string;
    email: string;
    telefone: string;
    tipo: 'cliente' | 'admin';
    status: 'ativo' | 'inativo';
    senha?: string;
  }) => {
    setLoading(true);
    try {
      let userId: number;
      
      if (editingUser) {
        await apiService.updateUser(editingUser.id, values);
        userId = editingUser.id;
        api.success({
          message: '✅ Usuário atualizado com sucesso!',
          placement: 'topRight'
        });
      } else {
        const newUser = await apiService.createUser(values);
        userId = newUser.id;
        api.success({
          message: '✅ Usuário criado com sucesso!',
          placement: 'topRight'
        });
      }

      // Se tem avatar para upload, fazer o upload
      if (avatarFile) {
        try {
          await apiService.uploadAvatar(userId, avatarFile);
          api.success({
            message: '✅ Avatar atualizado com sucesso!',
            placement: 'topRight'
          });
        } catch (avatarError) {
          console.error('Erro ao fazer upload do avatar:', avatarError);
          api.warning({
            message: '⚠️ Usuário salvo, mas erro ao fazer upload do avatar',
            placement: 'topRight'
          });
        }
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      setAvatarFile(null);
      setAvatarPreview(null);
      await loadUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      api.error({
        message: `❌ Erro ao salvar usuário: ${errorMessage}`,
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info: { file: any }) => {
    const { file } = info;
    
    if (file.status === 'uploading') {
      return;
    }

    const isImage = file.type?.startsWith('image/');
    if (!isImage) {
      api.error({
        message: 'Apenas arquivos de imagem são permitidos!',
        placement: 'topRight'
      });
      return;
    }

    const isValidSize = file.size / 1024 / 1024 < 5;
    if (!isValidSize) {
      api.error({
        message: 'A imagem deve ter no máximo 5MB!',
        placement: 'topRight'
      });
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(editingUser?.avatar_url || null);
  };

  const columns = [
    {
      title: 'Usuário',
      key: 'usuario',
      render: (record: Usuario) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size="large" 
            src={record.avatar_url}
            style={{ 
              backgroundColor: record.tipo === 'admin' ? '#722ed1' : '#1890ff',
              marginRight: 12 
            }}
          >
            {!record.avatar_url && record.nome.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.nome}</div>
            <div style={{ color: '#666', fontSize: 12 }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Contato',
      key: 'contato',
      render: (record: Usuario) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            {record.telefone}
          </div>
        </div>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo: string) => (
        <Tag color={tipo === 'admin' ? 'purple' : 'blue'}>
          {tipo === 'admin' ? 'Administrador' : 'Cliente'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ativo' ? 'green' : 'red'}>
          {status === 'ativo' ? 'Ativo' : 'Inativo'}
        </Tag>
      )
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (record: Usuario) => (
        <Space>
          <Button
            type="default"
            icon={<ExperimentOutlined />}
            size="small"
            onClick={() => handleOpenTestsModal(record)}
            title="Gerenciar testes"
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditUser(record)}
          />
          <Popconfirm
            title="Tem certeza que deseja excluir este usuário?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      {contextHolder}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2>Lista de Usuários ({usuarios.length})</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
          >
            Novo Usuário
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={usuarios}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} usuários`
          }}
        />

        <Modal
          title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            {/* Avatar Upload */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <Avatar 
                  size={100} 
                  src={avatarPreview}
                  style={{ 
                    backgroundColor: editingUser?.tipo === 'admin' ? '#722ed1' : '#1890ff',
                    border: '2px solid #f0f0f0'
                  }}
                >
                  {!avatarPreview && (editingUser?.nome || 'U').charAt(0).toUpperCase()}
                </Avatar>
              </div>
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAvatarChange}
                accept="image/*"
              >
                <Button icon={<CameraOutlined />} type="dashed">
                  Alterar Avatar
                </Button>
              </Upload>
              {avatarFile && (
                <Button 
                  type="link" 
                  size="small" 
                  onClick={removeAvatar}
                  style={{ marginLeft: 8 }}
                >
                  Remover
                </Button>
              )}
            </div>

            <Form.Item
              label="Nome Completo"
              name="nome"
              rules={[{ required: true, message: 'Por favor, insira o nome!' }]}
            >
              <Input placeholder="Digite o nome completo" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Por favor, insira o email!' },
                { type: 'email', message: 'Email inválido!' }
              ]}
            >
              <Input placeholder="Digite o email" />
            </Form.Item>

            <Form.Item
              label="Telefone"
              name="telefone"
            >
              <Input placeholder="Digite o telefone" />
            </Form.Item>

            <Form.Item
              label="Tipo de Usuário"
              name="tipo"
              rules={[{ required: true, message: 'Selecione o tipo de usuário!' }]}
            >
              <Select placeholder="Selecione o tipo">
                <Option value="cliente">Cliente</Option>
                <Option value="admin">Administrador</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Selecione o status!' }]}
            >
              <Select placeholder="Selecione o status">
                <Option value="ativo">Ativo</Option>
                <Option value="inativo">Inativo</Option>
              </Select>
            </Form.Item>

            {!editingUser && (
              <Form.Item
                label="Senha"
                name="senha"
                rules={[{ required: true, message: 'Por favor, insira a senha!' }]}
              >
                <Input.Password placeholder="Digite a senha" />
              </Form.Item>
            )}

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingUser ? 'Atualizar' : 'Criar'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal de Gerenciamento de Testes */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ExperimentOutlined style={{ fontSize: 20, color: '#1890ff' }} />
              <span>Gerenciar Testes - {selectedUserForTests?.nome}</span>
            </div>
          }
          open={testesModalVisible}
          onCancel={() => setTestesModalVisible(false)}
          onOk={handleSaveTestPermissions}
          okText="Salvar"
          cancelText="Cancelar"
          width={600}
        >
          <div style={{ padding: '20px 0' }}>
            <p style={{ marginBottom: 24, color: '#666' }}>
              Selecione quais testes este usuário pode realizar:
            </p>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Teste DISC */}
              <div style={{
                padding: 16,
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                backgroundColor: userTestPermissions.disc ? '#e6f7ff' : '#fafafa',
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                      📊 Teste DISC
                    </h4>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                      Avalia os estilos comportamentais: Dominância, Influência, Estabilidade e Conformidade
                    </p>
                  </div>
                  <Select
                    value={userTestPermissions.disc}
                    onChange={(value) => handleTestPermissionChange('disc', value)}
                    style={{ width: 120 }}
                  >
                    <Option value={false}>
                      <Tag color="red">Bloqueado</Tag>
                    </Option>
                    <Option value={true}>
                      <Tag color="green">Liberado</Tag>
                    </Option>
                  </Select>
                </div>
              </div>

              {/* Teste de Dominância Cerebral */}
              <div style={{
                padding: 16,
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                backgroundColor: userTestPermissions.dominancia ? '#e6f7ff' : '#fafafa',
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                      🧠 Teste de Dominância Cerebral
                    </h4>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                      Identifica o perfil de dominância cerebral e estilo de aprendizagem
                    </p>
                  </div>
                  <Select
                    value={userTestPermissions.dominancia}
                    onChange={(value) => handleTestPermissionChange('dominancia', value)}
                    style={{ width: 120 }}
                  >
                    <Option value={false}>
                      <Tag color="red">Bloqueado</Tag>
                    </Option>
                    <Option value={true}>
                      <Tag color="green">Liberado</Tag>
                    </Option>
                  </Select>
                </div>
              </div>

              {/* Teste de Múltiplas Inteligências */}
              <div style={{
                padding: 16,
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                backgroundColor: userTestPermissions.inteligencias ? '#e6f7ff' : '#fafafa',
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                      🎯 Teste de Múltiplas Inteligências
                    </h4>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                      Avalia as diferentes inteligências segundo a teoria de Howard Gardner
                    </p>
                  </div>
                  <Select
                    value={userTestPermissions.inteligencias}
                    onChange={(value) => handleTestPermissionChange('inteligencias', value)}
                    style={{ width: 120 }}
                  >
                    <Option value={false}>
                      <Tag color="red">Bloqueado</Tag>
                    </Option>
                    <Option value={true}>
                      <Tag color="green">Liberado</Tag>
                    </Option>
                  </Select>
                </div>
              </div>
            </Space>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
