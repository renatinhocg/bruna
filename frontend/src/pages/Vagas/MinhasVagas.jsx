import React, { useState, useEffect } from 'react';
import { Typography, Card, Table, Tag, Button, Spin, message } from 'antd';
import { EyeOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;

const statusMap = {
    APPLIED: { color: 'blue', text: 'Inscrito' },
    IN_REVIEW: { color: 'orange', text: 'Em Análise' },
    INTERVIEW: { color: 'purple', text: 'Entrevista' },
    HIRED: { color: 'success', text: 'Contratado' },
    REJECTED: { color: 'default', text: 'Não Aprovado' },
};

const MinhasVagas = () => {
    const [candidaturas, setCandidaturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCandidaturas();
    }, [token, navigate]);

    const fetchCandidaturas = async () => {
        try {
            setLoading(true);
            // Aqui teremos que buscar na api pelo proprio user logado
            // No index a gente vai criar a rota de list que permite pegar isso pelas Applications
            const res = await axios.get(`${API_URL}/api/usuarios/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Pega as candidaturas do usuario
            if (res.data.candidaturas) {
                setCandidaturas(res.data.candidaturas);
            }
        } catch (error) {
            console.error('Erro ao buscar candidaturas:', error);
            message.error('Não foi possível carregar as candidaturas.');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Vaga',
            dataIndex: ['job', 'title'],
            key: 'title',
            render: (text, record) => (
                <div>
                    <Text strong>{record.job?.title || 'Vaga Excluída'}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.job?.company?.name}</Text>
                </div>
            )
        },
        {
            title: 'Data de Inscrição',
            dataIndex: 'applied_at',
            key: 'applied_at',
            render: (date) => moment(date).format('DD/MM/YYYY')
        },
        {
            title: 'Currículo Enviado',
            dataIndex: 'resume_url',
            key: 'resume_url',
            render: (url) => url ? (
                <Button
                    type="link"
                    icon={<FilePdfOutlined />}
                    href={url}
                    target="_blank"
                    size="small"
                >
                    Ver PDF
                </Button>
            ) : '-'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const mapped = statusMap[status] || statusMap.APPLIED;
                return <Tag color={mapped.color}>{mapped.text}</Tag>;
            }
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => (
                <Button
                    type="default"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => navigate(`/vagas/${record.job_id}`)}
                    disabled={!record.job}
                >
                    Ver Vaga
                </Button>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Minhas Vagas</Title>
                <Text type="secondary">Acompanhe o status dos processos seletivos que você está participando.</Text>
            </div>

            <Card>
                {candidaturas.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 16 }}>Você ainda não se candidatou a nenhuma vaga.</Text>
                        <br />
                        <Button type="primary" onClick={() => navigate('/vagas')} style={{ marginTop: 16 }}>
                            Explorar Vagas
                        </Button>
                    </div>
                ) : (
                    <Table
                        dataSource={candidaturas}
                        columns={columns}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: true }}
                    />
                )}
            </Card>
        </div>
    );
};

export default MinhasVagas;
