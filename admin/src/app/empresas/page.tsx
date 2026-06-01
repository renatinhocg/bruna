'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    Button,
    Space,
    Popconfirm,
    notification,
    Tag,
    Avatar
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    BankOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import apiService from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

export default function EmpresasPage() {
    const navigate = useNavigate();
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
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

    const handleDelete = async (id: number) => {
        try {
            await apiService.deleteCompany(id);
            api.success({ message: 'Empresa excluida com sucesso!', placement: 'topRight' });
            await loadEmpresas();
        } catch {
            api.error({ message: 'Erro ao excluir empresa', placement: 'topRight' });
        }
    };

    const columns = [
        {
            title: 'Empresa',
            key: 'empresa',
            render: (record: any) => (
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
                        <div style={{ color: '#666', fontSize: 12 }}>CNPJ: {record.cnpj || 'Nao informado'}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Unidades',
            dataIndex: 'locations',
            key: 'locations',
            render: (companyLocations: any) => (
                <Tag icon={<EnvironmentOutlined />}>
                    {companyLocations?.length || 0} unidade{(companyLocations?.length || 0) !== 1 ? 's' : ''}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: any) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                    {status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                </Tag>
            )
        },
        {
            title: 'Criada em',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: any) => new Date(date).toLocaleDateString('pt-BR')
        },
        {
            title: 'Acoes',
            key: 'acoes',
            render: (record: any) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => navigate(`/empresas/${record.id}`)}
                    />
                    <Popconfirm
                        title="Tem certeza que deseja excluir esta empresa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sim"
                        cancelText="Nao"
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
                    <h2>Gestao de Empresas ({empresas.length})</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/empresas/cadastro')}
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
            </div>
        </AdminLayout>
    );
}
