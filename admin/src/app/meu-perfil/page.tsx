'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Avatar,
  notification,
  Typography,
  Divider,
  Tabs,
  Space
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  LinkedinOutlined,
  GlobalOutlined,
  SaveOutlined
} from '@ant-design/icons';
import apiService from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const { Title, Text, Paragraph } = Typography;

export default function MeuPerfilPage() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [api, contextHolder] = notification.useNotification();

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
      form.setFieldsValue({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || '',
        avatar_url: user.avatar_url || '',
        linkedin_url: user.linkedin_url || '',
        portfolio_url: user.portfolio_url || '',
        resumo_profissional: user.resumo_profissional || ''
      });
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      api.error({ message: 'Erro ao carregar dados do perfil', placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  }, [api, form]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleUpdateProfile = async (values: any) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await apiService.updateUser(currentUser.id, values);
      api.success({ message: 'Perfil atualizado com sucesso!', placement: 'topRight' });
      // Recarregar dados do usuário para garantir sincronização
      await loadUserData();
      // Atualizar a página para atualizar o cabeçalho
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      api.error({
        message: 'Erro ao atualizar perfil',
        description: error.message || 'Erro desconhecido',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Como não há rota específica no frontend/api.js para alterar senha direto sem ser via update geral,
      // enviamos o hash de senha pelo updateUser ou enviamos os dados de senha.
      // O backend aceita senha_hash ou senha no update de usuário.
      await apiService.updateUser(currentUser.id, {
        senha: values.nova_senha
      });
      api.success({ message: 'Senha atualizada com sucesso!', placement: 'topRight' });
      passwordForm.resetFields();
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      api.error({
        message: 'Erro ao alterar senha',
        description: error.message || 'Verifique os dados informados',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const tabsItems = [
    {
      key: '1',
      label: 'Dados Pessoais',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          disabled={loading}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nome Completo"
                name="nome"
                rules={[{ required: true, message: 'O nome é obrigatório' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Seu nome" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="E-mail"
                name="email"
                rules={[
                  { required: true, message: 'O e-mail é obrigatório' },
                  { type: 'email', message: 'E-mail inválido' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="seu.email@exemplo.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="Telefone" name="telefone">
                <Input prefix={<PhoneOutlined />} placeholder="Ex: (11) 99999-9999" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="URL do Avatar (Foto de Perfil)" name="avatar_url">
                <Input prefix={<GlobalOutlined />} placeholder="https://exemplo.com/sua-foto.jpg" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Resumo Profissional" name="resumo_profissional">
            <Input.TextArea rows={4} placeholder="Breve resumo das suas competências e carreira..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Salvar Alterações
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: '2',
      label: 'Links & Redes Sociais',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          disabled={loading}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="LinkedIn URL" name="linkedin_url">
                <Input prefix={<LinkedinOutlined style={{ color: '#0077b5' }} />} placeholder="https://linkedin.com/in/seu-perfil" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Portfólio / Site Pessoal" name="portfolio_url">
                <Input prefix={<GlobalOutlined />} placeholder="https://seu-site.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Salvar Links
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: '3',
      label: 'Segurança',
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          disabled={loading}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nova Senha"
                name="nova_senha"
                rules={[
                  { required: true, message: 'Digite a nova senha' },
                  { min: 6, message: 'A senha deve ter no mínimo 6 caracteres' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mínimo 6 caracteres" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Confirmar Nova Senha"
                name="confirmar_senha"
                dependencies={['nova_senha']}
                rules={[
                  { required: true, message: 'Confirme a nova senha' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('nova_senha') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('As senhas não coincidem'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirme a senha" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              type="primary"
              danger
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Alterar Senha
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <AdminLayout>
      {contextHolder}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '12px 0' }}>
        {/* Profile Premium Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
          height: 140,
          borderRadius: '12px 12px 0 0',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.15)'
        }} />

        <Card
          bordered={false}
          style={{
            marginTop: -60,
            borderRadius: '0 0 12px 12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            marginBottom: 24
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 20,
            flexWrap: 'wrap',
            marginTop: -60,
            marginBottom: 24,
            paddingLeft: 12
          }}>
            <Avatar
              size={120}
              src={currentUser?.avatar_url}
              icon={!currentUser?.avatar_url && <UserOutlined />}
              style={{
                border: '4px solid #fff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                background: '#7c3aed',
                fontSize: 48
              }}
            >
              {!currentUser?.avatar_url && currentUser?.nome?.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ paddingBottom: 8, flex: 1 }}>
              <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
                {currentUser?.nome || 'Carregando...'}
              </Title>
              <Space>
                <Tag color="purple">Administrador</Tag>
                <Text type="secondary">{currentUser?.email}</Text>
              </Space>
            </div>
          </div>

          <Divider style={{ margin: '12px 0 24px 0' }} />

          <Tabs defaultActiveKey="1" items={tabsItems} size="large" />
        </Card>
      </div>
    </AdminLayout>
  );
}

// Helper Tag component for design feedback consistency
function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      background: color === 'purple' ? '#f5f3ff' : '#f1f5f9',
      color: color === 'purple' ? '#7c3aed' : '#475569',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      border: `1px solid ${color === 'purple' ? '#ddd6fe' : '#cbd5e1'}`
    }}>
      {children}
    </span>
  );
}
