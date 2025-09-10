import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Tabs, Row, Col, Divider } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined,
  LoginOutlined,
  UserAddOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

function Login() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8002/api/auth/login', values);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        message.success('Login realizado com sucesso!');
        
        // Redirecionar baseado no tipo de usuário
        if (response.data.user.tipo === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (error.response?.status === 401) {
        message.error('Email ou senha incorretos!');
      } else {
        message.error('Erro no servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const { confirmarSenha, ...userData } = values;
      const response = await axios.post('http://localhost:8002/api/auth/register', userData);
      
      message.success('Conta criada com sucesso! Faça login para continuar.');
      setActiveTab('login');
      registerForm.resetFields();
    } catch (error) {
      console.error('Erro no cadastro:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Erro ao criar conta. Tente novamente.');
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
              Sistema de Coaching
            </Title>
            <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 300, marginBottom: 32 }}>
              Transforme sua carreira com orientação profissional especializada
            </Title>
            <div style={{ fontSize: '18px', lineHeight: 1.6, opacity: 0.9 }}>
              <p>✨ Coaching personalizado para sua carreira</p>
              <p>📈 Acompanhamento do seu progresso</p>
              <p>🎯 Definição de objetivos claros</p>
              <p>🚀 Acelere seu crescimento profissional</p>
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
                {activeTab === 'login' ? 'Bem-vindo!' : 'Criar Conta'}
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                {activeTab === 'login' ? 'Faça login para continuar' : 'Cadastre-se para começar'}
              </Text>
            </div>

            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              centered
              style={{ marginBottom: 24 }}
              items={[
                {
                  key: 'login',
                  label: (
                    <span style={{ fontSize: 16, fontWeight: 500 }}>
                      <LoginOutlined style={{ marginRight: 8 }} />
                      Login
                    </span>
                  ),
                },
                {
                  key: 'register',
                  label: (
                    <span style={{ fontSize: 16, fontWeight: 500 }}>
                      <UserAddOutlined style={{ marginRight: 8 }} />
                      Cadastro
                    </span>
                  ),
                }
              ]}
            />

            {activeTab === 'login' ? (
              <>
                <Form
                  form={loginForm}
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
                      prefix={<MailOutlined style={{ color: '#667eea' }} />}
                      placeholder="Seu email"
                      style={{ height: 48, borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="senha"
                    rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: '#667eea' }} />}
                      placeholder="Sua senha"
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
                
                <Divider plain style={{ color: '#64748b', fontSize: 14 }}>
                  Acesso rápido para demonstração
                </Divider>
                
                <Button 
                  block 
                  size="large"
                  style={{ 
                    height: 40,
                    borderRadius: 8,
                    borderColor: '#667eea',
                    color: '#667eea',
                    marginTop: 16
                  }}
                  onClick={() => {
                    loginForm.setFieldsValue({
                      email: 'admin@coaching.com',
                      senha: '123456'
                    });
                  }}
                >
                  Preencher dados Admin (Demo)
                </Button>
              </>
            ) : (
              <Form
                form={registerForm}
                onFinish={handleRegister}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="nome"
                  rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#667eea' }} />}
                    placeholder="Seu nome completo"
                    style={{ height: 48, borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Por favor, insira seu email!' },
                    { type: 'email', message: 'Email inválido!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#667eea' }} />}
                    placeholder="Seu email"
                    style={{ height: 48, borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item
                  name="telefone"
                  rules={[{ required: true, message: 'Por favor, insira seu telefone!' }]}
                >
                  <Input
                    prefix={<PhoneOutlined style={{ color: '#667eea' }} />}
                    placeholder="Seu telefone"
                    style={{ height: 48, borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item
                  name="senha"
                  rules={[
                    { required: true, message: 'Por favor, insira sua senha!' },
                    { min: 6, message: 'Senha deve ter pelo menos 6 caracteres!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#667eea' }} />}
                    placeholder="Sua senha"
                    style={{ height: 48, borderRadius: 8 }}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmarSenha"
                  dependencies={['senha']}
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
                    prefix={<LockOutlined style={{ color: '#667eea' }} />}
                    placeholder="Confirmar senha"
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
                    Criar Conta
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Login;
