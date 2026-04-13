'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Button,
    Modal,
    Tag,
    Space,
    notification,
    Row,
    Col,
    Input,
    Drawer,
    Typography,
    Avatar,
    Divider,
    Card
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    FilePdfOutlined,
    LinkedinOutlined,
    GlobalOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import apiService from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const { Title, Text, Paragraph } = Typography;

export default function BancoTalentosPage() {
    const [candidatos, setCandidatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Drawer de Detalhes do Candidato
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const [api, contextHolder] = notification.useNotification();

    const loadCandidatos = useCallback(async () => {
        setLoading(true);
        try {
            // Idealmente a API de usuários traria um filtro para role = 'CANDIDATE' ou todos
            // Como não criamos um filtro específico na rota atual, trazemos todos os clientes e filtramos
            const data = await apiService.getUsers();
            // Mostramos apenas usuarios do tipo 'cliente' que já tem perfil ou se candidataram (ou mostramos todos)
            const clients = data.filter(u => u.tipo !== 'admin');
            setCandidatos(clients);
        } catch (error) {
            console.error('Erro ao carregar banco de talentos:', error);
            api.error({ message: 'Erro ao carregar banco de talentos', placement: 'topRight' });
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        loadCandidatos();
    }, [loadCandidatos]);

    const viewCandidate = (candidate) => {
        setSelectedCandidate(candidate);
        setDrawerVisible(true);
    };

    const filteredCandidatos = candidatos.filter(c =>
        c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.profissao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Candidato',
            key: 'candidato',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={record.avatar_url} style={{ marginRight: 12 }}>
                        {!record.avatar_url && record.nome?.charAt(0)}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.nome}</div>
                        <div style={{ color: '#666', fontSize: 12 }}>{record.email}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Profissão/Experiência',
            key: 'profissional',
            render: (_, record) => (
                <div>
                    <div>{record.profissao || <Text type="secondary">N/A</Text>}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.experiencia || 'Não informada'}</Text>
                </div>
            )
        },
        {
            title: 'Contato',
            dataIndex: 'telefone',
            key: 'telefone',
            render: (tel) => tel || '-'
        },
        {
            title: 'Documentos',
            key: 'docs',
            render: (_, record) => (
                <Space>
                    {record.curriculo_url ? (
                        <Button
                            icon={<FilePdfOutlined />}
                            size="small"
                            href={record.curriculo_url}
                            target="_blank"
                        >
                            CV
                        </Button>
                    ) : (
                        <Tag color="default">Sem CV</Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'Detalhes',
            key: 'acoes',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => viewCandidate(record)}
                >
                    Ver Perfil
                </Button>
            )
        }
    ];

    return (
        <AdminLayout>
            {contextHolder}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2>Banco de Talentos ({filteredCandidatos.length})</h2>
                    <Input
                        placeholder="Buscar por nome, email ou profissão..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredCandidatos}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />

                <Drawer
                    title="Perfil Completo do Candidato"
                    placement="right"
                    width={600}
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                >
                    {selectedCandidate && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <Avatar size={100} src={selectedCandidate.avatar_url} style={{ marginBottom: 16 }}>
                                    {!selectedCandidate.avatar_url && selectedCandidate.nome?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Title level={3} style={{ margin: 0 }}>{selectedCandidate.nome}</Title>
                                <Text type="secondary" style={{ fontSize: 16 }}>{selectedCandidate.profissao || 'Profissão não informada'}</Text>
                            </div>

                            <Row gutter={16} style={{ marginBottom: 24 }}>
                                <Col span={12}>
                                    <Card size="small" title="Contato">
                                        <p><strong>Email:</strong> {selectedCandidate.email}</p>
                                        <p><strong>Telefone:</strong> {selectedCandidate.telefone || '-'}</p>
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card size="small" title="Links Úteis">
                                        <p>
                                            <LinkedinOutlined style={{ color: '#0077b5', marginRight: 8 }} />
                                            {selectedCandidate.linkedin_url ? <a href={selectedCandidate.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a> : '-'}
                                        </p>
                                        <p>
                                            <GlobalOutlined style={{ marginRight: 8 }} />
                                            {selectedCandidate.portfolio_url ? <a href={selectedCandidate.portfolio_url} target="_blank" rel="noreferrer">Portfólio</a> : '-'}
                                        </p>
                                        <p>
                                            <FilePdfOutlined style={{ color: 'red', marginRight: 8 }} />
                                            {selectedCandidate.curriculo_url ? <a href={selectedCandidate.curriculo_url} target="_blank" rel="noreferrer">Baixar CV</a> : '-'}
                                        </p>
                                    </Card>
                                </Col>
                            </Row>

                            {selectedCandidate.resumo_profissional && (
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={5}>Resumo Profissional</Title>
                                    <Paragraph style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
                                        {selectedCandidate.resumo_profissional}
                                    </Paragraph>
                                </div>
                            )}

                            {selectedCandidate.experiencia && (
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={5}>Experiência Informada</Title>
                                    <Paragraph>
                                        {selectedCandidate.experiencia}
                                    </Paragraph>
                                </div>
                            )}

                            <Divider />

                            <Title level={5}>
                                <BarChartOutlined style={{ marginRight: 8 }} />
                                Resultados de Testes (Se aplicável)
                            </Title>
                            <Text type="secondary">
                                Para acessar os relatórios completos DISC ou Dominância Cerebral, verifique os menus dedicados a tais testes procurando por "{selectedCandidate.nome}".
                            </Text>
                        </div>
                    )}
                </Drawer>
            </div>
        </AdminLayout>
    );
}
