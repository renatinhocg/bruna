'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  InputNumber,
  Tabs,
  Row,
  Col,
  notification,
  Typography,
  Divider,
  Space,
  Select,
  Popconfirm
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  UndoOutlined,
  CompassOutlined,
  MailOutlined,
  GlobalOutlined,
  TeamOutlined,
  LockOutlined
} from '@ant-design/icons';
import apiService from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function ConfiguracoesPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const config = await apiService.getConfiguracoes();
      const configData = config.success ? config.data : config;
      // O backend retorna um objeto de configurações. Vamos carregar no form.
      form.setFieldsValue({
        system_name: configData.system_name || 'Admin Coaching',
        support_email: configData.support_email || 'suporte@coaching.com.br',
        api_environment: configData.api_environment || 'production',
        
        // Configurações de testes
        teste_ativo: configData.teste_ativo !== undefined ? configData.teste_ativo : true,
        tempo_limite: configData.tempo_limite || 30,
        mostrar_progresso: configData.mostrar_progresso !== undefined ? configData.mostrar_progresso : true,
        permitir_voltar: configData.permitir_voltar !== undefined ? configData.permitir_voltar : false,
        randomizar_perguntas: configData.randomizar_perguntas !== undefined ? configData.randomizar_perguntas : false,
        
        // Vagas e Candidatos
        prazo_vaga_dias: configData.prazo_vaga_dias || 30,
        limite_candidaturas: configData.limite_candidaturas || 5,
        notificar_nova_candidatura: configData.notificar_nova_candidatura !== undefined ? configData.notificar_nova_candidatura : true
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Fallback em caso de banco vazio ou erro temporário
      form.setFieldsValue({
        system_name: 'Admin Coaching',
        support_email: 'suporte@coaching.com.br',
        api_environment: 'production',
        teste_ativo: true,
        tempo_limite: 30,
        mostrar_progresso: true,
        permitir_voltar: false,
        randomizar_perguntas: false,
        prazo_vaga_dias: 30,
        limite_candidaturas: 5,
        notificar_nova_candidatura: true
      });
      api.warning({
        message: 'Configurações Padrão Carregadas',
        description: 'Usando valores padrões enquanto estabelece conexão.',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  }, [api, form]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async (values: any) => {
    setLoading(true);
    try {
      await apiService.updateConfiguracoes(values);
      api.success({
        message: 'Configurações salvas com sucesso!',
        placement: 'topRight'
      });
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      api.error({
        message: 'Falha ao salvar configurações',
        description: error.message || 'Erro de rede ou permissão.',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = async () => {
    setLoading(true);
    try {
      await apiService.resetConfiguracoes();
      api.success({
        message: 'Configurações restauradas com sucesso!',
        placement: 'topRight'
      });
      await loadSettings();
    } catch (error: any) {
      console.error('Erro ao resetar:', error);
      api.error({
        message: 'Falha ao restaurar configurações',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: '1',
      label: 'Geral',
      children: (
        <Form form={form} layout="vertical" onFinish={handleSaveSettings} disabled={loading}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nome da Plataforma"
                name="system_name"
                rules={[{ required: true, message: 'O nome é obrigatório' }]}
              >
                <Input prefix={<CompassOutlined />} placeholder="Ex: Admin Coaching" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="E-mail de Suporte"
                name="support_email"
                rules={[
                  { required: true, message: 'O e-mail é obrigatório' },
                  { type: 'email', message: 'Insira um e-mail válido' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Ex: contato@empresa.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="Ambiente de Execução" name="api_environment">
                <Select placeholder="Selecione o ambiente">
                  <Option value="development">Desenvolvimento (Localhost)</Option>
                  <Option value="staging">Homologação (Staging)</Option>
                  <Option value="production">Produção (Hostinger/Live)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Salvar Alterações
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: '2',
      label: 'Testes & Avaliações',
      children: (
        <Form form={form} layout="vertical" onFinish={handleSaveSettings} disabled={loading}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tempo Limite Padrão (Minutos)"
                name="tempo_limite"
                rules={[{ required: true, message: 'O tempo é obrigatório' }]}
              >
                <InputNumber min={5} max={180} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
              <Form.Item name="teste_ativo" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch />
              </Form.Item>
              <span style={{ marginLeft: 8, fontWeight: 500 }}>Permitir novos testes e avaliações</span>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item name="mostrar_progresso" valuePropName="checked" label="Exibir barra de progresso no teste">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="permitir_voltar" valuePropName="checked" label="Permitir que o usuário volte perguntas">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="randomizar_perguntas" valuePropName="checked" label="Randomizar ordem das perguntas">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Salvar Configurações de Teste
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: '3',
      label: 'Recrutamento & Vagas',
      children: (
        <Form form={form} layout="vertical" onFinish={handleSaveSettings} disabled={loading}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Prazo de Validade de Vagas (Dias)"
                name="prazo_vaga_dias"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={365} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Limite de Candidaturas por Usuário"
                name="limite_candidaturas"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center', paddingTop: 20 }}>
              <Form.Item name="notificar_nova_candidatura" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch />
              </Form.Item>
              <span style={{ marginLeft: 8, fontWeight: 500 }}>Notificar administradores sobre novas candidaturas</span>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Salvar Regras de Recrutamento
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <AdminLayout>
      {contextHolder}
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <SettingOutlined style={{ marginRight: 8, color: '#7c3aed' }} />
              Configurações do Sistema
            </Title>
            <Text type="secondary">
              Gerencie as regras de negócio, parâmetros de testes e informações globais do painel administrativo.
            </Text>
          </div>
          <Popconfirm
            title="Deseja restaurar as configurações originais?"
            description="Isso reverterá todas as alterações feitas para o estado padrão."
            onConfirm={handleResetSettings}
            okText="Restaurar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<UndoOutlined />}>
              Restaurar Padrões
            </Button>
          </Popconfirm>
        </div>

        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
          <Tabs defaultActiveKey="1" items={tabItems} size="large" />
        </Card>
      </div>
    </AdminLayout>
  );
}
