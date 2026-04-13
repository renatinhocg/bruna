import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import InputMask from 'react-input-mask';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const { Title, Text } = Typography;

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8002'}/api`;

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
        // Sempre redireciona para a home do cliente
        navigate('/cliente');
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
        navigate('/cliente');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.erro || 'Erro ao fazer cadastro';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Lado esquerdo - Imagem */}
      <div className="login-image-section">
      </div>

      {/* Lado direito - Formulário */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="login-header">
            <img src="/logo-login.png" alt="Logo" className="login-logo" />
          </div>

          <Form
            form={form}
            name={isRegister ? 'register' : 'login'}
            onFinish={isRegister ? handleRegister : handleLogin}
            layout="vertical"
            size="large"
            className="login-form"
          >
            {isRegister && (
              <Form.Item
                name="nome"
                label="Nome completo"
                rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Digite seu nome" 
                  className="login-input"
                />
              </Form.Item>
            )}

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
                className="login-input"
              />
            </Form.Item>

            {isRegister && (
              <Form.Item
                name="telefone"
                label="Telefone (opcional)"
              >
                <InputMask mask="(99) 99999-9999">
                  {(inputProps) => (
                    <Input 
                      {...inputProps}
                      prefix={<PhoneOutlined />}
                      placeholder="(00) 00000-0000" 
                      className="login-input"
                    />
                  )}
                </InputMask>
              </Form.Item>
            )}

            <Form.Item
              name="senha"
              label="Senha"
              rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Sua senha" 
                className="login-input"
              />
            </Form.Item>

            {isRegister && (
              <Form.Item
                name="confirmarSenha"
                label="Confirmar senha"
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
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Confirme sua senha" 
                  className="login-input"
                />
              </Form.Item>
            )}

            <Form.Item style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="login-button"
              >
                {isRegister ? 'Criar Conta' : 'Entrar'}
              </Button>
            </Form.Item>

            <div className="login-footer">
              <Text className="login-footer-text">
                {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}
              </Text>
              <Button
                type="link"
                onClick={() => {
                  setIsRegister(!isRegister);
                  form.resetFields();
                }}
                className="login-link-button"
              >
                {isRegister ? 'Fazer login' : 'Criar conta'}
              </Button>
            </div>
          </Form>
          {/* Lado direito - Formulário 
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link to="/cartilha" style={{
              display: 'inline-block',
              background: '#1890ff',
              color: '#fff',
              padding: '12px 32px',
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(24,144,255,0.08)',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#1765ad'}
            onMouseOut={e => e.currentTarget.style.background = '#1890ff'}
            >Visualizar Cartilha PDF</Link>
          </div>*/}
        </div>
      </div>
    </div>
  );
}

export default Login;