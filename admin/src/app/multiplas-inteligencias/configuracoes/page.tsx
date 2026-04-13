'use client';

import { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, message, Space, Divider, Select, Breadcrumb } from 'antd';
import { SettingOutlined, SaveOutlined, ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import apiService from '../../../services/api';

interface ConfiguracaoTeste {
  teste_ativo: boolean;
  tempo_limite: number;
  mostrar_progresso: boolean;
  permitir_voltar: boolean;
  randomizar_perguntas: boolean;
  randomizar_opcoes: boolean;
  pontuacao_minima: number;
  pontuacao_maxima: number;
  mensagem_inicio: string;
  mensagem_fim: string;
  instrucoes: string;
  tema_cores: string;
}

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        setLoading(true);
        const response = await apiService.getConfiguracoes();
        
        if (response.success) {
          form.setFieldsValue(response.data);
        } else {
          message.error('Erro ao carregar configurações');
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        message.error('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };

    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      carregarConfiguracoes();
    }
  }, [router, form]);

  const resetarConfiguracoes = async () => {
    try {
      setLoading(true);
      const response = await apiService.resetConfiguracoes();
      
      if (response.success) {
        form.setFieldsValue(response.data);
        message.success('Configurações resetadas para o padrão!');
      } else {
        message.error('Erro ao resetar configurações');
      }
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      message.error('Erro ao resetar configurações');
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async (values: ConfiguracaoTeste) => {
    try {
      setSalvando(true);
      const response = await apiService.updateConfiguracoes(values);
      
      if (response.success) {
        message.success('Configurações salvas com sucesso!');
      } else {
        message.error(response.message || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      message.error('Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

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
              title: 'Configurações',
            },
          ]}
        />

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/multiplas-inteligencias')}
                style={{ marginRight: 16 }}
              >
                Voltar
              </Button>
              <div>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                  <SettingOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                  Configurações do Teste
                </h2>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                  Configure os parâmetros e comportamento do teste de múltiplas inteligências
                </p>
              </div>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={resetarConfiguracoes}
              loading={loading}
            >
              Resetar para Padrão
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={salvarConfiguracoes}
            disabled={loading}
          >
            {/* Configurações Gerais */}
            <Card type="inner" title="Configurações Gerais" style={{ marginBottom: 16 }}>
              <Form.Item
                name="teste_ativo"
                label="Teste Ativo"
                valuePropName="checked"
              >
                <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
              </Form.Item>

              <Form.Item
                name="tempo_limite"
                label="Tempo Limite (minutos)"
                rules={[{ required: true, message: 'Por favor, defina o tempo limite' }]}
              >
                <InputNumber min={5} max={120} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="tema_cores"
                label="Tema de Cores"
                rules={[{ required: true, message: 'Por favor, selecione um tema' }]}
              >
                <Select>
                  <Select.Option value="azul">Azul</Select.Option>
                  <Select.Option value="verde">Verde</Select.Option>
                  <Select.Option value="roxo">Roxo</Select.Option>
                  <Select.Option value="laranja">Laranja</Select.Option>
                </Select>
              </Form.Item>
            </Card>

            {/* Comportamento do Teste */}
            <Card type="inner" title="Comportamento do Teste" style={{ marginBottom: 16 }}>
              <Form.Item
                name="mostrar_progresso"
                label="Mostrar Barra de Progresso"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="permitir_voltar"
                label="Permitir Voltar à Pergunta Anterior"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="randomizar_perguntas"
                label="Randomizar Ordem das Perguntas"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="randomizar_opcoes"
                label="Randomizar Opções de Resposta"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>

            {/* Pontuação */}
            <Card type="inner" title="Sistema de Pontuação" style={{ marginBottom: 16 }}>
              <Form.Item
                name="pontuacao_minima"
                label="Pontuação Mínima"
                rules={[{ required: true, message: 'Por favor, defina a pontuação mínima' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="pontuacao_maxima"
                label="Pontuação Máxima"
                rules={[{ required: true, message: 'Por favor, defina a pontuação máxima' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Card>

            {/* Mensagens */}
            <Card type="inner" title="Mensagens e Instruções" style={{ marginBottom: 16 }}>
              <Form.Item
                name="mensagem_inicio"
                label="Mensagem de Início"
                rules={[{ required: true, message: 'Por favor, defina a mensagem de início' }]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item
                name="instrucoes"
                label="Instruções do Teste"
                rules={[{ required: true, message: 'Por favor, defina as instruções' }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="mensagem_fim"
                label="Mensagem de Finalização"
                rules={[{ required: true, message: 'Por favor, defina a mensagem de fim' }]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
            </Card>

            <Divider />

            {/* Botões de Ação */}
            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => router.push('/multiplas-inteligencias')}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit" loading={salvando} icon={<SaveOutlined />}>
                  Salvar Configurações
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
}
