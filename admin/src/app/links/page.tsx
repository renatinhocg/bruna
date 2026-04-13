'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Switch,
  InputNumber,
  message,
  Tag,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Drawer,
  Timeline,
  Typography,
  Upload
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  LinkOutlined,
  BarChartOutlined,
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons';
import AdminLayout from '../../components/AdminLayout';

const { Title, Text } = Typography;

interface Link {
  id: number;
  titulo: string;
  url: string;
  icone?: string;
  imagem_url?: string;
  descricao?: string;
  cor?: string;
  ordem: number;
  ativo: boolean;
  total_clicks?: number;
  clicks_ultimos_7_dias?: number;
}

interface Click {
  id: number;
  ip_address?: string;
  user_agent?: string;
  referer?: string;
  clicked_at: string;
}

interface LinkStats {
  total_clicks: number;
  clicks_por_dia: Record<string, number>;
  clicks_por_pais: Record<string, number>;
  ultimos_clicks: Array<{
    id: number;
    clicked_at: string;
    ip_address?: string;
    user_agent?: string;
  }>;
}

const AdminLinks = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [statsDrawerVisible, setStatsDrawerVisible] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [selectedLinkStats, setSelectedLinkStats] = useState<LinkStats | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [form] = Form.useForm();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

  const carregarLinks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/links`);
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error('Erro ao carregar links:', error);
      message.error('Erro ao carregar links');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    carregarLinks();
  }, [carregarLinks]);

  const carregarEstatisticas = async (linkId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/links/${linkId}/stats?dias=30`);
      const data = await response.json();
      setSelectedLinkStats(data);
      setStatsDrawerVisible(true);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      message.error('Erro ao carregar estatísticas');
    }
  };

  const handleSubmit = async (values: Record<string, string | number | boolean>) => {
    try {
      const options = {
        method: editingLink ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      };
      
      const url = editingLink 
        ? `${API_URL}/api/links/${editingLink.id}`
        : `${API_URL}/api/links`;
        
      await fetch(url, options);
      message.success(editingLink ? 'Link atualizado com sucesso!' : 'Link criado com sucesso!');
      
      setModalVisible(false);
      form.resetFields();
      setEditingLink(null);
      carregarLinks();
    } catch (error) {
      console.error('Erro ao salvar link:', error);
      message.error('Erro ao salvar link');
    }
  };

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    form.setFieldsValue(link);
    if (link.imagem_url) {
      setImagePreview(link.imagem_url);
    }
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/links/${id}`, { method: 'DELETE' });
      message.success('Link deletado com sucesso!');
      carregarLinks();
    } catch (error) {
      console.error('Erro ao deletar link:', error);
      message.error('Erro ao deletar link');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingLink(null);
    setImagePreview('');
    form.resetFields();
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/api/arquivos/link-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.url) {
        form.setFieldsValue({ imagem_url: data.url });
        setImagePreview(data.url);
        message.success('Imagem enviada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      message.error('Erro ao enviar imagem');
    }
    return false; // Previne upload automático
  };

  const columns = [
    {
      title: 'Ordem',
      dataIndex: 'ordem',
      key: 'ordem',
      width: 80,
      sorter: (a: Link, b: Link) => a.ordem - b.ordem,
    },
    {
      title: 'Ícone',
      dataIndex: 'icone',
      key: 'icone',
      width: 80,
      render: (icone: string, record: Link) => (
        <div style={{
          fontSize: '24px',
          width: '46px',
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: record.imagem_url ? 'transparent' : (record.cor || '#1890ff'),
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {record.imagem_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={record.imagem_url} 
              alt={record.titulo}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            icone || '🔗'
          )}
        </div>
      ),
    },
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      render: (titulo: string, record: Link) => (
        <div>
          <div style={{ fontWeight: 600 }}>{titulo}</div>
          {record.descricao && (
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {record.descricao}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
          {url}
        </a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      key: 'ativo',
      width: 100,
      render: (ativo: boolean) => (
        <Tag color={ativo ? 'green' : 'red'}>
          {ativo ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Cliques (Total)',
      dataIndex: 'total_clicks',
      key: 'total_clicks',
      width: 130,
      sorter: (a: Link, b: Link) => (a.total_clicks || 0) - (b.total_clicks || 0),
      render: (total: number) => (
        <Tag color="blue">{total || 0}</Tag>
      ),
    },
    {
      title: 'Últimos 7 dias',
      dataIndex: 'clicks_ultimos_7_dias',
      key: 'clicks_ultimos_7_dias',
      width: 130,
      sorter: (a: Link, b: Link) => (a.clicks_ultimos_7_dias || 0) - (b.clicks_ultimos_7_dias || 0),
      render: (clicks: number) => (
        <Tag color="purple">{clicks || 0}</Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: Link) => (
        <Space size="small">
          <Button
            type="link"
            icon={<BarChartOutlined />}
            onClick={() => carregarEstatisticas(record.id)}
            size="small"
          >
            Stats
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja deletar este link?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Deletar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Calcular estatísticas gerais
  const totalClicks = links.reduce((sum, link) => sum + (link.total_clicks || 0), 0);
  const clicksUltimos7Dias = links.reduce((sum, link) => sum + (link.clicks_ultimos_7_dias || 0), 0);
  const linksAtivos = links.filter(link => link.ativo).length;

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>
            <LinkOutlined style={{ marginRight: '8px' }} />
            Gerenciar Links - Estilo Linktree
          </Title>
          <Text type="secondary">
            Gerencie seus links com rastreamento de cliques
          </Text>
        </div>

      {/* Estatísticas Gerais */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total de Links"
              value={links.length}
              prefix={<LinkOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Links Ativos"
              value={linksAtivos}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total de Cliques"
              value={totalClicks}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cliques (7 dias)"
              value={clicksUltimos7Dias}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabela de Links */}
      <Card
        title={
          <Space>
            <LinkOutlined />
            <span>Gerenciar Links</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Novo Link
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={links}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total de ${total} links`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal de Criar/Editar Link */}
      <Modal
        title={editingLink ? 'Editar Link' : 'Novo Link'}
        open={modalVisible}
        onCancel={handleModalClose}
        onOk={() => form.submit()}
        width={600}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            icone: '🔗',
            cor: '#1890ff',
            ordem: 0,
            ativo: true,
          }}
        >
          <Form.Item
            name="titulo"
            label="Título"
            rules={[{ required: true, message: 'Digite o título do link' }]}
          >
            <Input placeholder="Ex: Meu Instagram" />
          </Form.Item>

          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: 'Digite a URL' },
              { type: 'url', message: 'Digite uma URL válida' }
            ]}
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição (opcional)"
          >
            <Input.TextArea rows={2} placeholder="Breve descrição do link" />
          </Form.Item>

          <Form.Item
            label="Imagem do Link (46x46px recomendado)"
            extra="Faça upload de uma imagem PNG, JPG ou WebP"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={handleImageUpload}
                onRemove={() => {
                  form.setFieldsValue({ imagem_url: '' });
                  setImagePreview('');
                }}
                showUploadList={true}
                accept="image/*"
              >
                {!imagePreview && !form.getFieldValue('imagem_url') && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
              {(imagePreview || form.getFieldValue('imagem_url')) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={imagePreview || form.getFieldValue('imagem_url')} 
                    alt="Preview"
                    style={{ 
                      width: 46, 
                      height: 46, 
                      objectFit: 'cover', 
                      borderRadius: 8,
                      border: '1px solid #d9d9d9'
                    }}
                  />
                  <Text type="secondary">Preview 46x46px</Text>
                </div>
              )}
            </Space>
          </Form.Item>
          
          <Form.Item name="imagem_url" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="icone"
                label="Ícone (Emoji) - Alternativa à imagem"
              >
                <Input placeholder="🔗" maxLength={2} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cor"
                label="Cor de Fundo"
              >
                <Input type="color" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ordem"
                label="Ordem"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ativo"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer de Estatísticas */}
      <Drawer
        title="Estatísticas do Link"
        placement="right"
        width={500}
        onClose={() => setStatsDrawerVisible(false)}
        open={statsDrawerVisible}
      >
        {selectedLinkStats && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Statistic
                title="Total de Cliques (30 dias)"
                value={selectedLinkStats.total_clicks}
                prefix={<BarChartOutlined />}
              />
            </Card>

            <Card title="Cliques por Dia" style={{ marginBottom: 16 }}>
              {Object.entries(selectedLinkStats.clicks_por_dia || {})
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 10)
                .map(([data, clicks]) => (
                  <div key={data} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span>{new Date(data).toLocaleDateString('pt-BR')}</span>
                    <Tag color="blue">{clicks as number} cliques</Tag>
                  </div>
                ))}
            </Card>

            <Card title="Últimos Cliques">
              <Timeline>
                {selectedLinkStats.ultimos_clicks?.slice(0, 10).map((click: Click, index: number) => (
                  <Timeline.Item key={index}>
                    <div style={{ fontSize: '12px' }}>
                      <div>{new Date(click.clicked_at).toLocaleString('pt-BR')}</div>
                      {click.ip_address && (
                        <div style={{ color: '#8c8c8c' }}>IP: {click.ip_address}</div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        )}
      </Drawer>
      </div>
    </AdminLayout>
  );
};

export default AdminLinks;
