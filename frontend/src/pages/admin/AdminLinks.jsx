import React, { useState, useEffect } from 'react';
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
  Upload
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  LinkOutlined,
  BarChartOutlined,
  EyeOutlined,
  LoadingOutlined,
  UploadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const AdminLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [statsDrawerVisible, setStatsDrawerVisible] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [selectedLinkStats, setSelectedLinkStats] = useState(null);
  const [form] = Form.useForm();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

  useEffect(() => {
    carregarLinks();
  }, []);

  const carregarLinks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/links`);
      setLinks(response.data);
    } catch (error) {
      console.error('Erro ao carregar links:', error);
      message.error('Erro ao carregar links');
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async (linkId) => {
    try {
      const response = await axios.get(`${API_URL}/api/links/${linkId}/stats?dias=30`);
      setSelectedLinkStats(response.data);
      setStatsDrawerVisible(true);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      message.error('Erro ao carregar estatísticas');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingLink) {
        await axios.put(`${API_URL}/api/links/${editingLink.id}`, values);
        message.success('Link atualizado com sucesso!');
      } else {
        await axios.post(`${API_URL}/api/links`, values);
        message.success('Link criado com sucesso!');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingLink(null);
      carregarLinks();
    } catch (error) {
      console.error('Erro ao salvar link:', error);
      message.error('Erro ao salvar link');
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setImageUrl(link.imagem_url || '');
    form.setFieldsValue(link);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/links/${id}`);
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
    setImageUrl('');
    form.resetFields();
  };

  const columns = [
    {
      title: 'Ordem',
      dataIndex: 'ordem',
      key: 'ordem',
      width: 80,
      sorter: (a, b) => a.ordem - b.ordem,
    },
    {
      title: 'Ícone',
      dataIndex: 'icone',
      key: 'icone',
      width: 80,
      render: (icone, record) => (
        <div style={{
          fontSize: '24px',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: record.cor || '#1890ff',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {record.imagem_url ? (
            <img src={record.imagem_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      render: (titulo, record) => (
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
      render: (url) => (
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
      render: (ativo) => (
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
      sorter: (a, b) => a.total_clicks - b.total_clicks,
      render: (total) => (
        <Tag color="blue">{total || 0}</Tag>
      ),
    },
    {
      title: 'Últimos 7 dias',
      dataIndex: 'clicks_ultimos_7_dias',
      key: 'clicks_ultimos_7_dias',
      width: 130,
      sorter: (a, b) => a.clicks_ultimos_7_dias - b.clicks_ultimos_7_dias,
      render: (clicks) => (
        <Tag color="purple">{clicks || 0}</Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
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
    <div>
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

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="icone"
                label="Ícone (Emoji)"
              >
                <Input placeholder="🔗" maxLength={2} disabled={!!imageUrl} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="imagem_url"
                label="Imagem do Link (46x46px recomendado)"
              >
                <Upload
                  name="image"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action={`${API_URL}/api/arquivos/link-image`}
                  onChange={(info) => {
                    if (info.file.status === 'uploading') {
                      setImageLoading(true);
                      return;
                    }
                    if (info.file.status === 'done') {
                      const url = info.file.response.url;
                      setImageLoading(false);
                      setImageUrl(url);
                      form.setFieldsValue({ imagem_url: url });
                    }
                  }}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="avatar" style={{ width: '100%', borderRadius: '8px' }} />
                  ) : (
                    <div>
                      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              {imageUrl && (
                <Button 
                  type="link" 
                  danger 
                  onClick={() => {
                    setImageUrl('');
                    form.setFieldsValue({ imagem_url: '' });
                  }}
                >
                  Remover Imagem
                </Button>
              )}
            </Col>
            <Col span={8}>
              <Form.Item
                name="cor"
                label="Cor de Fundo"
              >
                <Input type="color" />
              </Form.Item>
            </Col>
            <Col span={8}>
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
                .sort((a, b) => b[0].localeCompare(a[0]))
                .slice(0, 10)
                .map(([data, clicks]) => (
                  <div key={data} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span>{new Date(data).toLocaleDateString('pt-BR')}</span>
                    <Tag color="blue">{clicks} cliques</Tag>
                  </div>
                ))}
            </Card>

            <Card title="Últimos Cliques">
              <Timeline>
                {selectedLinkStats.ultimos_clicks?.slice(0, 10).map((click, index) => (
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
  );
};

export default AdminLinks;
