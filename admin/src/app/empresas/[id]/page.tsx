'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Tabs,
    Form,
    Input,
    Button,
    Space,
    Popconfirm,
    notification,
    Row,
    Col,
    Spin,
    Empty,
    Table,
    Typography,
    Modal
} from 'antd';
import {
    ArrowLeftOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined
} from '@ant-design/icons';
import apiService from '../../../services/api';
import AdminLayout from '../../../components/AdminLayout';
import EmpresaForm from '../EmpresaForm';

const { Title, Text } = Typography;

export default function EmpresaDetalhePage() {
    const navigate = useNavigate();
    const params = useParams();
    const companyId = Number(params.id);

    const [form] = Form.useForm();
    const [locationForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [fetchingCEP, setFetchingCEP] = useState(false);
    const [logoFile, setLogoFile] = useState<any>(null);
    const [logoPreview, setLogoPreview] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const [editingLocation, setEditingLocation] = useState<any>(null);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('dados');
    const [api, contextHolder] = notification.useNotification();

    const loadCompany = useCallback(async () => {
        setLoadingPage(true);
        try {
            const data = await apiService.getCompanyById(companyId);
            setCompany(data);
            form.setFieldsValue(data);
            setLogoPreview(data.logo_url || null);
        } catch (error) {
            console.error('Erro ao carregar empresa:', error);
            api.error({ message: 'Erro ao carregar empresa', placement: 'topRight' });
            navigate('/empresas');
        } finally {
            setLoadingPage(false);
        }
    }, [api, companyId, form, navigate]);

    const loadLocations = useCallback(async () => {
        setLoadingLocations(true);
        try {
            const data = await apiService.getLocationsByCompany(companyId);
            setLocations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao carregar unidades:', error);
            setLocations([]);
        } finally {
            setLoadingLocations(false);
        }
    }, [companyId]);

    useEffect(() => {
        if (!Number.isFinite(companyId)) {
            navigate('/empresas');
            return;
        }

        loadCompany();
        loadLocations();
    }, [companyId, loadCompany, loadLocations, navigate]);

    const uploadLogoFallback = async (file: any) => {
        const formData = new FormData();
        formData.append('image', file);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/api/arquivos/link-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Falha no upload da logo');
        }

        const data = await response.json();
        return data.url;
    };

    const handleLogoChange = (info: any) => {
        const { file } = info;
        const isImage = file.type?.startsWith('image/');
        if (!isImage) {
            api.error({ message: 'Apenas imagens!', placement: 'topRight' });
            return;
        }

        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (e: any) => setLogoPreview(e.target?.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            let finalLogoUrl = company?.logo_url || null;

            if (logoFile) {
                finalLogoUrl = await uploadLogoFallback(logoFile);
            }

            const payload = {
                ...values,
                logo_url: finalLogoUrl
            };

            await apiService.updateCompany(companyId, payload);
            api.success({ message: 'Empresa atualizada com sucesso!', placement: 'topRight' });
            setCompany((prev: any) => ({ ...prev, ...payload }));
            setLogoFile(null);
            await loadCompany();
        } catch {
            api.error({ message: 'Erro ao salvar empresa', placement: 'topRight' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddLocation = () => {
        setEditingLocation(null);
        locationForm.resetFields();
        setLocationModalVisible(true);
    };

    const handleEditLocation = (location: any) => {
        setEditingLocation(location);
        locationForm.setFieldsValue(location);
        setLocationModalVisible(true);
    };

    const handleDeleteLocation = async (locationId: number) => {
        try {
            await apiService.deleteLocation(locationId);
            api.success({ message: 'Unidade excluida com sucesso!', placement: 'topRight' });
            await loadLocations();
        } catch {
            api.error({ message: 'Erro ao excluir unidade', placement: 'topRight' });
        }
    };

    const handleFetchCEP = async () => {
        const cep = locationForm.getFieldValue('postal_code');
        if (!cep) {
            api.error({ message: 'Digite um CEP', placement: 'topRight' });
            return;
        }

        setFetchingCEP(true);
        try {
            const data = await apiService.fetchAddressByCEP(cep);
            locationForm.setFieldsValue({
                address: data.logradouro || '',
                city: data.localidade || '',
                state: data.uf || ''
            });
            api.success({ message: 'CEP encontrado!', placement: 'topRight' });
        } catch (error: any) {
            api.error({ message: error.message || 'CEP nao encontrado', placement: 'topRight' });
        } finally {
            setFetchingCEP(false);
        }
    };

    const handleSubmitLocation = async (values: any) => {
        setLoadingLocations(true);
        try {
            const payload = {
                ...values,
                company_id: companyId
            };

            if (editingLocation) {
                await apiService.updateLocation(editingLocation.id, payload);
                api.success({ message: 'Unidade atualizada com sucesso!', placement: 'topRight' });
            } else {
                await apiService.createLocation(payload);
                api.success({ message: 'Unidade criada com sucesso!', placement: 'topRight' });
            }

            setLocationModalVisible(false);
            setEditingLocation(null);
            locationForm.resetFields();
            await loadLocations();
        } catch (error: any) {
            api.error({
                message: 'Erro ao salvar unidade',
                description: error.message,
                placement: 'topRight'
            });
        } finally {
            setLoadingLocations(false);
        }
    };

    const locationColumns = [
        {
            title: 'Unidade',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        {
            title: 'Cidade',
            dataIndex: 'city',
            key: 'city'
        },
        {
            title: 'Estado',
            dataIndex: 'state',
            key: 'state',
            width: 80
        },
        {
            title: 'CEP',
            dataIndex: 'postal_code',
            key: 'postal_code',
            width: 120
        },
        {
            title: 'Acoes',
            key: 'acoes',
            width: 120,
            render: (record: any) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditLocation(record)}
                    />
                    <Popconfirm
                        title="Excluir unidade?"
                        description="Tem certeza que deseja excluir esta unidade?"
                        onConfirm={() => handleDeleteLocation(record.id)}
                        okText="Sim"
                        cancelText="Nao"
                    >
                        <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    if (loadingPage) {
        return (
            <AdminLayout>
                {contextHolder}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <Spin size="large" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {contextHolder}
            <div>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/empresas')}
                    style={{ paddingLeft: 0, marginBottom: 8 }}
                >
                    Voltar para empresas
                </Button>

                <Space direction="vertical" size={20} style={{ width: '100%' }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>
                            Editar Empresa
                        </Title>
                        <Text type="secondary">
                            Atualize os dados da empresa e gerencie as unidades em uma pagina dedicada.
                        </Text>
                    </div>

                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: 'dados',
                                label: 'Informacoes Basicas',
                                children: (
                                    <EmpresaForm
                                        form={form}
                                        loading={loading}
                                        logoPreview={logoPreview}
                                        onSubmit={handleSubmit}
                                        onCancel={() => navigate('/empresas')}
                                        onLogoChange={handleLogoChange}
                                        onRemoveLogo={() => {
                                            setLogoPreview(null);
                                            setLogoFile(null);
                                        }}
                                        submitLabel="Salvar alteracoes"
                                    />
                                )
                            },
                            {
                                key: 'unidades',
                                label: `Unidades/Lojas (${locations.length})`,
                                children: (
                                    <div style={{ marginTop: 8 }}>
                                        {loadingLocations ? (
                                            <Spin style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }} />
                                        ) : locations.length === 0 ? (
                                            <Empty description="Nenhuma unidade cadastrada" style={{ marginTop: 32 }} />
                                        ) : (
                                            <Table
                                                columns={locationColumns}
                                                dataSource={locations}
                                                rowKey="id"
                                                pagination={{ pageSize: 5 }}
                                                size="small"
                                                style={{ marginBottom: 24 }}
                                            />
                                        )}

                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={handleAddLocation}
                                        >
                                            Adicionar Unidade
                                        </Button>
                                    </div>
                                )
                            }
                        ]}
                    />
                </Space>

                <Modal
                    title={editingLocation ? 'Editar Unidade' : 'Adicionar Unidade'}
                    open={locationModalVisible}
                    onCancel={() => {
                        setLocationModalVisible(false);
                        setEditingLocation(null);
                        locationForm.resetFields();
                    }}
                    footer={null}
                    width={600}
                >
                    <Form
                        form={locationForm}
                        layout="vertical"
                        onFinish={handleSubmitLocation}
                        size="large"
                    >
                        <Form.Item
                            label="Nome da Unidade/Loja"
                            name="name"
                            rules={[{ required: true, message: 'Nome da unidade e obrigatorio' }]}
                        >
                            <Input placeholder="Ex: Filial Sao Paulo, Loja Centro, Matriz" />
                        </Form.Item>

                        <Form.Item
                            label="CEP"
                            name="postal_code"
                            rules={[{ required: true, message: 'CEP e obrigatorio' }]}
                        >
                            <Input
                                placeholder="00000-000"
                                maxLength={9}
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, '');
                                    if (value.length === 8) {
                                        value = value.slice(0, 5) + '-' + value.slice(5);
                                    }
                                    locationForm.setFieldValue('postal_code', value);
                                }}
                                addonAfter={
                                    <Button
                                        type="text"
                                        icon={<SearchOutlined />}
                                        loading={fetchingCEP}
                                        onClick={handleFetchCEP}
                                        title="Buscar CEP"
                                    />
                                }
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Endereco"
                                    name="address"
                                    rules={[{ required: true, message: 'Endereco e obrigatorio' }]}
                                >
                                    <Input placeholder="Rua, Avenida, etc" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Cidade"
                                    name="city"
                                    rules={[{ required: true, message: 'Cidade e obrigatoria' }]}
                                >
                                    <Input placeholder="Ex: Sao Paulo" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} sm={8}>
                                <Form.Item
                                    label="Estado (UF)"
                                    name="state"
                                    rules={[{ required: true, message: 'Estado e obrigatorio' }]}
                                >
                                    <Input placeholder="SP" maxLength={2} style={{ textTransform: 'uppercase' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={16}>
                                <Form.Item
                                    label="Numero/Complemento"
                                    name="address_number"
                                >
                                    <Input placeholder="Ex: 123 - Apt 42" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setLocationModalVisible(false);
                                        setEditingLocation(null);
                                        locationForm.resetFields();
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button type="primary" htmlType="submit" loading={loadingLocations}>
                                    {editingLocation ? 'Atualizar' : 'Adicionar'}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </AdminLayout>
    );
}
