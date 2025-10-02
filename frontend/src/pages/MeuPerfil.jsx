import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Row, 
  Col,
  Avatar,
  Divider,
  message,
  Upload,
  Spin
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CameraOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title } = Typography;

const MeuPerfil = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [form] = Form.useForm();
  const [perfilData, setPerfilData] = useState({});

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      const token = localStorage.getItem('token');
      
      console.log('Usuário do localStorage:', usuario);
      console.log('Token disponível:', token ? 'Sim' : 'Não');
      
      if (usuario?.id && token) {
        // Primeiro tenta o endpoint específico do perfil do usuário
        let response;
        try {
          console.log('Tentando endpoint de perfil próprio...');
          response = await fetch(`http://localhost:8002/api/usuarios/perfil`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.log('Endpoint /perfil não disponível, usando dados do localStorage...');
          // Se não houver endpoint específico, usa os dados do localStorage + campos extras
          setPerfilData({
            id: usuario.id,
            nome: usuario.nome || '',
            email: usuario.email || '',
            telefone: usuario.telefone || '',
            profissao: usuario.profissao || '',
            empresa: usuario.empresa || '',
            experiencia: usuario.experiencia || '',
            objetivos: usuario.objetivos || '',
            biografia: usuario.biografia || '',
            avatar_url: usuario.avatar_url || ''
          });
          return;
        }
        
        if (response && response.ok) {
          const data = await response.json();
          console.log('Dados do perfil carregados via API:', data);
          setPerfilData(data);
        } else {
          console.log('Usando dados do localStorage como fallback...');
          // Fallback para dados do localStorage
          setPerfilData({
            id: usuario.id,
            nome: usuario.nome || '',
            email: usuario.email || '',
            telefone: usuario.telefone || '',
            profissao: usuario.profissao || '',
            empresa: usuario.empresa || '',
            experiencia: usuario.experiencia || '',
            objetivos: usuario.objetivos || '',
            biografia: usuario.biografia || '',
            avatar_url: usuario.avatar_url || ''
          });
        }
      } else {
        console.error('ID do usuário ou token não encontrado');
        message.error('Erro: usuário não autenticado');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Fallback para dados do localStorage
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      if (usuario) {
        setPerfilData({
          id: usuario.id,
          nome: usuario.nome || '',
          email: usuario.email || '',
          telefone: usuario.telefone || '',
          profissao: usuario.profissao || '',
          empresa: usuario.empresa || '',
          experiencia: usuario.experiencia || '',
          objetivos: usuario.objetivos || '',
          biografia: usuario.biografia || '',
          avatar_url: usuario.avatar_url || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async (file) => {
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      const token = localStorage.getItem('token');
      
      console.log('Fazendo upload para:', `http://localhost:8002/api/arquivos/avatar/${usuario.id}`);
      
      const response = await fetch(`http://localhost:8002/api/arquivos/avatar/${usuario.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erro no upload: ${response.status}`);
      }

      const data = await response.json();
      console.log('Resposta do upload:', data);
      
      // Atualizar dados do perfil com nova foto
      const novaFotoUrl = data.avatar_url || data.url || data.imageUrl;
      setPerfilData(prev => ({ ...prev, avatar_url: novaFotoUrl }));
      
      // Atualizar localStorage
      const usuarioAtualizado = { ...usuario, avatar_url: novaFotoUrl };
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
      
      // Disparar evento para atualizar o header
      window.dispatchEvent(new Event('profileUpdated'));
      
      message.success('Foto atualizada com sucesso!');
      
    } catch (error) {
      console.error('Erro no upload:', error);
      message.error('Erro ao fazer upload da foto');
    } finally {
      setUploadLoading(false);
    }
    return false; // Impedir upload automático do antd
  };

  const handleEdit = () => {
    setEditing(true);
    form.setFieldsValue(perfilData);
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      const token = localStorage.getItem('token');
      
      // Tenta salvar via API
      try {
        const response = await fetch(`http://localhost:8002/api/usuarios/perfil`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          const data = await response.json();
          setPerfilData(data);
          setEditing(false);
          
          // Atualizar localStorage
          const usuarioAtualizado = { ...usuario, ...values };
          localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
          
          message.success('Perfil atualizado com sucesso!');
          return;
        }
      } catch (apiError) {
        console.log('Erro na API, salvando localmente:', apiError);
      }
      
      // Fallback: salvar apenas no estado local e localStorage
      const dadosAtualizados = { ...perfilData, ...values };
      setPerfilData(dadosAtualizados);
      setEditing(false);
      
      // Atualizar localStorage
      const usuarioAtualizado = { ...usuario, ...values };
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
      
      message.success('Perfil atualizado localmente!');
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      message.error('Erro ao salvar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>
        <UserOutlined /> Meu Perfil
      </Title>
      
      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <Avatar 
                  size={120} 
                  src={perfilData.avatar_url} 
                  icon={!perfilData.avatar_url ? <UserOutlined /> : undefined}
                />
                <Upload
                  beforeUpload={handleUploadAvatar}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button
                    type="text"
                    icon={uploadLoading ? <LoadingOutlined /> : <CameraOutlined />}
                    size="small"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      borderRadius: '50%',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      border: '2px solid white',
                      width: 32,
                      height: 32
                    }}
                    loading={uploadLoading}
                  />
                </Upload>
              </div>
              <Title level={4}>{perfilData.nome || 'Nome não informado'}</Title>
              <p style={{ color: '#666', marginBottom: 0 }}>{perfilData.profissao || 'Profissão não informada'}</p>
              <p style={{ color: '#666' }}>{perfilData.empresa || 'Empresa não informada'}</p>
              
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleEdit}
                disabled={editing}
              >
                Editar Perfil
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col span={16}>
          <Card 
            title="Informações Pessoais" 
            extra={
              editing && (
                <Button 
                  type="text" 
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              )
            }
          >
            {editing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="nome"
                      label="Nome Completo"
                      rules={[{ required: true, message: 'Nome é obrigatório' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Email é obrigatório' },
                        { type: 'email', message: 'Email inválido' }
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="telefone"
                      label="Telefone"
                      rules={[{ required: true, message: 'Telefone é obrigatório' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="profissao"
                      label="Profissão"
                      rules={[{ required: true, message: 'Profissão é obrigatória' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="empresa"
                      label="Empresa Atual"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="experiencia"
                      label="Tempo de Experiência"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="objetivos"
                  label="Objetivos Profissionais"
                >
                  <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item
                  name="biografia"
                  label="Sobre Mim"
                >
                  <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    block
                  >
                    Salvar Alterações
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              <div>
                <Row gutter={16}>
                  <Col span={12}>
                    <p><strong>Nome:</strong> {perfilData.nome || 'Não informado'}</p>
                    <p><strong>Email:</strong> {perfilData.email || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> {perfilData.telefone || 'Não informado'}</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>Profissão:</strong> {perfilData.profissao || 'Não informada'}</p>
                    <p><strong>Empresa:</strong> {perfilData.empresa || 'Não informada'}</p>
                    <p><strong>Experiência:</strong> {perfilData.experiencia || 'Não informada'}</p>
                  </Col>
                </Row>
                
                <Divider />
                
                <div>
                  <p><strong>Objetivos Profissionais:</strong></p>
                  <p>{perfilData.objetivos || 'Não informado'}</p>
                </div>
                
                <Divider />
                
                <div>
                  <p><strong>Sobre Mim:</strong></p>
                  <p>{perfilData.biografia || 'Não informado'}</p>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MeuPerfil;
