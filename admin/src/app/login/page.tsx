'use client';

import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import apiService from '../../services/api.js';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const handleLogin = async (values: { email: string; senha: string }) => {
    setLoading(true);
    try {
      const response = await apiService.login(values);
      
      if (response.token) {
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.usuario));
        
        message.success('Login realizado com sucesso!');
        router.push('/dashboard');
      } else {
        message.error('Erro na autenticação.');
      }
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      if (error instanceof Error && error.message.includes('401')) {
        message.error('Email ou senha incorretos!');
      } else {
        message.error('Erro no servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row style={{ width: '100%', maxWidth: 1200 }}>
        <Col xs={24} md={12} lg={14} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 40px'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <Title level={1} style={{ color: 'white', fontSize: '3rem', marginBottom: 24 }}>
              Admin Coaching
            </Title>
            <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 300, marginBottom: 32 }}>
              Painel Administrativo - Sistema de Coaching
            </Title>
            <div style={{ fontSize: '18px', lineHeight: 1.6, opacity: 0.9 }}>
              <p>👥 Gestão completa de clientes</p>
              <p>📅 Controle de agendamentos</p>
              <p>📊 Relatórios detalhados</p>
              <p>⚙️ Configurações do sistema</p>
            </div>
          </div>
        </Col>
        
        <Col xs={24} md={12} lg={10} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px'
        }}>
          <Card style={{
            width: '100%',
            maxWidth: 400,
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: 'none'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '32px',
                color: 'white'
              }}>
                <UserOutlined />
              </div>
              <Title level={2} style={{ margin: 0, color: '#2c3e50' }}>
                Login Administrativo
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Acesse o painel de controle
              </Text>
            </div>

            <Form
              form={form}
              onFinish={handleLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Por favor, insira seu email!' },
                  { type: 'email', message: 'Email inválido!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#667eea' }} />}
                  placeholder="Email do administrador"
                  style={{ height: 48, borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="senha"
                rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#667eea' }} />}
                  placeholder="Senha"
                  style={{ height: 48, borderRadius: 8 }}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: 48,
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  Entrar
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
