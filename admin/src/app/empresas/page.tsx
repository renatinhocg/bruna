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
    Upload,
    Avatar
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    BankOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import apiService from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const { Option } = Select;
const { TextArea } = Input;

export default function EmpresasPage() {
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingEmpresa, setEditingEmpresa] = useState(null);
    const [form] = Form.useForm();
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const router = useRouter();
    const [api, contextHolder] = notification.useNotification();

    const loadEmpresas = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiService.getCompanies();
            setEmpresas(data);
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
            api.error({ message: 'Erro ao carregar empresas', placement: 'topRight' });
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        loadEmpresas();
    }, [loadEmpresas]);

    const handleAdd = () => {
        setEditingEmpresa(null);
        form.resetFields();
        setLogoFile(null);
        setLogoPreview(null);
        setModalVisible(true);
    };

    const handleEdit = (empresa) => {
        setEditingEmpresa(empresa);
        form.setFieldsValue(empresa);
        setLogoFile(null);
        setLogoPreview(empresa.logo_url || null);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await apiService.deleteCompany(id);
            api.success({ message: 'Empresa excluída com sucesso!', placement: 'topRight' });
            await loadEmpresas();
        } catch (error) {
            console.error('Erro ao excluir empresa:', error);
            api.error({ message: 'Erro ao excluir empresa', placement: 'topRight' });
        }
    };

    const uploadLogoFallback = async (file) => {
        // Esse fallback é caso a API de criar empresa não cuide do arquivo de imagem na mesma request.
        const formData = new FormData();
        formData.append('image', file);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/api/arquivos/link-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!response.ok) throw new Error('Falha no upload da logo');
            const data = await response.json();
            return data.url;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            let finalLogoUrl = editingEmpresa?.logo_url;

            if (logoFile) {
                finalLogoUrl = await uploadLogoFallback(logoFile);
            }

            const payload = {
                ...values,
                logo_url: finalLogoUrl
            };

            if (editingEmpresa) {
                await apiService.updateCompany(editingEmpresa.id, payload);
                api.success({ message: 'Empresa atualizada com sucesso!', placement: 'topRight' });
            } else {
                await apiService.createCompany(payload);
                api.success({ message: 'Empresa criada com sucesso!', placement: 'topRight' });
            }

            setModalVisible(false);
            form.resetFields();
            setEditingEmpresa(null);
            setLogoFile(null);
            setLogoPreview(null);
            await loadEmpresas();
        } catch (error) {
            console.error('Erro ao salvar empresa:', error);
            api.error({ message: 'Erro ao salvar empresa', placement: 'topRight' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (info) => {
        const { file } = info;
        const isImage = file.type?.startsWith('image/');
        if (!isImage) {
            api.error({ message: 'Apenas imagens!', placement: 'topRight' });
            return;
        }
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const columns = [
        {
            title: 'Empresa',
            key: 'empresa',
            render: (record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        shape="square"
                        size="large"
                        src={record.logo_url}
                        icon={!record.logo_url && <BankOutlined />}
                        style={{ marginRight: 12, backgroundColor: '#f0f2f5', color: '#8c8c8c' }}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.name}</div>
                        <div style={{ color: '#666', fontSize: 12 }}>CNPJ: {record.cnpj || 'Não informado'}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                    {status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                </Tag>
            )
        },
        {
            title: 'Criada em',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleDateString('pt-BR')
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
                        title="Tem certeza que deseja excluir esta empresa?"
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

    return (
        <AdminLayout>
            {contextHolder}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2>Gestão de Empresas ({empresas.length})</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Nova Empresa
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={empresas}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />

                <Modal
                    title={editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                    width={600}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        size="large"
                        initialValues={{ status: 'ACTIVE' }}
                    >
                        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Avatar
                                shape="square"
                                size={80}
                                src={logoPreview}
                                icon={!logoPreview && <BankOutlined />}
                                style={{ backgroundColor: '#f0f2f5', color: '#8c8c8c' }}
                            />
                            <Upload
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={handleLogoChange}
                                accept="image/*"
                            >
                                <Button icon={<UploadOutlined />}>Selecionar Logo</Button>
                            </Upload>
                            {logoPreview && (
                                <Button type="link" danger onClick={() => { setLogoPreview(null); setLogoFile(null); }}>
                                    Remover
                                </Button>
                            )}
                        </div>

                        <Form.Item
                            label="Nome da Empresa"
                            name="name"
                            rules={[{ required: true, message: 'O nome é obrigatório' }]}
                        >
                            <Input placeholder="Ex: Tech Solutions Ltda" />
                        </Form.Item>

                        <Form.Item
                            label="CNPJ"
                            name="cnpj"
                        >
                            <Input placeholder="00.000.000/0000-00" />
                        </Form.Item>

                        <Form.Item
                            label="Descrição"
                            name="description"
                        >
                            <TextArea rows={4} placeholder="Breve descrição da empresa" />
                        </Form.Item>

                        <Form.Item
                            label="Status"
                            name="status"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Option value="ACTIVE">Ativa</Option>
                                <Option value="INACTIVE">Inativa</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space>
                                <Button onClick={() => setModalVisible(false)}>Cancelar</Button>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    {editingEmpresa ? 'Atualizar' : 'Criar'}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </AdminLayout>
    );
}
