'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Typography, Space, Button, notification } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import apiService from '../../../services/api';
import AdminLayout from '../../../components/AdminLayout';
import EmpresaForm from '../EmpresaForm';

const { Title, Text } = Typography;

export default function EmpresasCadastroPage() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState<any>(null);
    const [logoPreview, setLogoPreview] = useState<any>(null);
    const [api, contextHolder] = notification.useNotification();

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
            let finalLogoUrl = null;

            if (logoFile) {
                finalLogoUrl = await uploadLogoFallback(logoFile);
            }

            await apiService.createCompany({
                ...values,
                logo_url: finalLogoUrl
            });

            api.success({ message: 'Empresa criada com sucesso!', placement: 'topRight' });
            navigate('/empresas');
        } catch {
            api.error({ message: 'Erro ao salvar empresa', placement: 'topRight' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            {contextHolder}
            <div>
                <Space direction="vertical" size={20} style={{ width: '100%' }}>
                    <div>
                        <Button
                            type="link"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/empresas')}
                            style={{ paddingLeft: 0 }}
                        >
                            Voltar para empresas
                        </Button>
                        <Title level={2} style={{ margin: 0 }}>
                            Nova Empresa
                        </Title>
                        <Text type="secondary">
                            Cadastre a empresa em uma pagina dedicada. As unidades podem ser adicionadas depois da criacao.
                        </Text>
                    </div>

                    <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <PlusOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                        <Text strong>Informacoes basicas da empresa</Text>
                    </div>

                    <EmpresaForm
                        form={form}
                        loading={loading}
                        logoPreview={logoPreview}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/empresas')}
                        onLogoChange={handleLogoChange}
                        onRemoveLogo={() => {
                            setLogoFile(null);
                            setLogoPreview(null);
                        }}
                        submitLabel="Criar empresa"
                    />
                </Space>
            </div>
        </AdminLayout>
    );
}
