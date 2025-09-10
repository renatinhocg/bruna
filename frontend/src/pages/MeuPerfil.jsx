import React, { useState } from 'react';
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
  message 
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;

const MeuPerfil = ({ user }) => {
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  // Dados fictícios do perfil do cliente
  const [perfilData, setPerfilData] = useState({
    nome: user?.nome || 'João Silva',
    email: user?.email || 'joao@email.com',
    telefone: '(11) 99999-9999',
    profissao: 'Analista de Sistemas',
    empresa: 'Tech Solutions Ltda',
    experiencia: '5 anos',
    objetivos: 'Transição para uma posição de liderança em tecnologia',
    biografia: 'Profissional dedicado com experiência em desenvolvimento de software, buscando crescimento na carreira e desenvolvimento de habilidades de liderança.'
  });

  const handleEdit = () => {
    setEditing(true);
    form.setFieldsValue(perfilData);
  };

  const handleSave = (values) => {
    setPerfilData(values);
    setEditing(false);
    message.success('Perfil atualizado com sucesso!');
  };

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  return (
    <div>
      <Title level={2}>
        <UserOutlined /> Meu Perfil
      </Title>
      
      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Avatar size={120} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
              <Title level={4}>{perfilData.nome}</Title>
              <p style={{ color: '#666', marginBottom: 0 }}>{perfilData.profissao}</p>
              <p style={{ color: '#666' }}>{perfilData.empresa}</p>
              
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
                    <p><strong>Nome:</strong> {perfilData.nome}</p>
                    <p><strong>Email:</strong> {perfilData.email}</p>
                    <p><strong>Telefone:</strong> {perfilData.telefone}</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>Profissão:</strong> {perfilData.profissao}</p>
                    <p><strong>Empresa:</strong> {perfilData.empresa}</p>
                    <p><strong>Experiência:</strong> {perfilData.experiencia}</p>
                  </Col>
                </Row>
                
                <Divider />
                
                <div>
                  <p><strong>Objetivos Profissionais:</strong></p>
                  <p>{perfilData.objetivos}</p>
                </div>
                
                <Divider />
                
                <div>
                  <p><strong>Sobre Mim:</strong></p>
                  <p>{perfilData.biografia}</p>
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
