'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    Button,
    Select,
    Space,
    Popconfirm,
    notification,
    Tag,
    Row,
    Col,
    Drawer,
    Typography,
    Avatar
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FilePdfOutlined,
    UserOutlined,
    TeamOutlined
} from '@ant-design/icons';
import apiService from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const { Option } = Select;
const { Text } = Typography;

export default function VagasPage() {
    const [vagas, setVagas] = useState<any[]>([]);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // States para o Funil de Candidatos
    const [funnelVisible, setFunnelVisible] = useState(false);
    const [selectedVaga, setSelectedVaga] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
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

    const handleAdd = () => navigate('/vagas/cadastro');

    const toSlug = (s: string) => {
        return String(s || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleEdit = (vaga: any) => {
        const slug = vaga.slug || toSlug(vaga.title || vaga.nome || vaga.id);
        navigate(`/vagas/${encodeURIComponent(slug)}`);
    };

    const handleDelete = async (id: number | string) => {
        try {
            await apiService.deleteJob(id);
            api.success({ message: 'Vaga excluída com sucesso!', placement: 'topRight' });
            await loadData();
        } catch (error) {
            console.error('Erro ao excluir vaga:', error);
            api.error({ message: 'Erro ao excluir vaga', placement: 'topRight' });
        }
    };

    // criação/edição agora em rota dedicada `/vagas/cadastro`

    const openFunnel = async (vaga: any) => {
        setSelectedVaga(vaga);
        setFunnelVisible(true);
        setLoadingF(true);
        try {
            const data = await apiService.getJobApplications(vaga.id);
            setApplications(data);
        } catch {
            api.error({ message: 'Erro ao carregar candidatos', placement: 'topRight' });
        } finally {
            setLoadingF(false);
        }
    };

    const updateApplicationStatus = async (appId: number | string, newStatus: string) => {
        try {
            await apiService.updateJobApplicationStatus(appId, newStatus);
            api.success({ message: 'Status atualizado', placement: 'topRight' });
            // Reload applications for current job
            const data = await apiService.getJobApplications(selectedVaga.id);
            setApplications(data);
        } catch {
            api.error({ message: 'Falha ao atualizar status', placement: 'topRight' });
        }
    };

    const columns = [
        {
            title: 'Vaga',
            dataIndex: 'title',
            key: 'title',
            render: (text: any, record: any) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{record.company?.name}</div>
                </div>
            )
        },
        {
            title: 'Tipo/Modalidade',
            key: 'tipo',
            render: (_: any, record: any) => (
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
            render: (_: any, record: any) => (
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
            render: (status: any) => (
                <Tag color={status === 'OPEN' ? 'green' : 'red'}>
                    {status === 'OPEN' ? 'Aberta' : 'Fechada'}
                </Tag>
            )
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (record: any) => (
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

                {/* Cadastro/edição agora em /vagas/cadastro */}

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
