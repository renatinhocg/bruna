import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Tabs, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, LoginOutlined, UserAddOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const API_BASE_URL = 'http://localhost:8002/api';

function Login() {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

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
        const user = response.data.usuario;
        if (user.tipo === 'admin' || user.email.includes('admin')) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
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
      <Card style={{ width: '100%', maxWidth: 400, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Sistema de Coach
          </Title>
          <Text type="secondary">Plataforma de desenvolvimento profissional</Text>
        </div>
        <Form
          form={form}
          name={isRegister ? 'register' : 'login'}
          onFinish={isRegister ? handleRegister : handleLogin}
          layout="vertical"
          size="large"
        >
          {isRegister && (
            <Form.Item
              name="nome"
              rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nome completo" />
            </Form.Item>
          )}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor, insira seu email!' },
              { type: 'email', message: 'Email inválido!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          {isRegister && (
            <Form.Item
              name="telefone"
              rules={[]}
            >
              <Input placeholder="Telefone (opcional)" />
            </Form.Item>
          )}
          <Form.Item
            name="senha"
            rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
          </Form.Item>
          {isRegister && (
            <Form.Item
              name="confirmarSenha"
              dependencies={["senha"]}
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
              <Input.Password prefix={<LockOutlined />} placeholder="Confirmar senha" />
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