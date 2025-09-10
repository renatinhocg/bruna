import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Tabs, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, LoginOutlined, UserAddOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const API_BASE_URL = 'http://localhost:8002';

function Login() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: values.email,
        senha: values.senha
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        
        message.success('Login realizado com sucesso!');
        
        // Verificar se é admin ou cliente e redirecionar
        const user = response.data.usuario;
        if (user.tipo === 'admin' || user.email.includes('admin')) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
      
    } catch (error) {
      console.error('Erro no login:', error);
      const errorMessage = error.response?.data?.erro || 'Erro ao fazer login';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/cadastro`, {
        nome: values.nome,
        email: values.email,
        senha: values.senha,
        telefone: values.telefone
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        
        message.success('Cadastro realizado com sucesso!');
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      const errorMessage = error.response?.data?.erro || 'Erro ao fazer cadastro';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 450, 
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          borderRadius: 16,
          border: 'none'
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#2c3e50', marginBottom: 8 }}>
            Portal de Coaching
          </Title>
          <Text style={{ color: '#64748b', fontSize: 16 }}>
            Faça login ou crie sua conta
          </Text>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          centered
          size="large"
        >
          <TabPane 
            tab={
              <span>
                <LoginOutlined />
                Entrar
              </span>
            } 
            key="login"
          >
            <Form
              form={loginForm}
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Por favor, insira seu email!' },
                  { type: 'email', message: 'Email inválido!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="seu@email.com"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="senha"
                label="Senha"
                rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Sua senha"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  size="large"
                  style={{ 
                    height: 48,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 600
                  }}
                >
                  Entrar
                </Button>
              </Form.Item>
            </Form>
            
            <Divider plain style={{ color: '#64748b' }}>
              Acesso administrativo
            </Divider>
            
            <Button 
              block 
              size="large"
              style={{ 
                height: 40,
                borderRadius: 8,
                borderColor: '#667eea',
                color: '#667eea'
              }}
              onClick={() => {
                loginForm.setFieldsValue({
                  email: 'admin@coaching.com',
                  senha: '123456'
                });
              }}
            >
              Login como Admin (Demo)
            </Button>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <UserAddOutlined />
                Cadastrar
              </span>
            } 
            key="register"
          >
            <Form
              form={registerForm}
              name="register"
              onFinish={handleRegister}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="nome"
                label="Nome Completo"
                rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Seu nome completo"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Por favor, insira seu email!' },
                  { type: 'email', message: 'Email inválido!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="seu@email.com"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="telefone"
                label="Telefone"
                rules={[{ required: true, message: 'Por favor, insira seu telefone!' }]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="(11) 99999-9999"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="senha"
                label="Senha"
                rules={[
                  { required: true, message: 'Por favor, insira sua senha!' },
                  { min: 6, message: 'Senha deve ter pelo menos 6 caracteres!' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Mínimo 6 caracteres"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="confirmarSenha"
                label="Confirmar Senha"
                dependencies={['senha']}
                rules={[
                  { required: true, message: 'Por favor, confirme sua senha!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('senha') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Senhas não coincidem!'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Confirme sua senha"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  size="large"
                  style={{ 
                    height: 48,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 600
                  }}
                >
                  Criar Conta
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Sistema de Coach
          </Title>
          <Text type="secondary">Plataforma de desenvolvimento profissional</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          {isRegister && (
            <Form.Item
              name="nome"
              rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nome completo"
              />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor, insira seu email!' },
              { type: 'email', message: 'Email inválido!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          {isRegister && (
            <Form.Item
              name="telefone"
              rules={[{ required: false }]}
            >
              <Input
                placeholder="Telefone (opcional)"
              />
            </Form.Item>
          )}

          <Form.Item
            name="senha"
            rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Senha"
            />
          </Form.Item>

          {isRegister && (
            <Form.Item
              name="confirmarSenha"
              rules={[
                { required: true, message: 'Por favor, confirme sua senha!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('senha') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('As senhas não coincidem!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirmar senha"
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: '48px', fontSize: '16px' }}
            >
              {isRegister ? 'Cadastrar' : 'Entrar'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
              <Button
                type="link"
                onClick={() => setIsRegister(!isRegister)}
                style={{ padding: 0 }}
              >
                {isRegister ? 'Fazer login' : 'Cadastrar-se'}
              </Button>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Login;