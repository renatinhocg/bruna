'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Space,
    Popconfirm,
    notification,
    Tag,
    Row,
    Col,
    Drawer,
    Typography,
    Avatar,
    Divider,
    Card
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FilePdfOutlined,
    EyeOutlined,
    UserOutlined
} from '@ant-design/icons';
import apiService from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export default function VagasPage() {
    const [vagas, setVagas] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVaga, setEditingVaga] = useState(null);
    const [form] = Form.useForm();

    // States para o Funil de Candidatos
    const [funnelVisible, setFunnelVisible] = useState(false);
    const [selectedVaga, setSelectedVaga] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loadingF, setLoadingF] = useState(false);

    const [api, contextHolder] = notification.useNotification();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [vagasData, empresasData] = await Promise.all([
                apiService.getJobs(),
                apiService.getCompanies()
            ]);
            setVagas(vagasData);
            setEmpresas(empresasData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            api.error({ message: 'Erro ao carregar vagas', placement: 'topRight' });
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAdd = () => {
        setEditingVaga(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (vaga) => {
        setEditingVaga(vaga);
        form.setFieldsValue(vaga);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await apiService.deleteJob(id);
            api.success({ message: 'Vaga excluída com sucesso!', placement: 'topRight' });
            await loadData();
        } catch (error) {
            console.error('Erro ao excluir vaga:', error);
            api.error({ message: 'Erro ao excluir vaga', placement: 'topRight' });
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (editingVaga) {
                await apiService.updateJob(editingVaga.id, values);
                api.success({ message: 'Vaga atualizada com sucesso!', placement: 'topRight' });
            } else {
                await apiService.createJob(values);
                api.success({ message: 'Vaga criada com sucesso!', placement: 'topRight' });
            }

            setModalVisible(false);
            form.resetFields();
            setEditingVaga(null);
            await loadData();
        } catch (error) {
            console.error('Erro ao salvar vaga:', error);
            api.error({ message: 'Erro ao salvar vaga', placement: 'topRight' });
        } finally {
            setLoading(false);
        }
    };

    const openFunnel = async (vaga) => {
        setSelectedVaga(vaga);
        setFunnelVisible(true);
        setLoadingF(true);
        try {
            const data = await apiService.getJobApplications(vaga.id);
            setApplications(data);
        } catch (error) {
            api.error({ message: 'Erro ao carregar candidatos', placement: 'topRight' });
        } finally {
            setLoadingF(false);
        }
    };

    const updateApplicationStatus = async (appId, newStatus) => {
        try {
            await apiService.updateJobApplicationStatus(appId, newStatus);
            api.success({ message: 'Status atualizado', placement: 'topRight' });
            // Reload applications for current job
            const data = await apiService.getJobApplications(selectedVaga.id);
            setApplications(data);
        } catch (err) {
            api.error({ message: 'Falha ao atualizar status', placement: 'topRight' });
        }
    };

    const columns = [
        {
            title: 'Vaga',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{record.company?.name}</div>
                </div>
            )
        },
        {
            title: 'Tipo/Modalidade',
            key: 'tipo',
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Tag color="purple">{record.type}</Tag>
                    <Tag color={record.modality === 'REMOTE' ? 'green' : record.modality === 'HYBRID' ? 'orange' : 'default'}>
                        {record.modality === 'REMOTE' ? 'Remoto' : record.modality === 'HYBRID' ? 'Híbrido' : 'Presencial'}
                    </Tag>
                </Space>
            )
        },
        {
            title: 'Candidatos',
            key: 'candidatos',
            render: (_, record) => (
                <Button
                    type="dashed"
                    icon={<TeamOutlined />}
                    size="small"
                    onClick={() => openFunnel(record)}
                >
                    Ver Funil
                </Button>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'OPEN' ? 'green' : 'red'}>
                    {status === 'OPEN' ? 'Aberta' : 'Fechada'}
                </Tag>
            )
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Tem certeza que deseja excluir esta vaga?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Helper component for Funnel Icon since antd TeamOutlined was throwing error if not imported directly
    const TeamOutlined = () => <span role="img" aria-label="team">👥</span>;

    return (
        <AdminLayout>
            {contextHolder}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2>Gestão de Vagas ({vagas.length})</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Nova Vaga
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={vagas}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />

                <Modal
                    title={editingVaga ? 'Editar Vaga' : 'Nova Vaga'}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                    width={800}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        size="large"
                        initialValues={{ status: 'OPEN', type: 'CLT', modality: 'PRESENTIAL' }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Título da Vaga"
                                    name="title"
                                    rules={[{ required: true, message: 'O título é obrigatório' }]}
                                >
                                    <Input placeholder="Ex: Desenvolvedor Front-end Pleno" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Empresa"
                                    name="company_id"
                                    rules={[{ required: true, message: 'Selecione a empresa' }]}
                                >
                                    <Select placeholder="Selecione a empresa cliente">
                                        {empresas.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Descrição Completa"
                            name="description"
                            rules={[{ required: true }]}
                        >
                            <TextArea rows={6} placeholder="Descreva os desafios e o dia a dia da vaga" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Requisitos" name="requirements">
                                    <TextArea rows={4} placeholder="Liste os requisitos (habilidades, experiências)" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Benefícios" name="benefits">
                                    <TextArea rows={4} placeholder="Liste os benefícios oferecidos" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item label="Tipo de Contrato" name="type" rules={[{ required: true }]}>
                                    <Select>
                                        <Option value="CLT">CLT</Option>
                                        <Option value="PJ">PJ</Option>
                                        <Option value="FREELANCER">Freelancer</Option>
                                        <Option value="ESTAGIO">Estágio</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Modalidade" name="modality" rules={[{ required: true }]}>
                                    <Select>
                                        <Option value="REMOTE">Remoto</Option>
                                        <Option value="HYBRID">Híbrido</Option>
                                        <Option value="PRESENTIAL">Presencial</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Localização" name="location">
                                    <Input placeholder="Ex: São Paulo, SP" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Salário Mensal (R$)" name="salary">
                                    <Input type="number" placeholder="Ex: 5000" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                                    <Select>
                                        <Option value="OPEN">Aberta</Option>
                                        <Option value="CLOSED">Fechada</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space>
                                <Button onClick={() => setModalVisible(false)}>Cancelar</Button>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    {editingVaga ? 'Atualizar' : 'Criar Vaga'}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* DRIVER DO FUNIL DE CANDIDATOS */}
                <Drawer
                    title={`Funil de Candidatos: ${selectedVaga?.title}`}
                    placement="right"
                    width={700}
                    onClose={() => setFunnelVisible(false)}
                    open={funnelVisible}
                >
                    <div style={{ marginBottom: 20 }}>
                        <Text type="secondary">Candidatos para a empresa {selectedVaga?.company?.name}</Text>
                    </div>

                    <Table
                        loading={loadingF}
                        dataSource={applications}
                        rowKey="id"
                        pagination={false}
                        columns={[
                            {
                                title: 'Candidato',
                                key: 'user',
                                render: (_, record) => (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar icon={<UserOutlined />} src={record.user?.avatar_url} />
                                        <div style={{ marginLeft: 12 }}>
                                            <Text strong>{record.user?.nome}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: 12 }}>{record.user?.email}</Text>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                title: 'Data',
                                dataIndex: 'applied_at',
                                render: (date) => new Date(date).toLocaleDateString('pt-BR')
                            },
                            {
                                title: 'Currículo',
                                key: 'cv',
                                render: (_, record) => (
                                    <Button
                                        type="link"
                                        icon={<FilePdfOutlined />}
                                        href={record.resume_url}
                                        target="_blank"
                                        disabled={!record.resume_url}
                                    >
                                        Ver CV
                                    </Button>
                                )
                            },
                            {
                                title: 'Estágio do Funil',
                                key: 'status',
                                render: (_, record) => (
                                    <Select
                                        value={record.status}
                                        style={{ width: 140 }}
                                        onChange={(val) => updateApplicationStatus(record.id, val)}
                                    >
                                        <Option value="APPLIED">Em Triagem</Option>
                                        <Option value="IN_REVIEW">Em Análise</Option>
                                        <Option value="INTERVIEW">Entrevista</Option>
                                        <Option value="HIRED">Contratado(a)</Option>
                                        <Option value="REJECTED">Descartado</Option>
                                    </Select>
                                )
                            }
                        ]}
                    />
                </Drawer>
            </div>
        </AdminLayout>
    );
}
