import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Input, Select, Spin, message, Layout } from 'antd';
import { SearchOutlined, EnvironmentOutlined, BankOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Header, Content } = Layout;

const VagasList = () => {
    const [vagas, setVagas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

    useEffect(() => {
        fetchVagas();
    }, []);

    const fetchVagas = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/jobs?status=OPEN`);
            setVagas(res.data);
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
            message.error('Não foi possível carregar as vagas no momento.');
        } finally {
            setLoading(false);
        }
    };

    const filteredVagas = vagas.filter(vaga => {
        const matchesSearch = vaga.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vaga.company?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || vaga.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Header style={{ background: '#fff', padding: '0 20px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>Portal de Vagas</Title>
            </Header>

            <Content style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Title level={2}>Encontre a oportunidade ideal para sua carreira</Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>Explore vagas abertas em nossas empresas parceiras e candidate-se hoje mesmo.</Text>
                </div>

                <Card style={{ marginBottom: 30, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Row gutter={16}>
                        <Col xs={24} md={16} style={{ marginBottom: { xs: 16, md: 0 } }}>
                            <Input
                                size="large"
                                placeholder="Busque por cargo, palavra-chave ou empresa..."
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <Select
                                size="large"
                                style={{ width: '100%' }}
                                value={filterType}
                                onChange={setFilterType}
                            >
                                <Option value="ALL">Todos os tipos</Option>
                                <Option value="CLT">CLT</Option>
                                <Option value="PJ">PJ</Option>
                                <Option value="FREELANCER">Freelancer</Option>
                                <Option value="ESTAGIO">Estágio</Option>
                            </Select>
                        </Col>
                    </Row>
                </Card>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin size="large" />
                    </div>
                ) : filteredVagas.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Text type="secondary" style={{ fontSize: 16 }}>Nenhuma vaga encontrada com os filtros atuais.</Text>
                    </Card>
                ) : (
                    <Row gutter={[24, 24]}>
                        {filteredVagas.map(vaga => (
                            <Col xs={24} sm={12} lg={8} key={vaga.id}>
                                <Card
                                    hoverable
                                    style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 8 }}
                                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                                    onClick={() => navigate(`/vagas/${vaga.id}`)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div>
                                            <Title level={4} style={{ margin: 0 }}>{vaga.title}</Title>
                                            <Text type="secondary"><BankOutlined style={{ marginRight: 6 }} />{vaga.company?.name}</Text>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <Tag color="blue">{vaga.type}</Tag>
                                        <Tag color={vaga.modality === 'REMOTE' ? 'green' : vaga.modality === 'HYBRID' ? 'orange' : 'default'}>
                                            {vaga.modality === 'REMOTE' ? 'Remoto' : vaga.modality === 'HYBRID' ? 'Híbrido' : 'Presencial'}
                                        </Tag>
                                    </div>

                                    <Paragraph ellipsis={{ rows: 3 }} style={{ flex: 1, color: '#595959' }}>
                                        {vaga.description}
                                    </Paragraph>

                                    <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                                            {vaga.location || 'Não informado'}
                                        </Text>
                                        {vaga.salary && (
                                            <Text strong style={{ color: '#52c41a' }}>
                                                <DollarOutlined style={{ marginRight: 4 }} />
                                                R$ {Number(vaga.salary).toLocaleString('pt-BR')}
                                            </Text>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Content>
        </Layout>
    );
};

export default VagasList;
