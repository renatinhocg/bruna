import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Spin, message, Layout, Modal, Form, Input, Upload, Divider } from 'antd';
import { BankOutlined, EnvironmentOutlined, DollarOutlined, UploadOutlined, ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Header, Content } = Layout;
const { TextArea } = Input;

const VagaDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vaga, setVaga] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applyModalVisible, setApplyModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

    useEffect(() => {
        fetchVagaDetails();
    }, [id]);

    const fetchVagaDetails = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/jobs/${id}`);
            setVaga(res.data);
        } catch (error) {
            console.error('Erro ao buscar detalhes da vaga:', error);
            message.error('Vaga não encontrada.');
            navigate('/vagas');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (values) => {
        // Verificar autenticação
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');

        // Se não estiver logado, redirecionar para o login
        if (!token || !userString) {
            message.info('Você precisa fazer login ou se cadastrar para se candidatar.');
            // Opcional: salvar intenção de candidatura para redirecionar depois
            localStorage.setItem('intended_job_apply', id);
            navigate('/login');
            return;
        }

        if (fileList.length === 0) {
            return message.error('Por favor, anexe o seu currículo em PDF.');
        }

        try {
            setSubmitting(true);
            const user = JSON.parse(userString);
            const formData = new FormData();
            formData.append('resume', fileList[0].originFileObj);

            // 1. Upload do Currículo
            const uploadRes = await axios.post(`${API_URL}/api/arquivos/resume`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            const resumeUrl = uploadRes.data.url;

            // 2. Criar Candidatura
            await axios.post(`${API_URL}/api/job-applications/apply`, {
                job_id: id,
                user_id: user.id,
                cover_letter: values.cover_letter,
                resume_url: resumeUrl
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            message.success('Candidatura enviada com sucesso! Boa sorte!');
            setApplyModalVisible(false);
            form.resetFields();
            setFileList([]);
            navigate('/cliente'); // Redireciona para o painel do candidato

        } catch (error) {
            console.error('Erro ao enviar candidatura:', error);
            if (error.response?.data?.error) {
                message.warning(error.response.data.error);
                if (error.response.data.error.includes('já se candidatou')) {
                    setApplyModalVisible(false);
                }
            } else {
                message.error('Erro ao enviar candidatura. Tente novamente.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList.slice(-1)); // Aceitar apenas 1 arquivo
    };

    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Spin size="large" />
                </div>
            </Layout>
        );
    }

    if (!vaga) return null;

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Header style={{ background: '#fff', padding: '0 20px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/vagas')} style={{ marginRight: 16 }}>
                    Voltar às Vagas
                </Button>
            </Header>

            <Content style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={16}>
                        <Card style={{ borderRadius: 8, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Title level={2}>{vaga.title}</Title>
                            <div style={{ marginBottom: 24 }}>
                                <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                                    <BankOutlined style={{ marginRight: 8 }} />{vaga.company?.name}
                                </Text>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>{vaga.type}</Tag>
                                    <Tag color={vaga.modality === 'REMOTE' ? 'green' : vaga.modality === 'HYBRID' ? 'orange' : 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
                                        {vaga.modality === 'REMOTE' ? 'Remoto' : vaga.modality === 'HYBRID' ? 'Híbrido' : 'Presencial'}
                                    </Tag>
                                    <Tag icon={<EnvironmentOutlined />} style={{ fontSize: 14, padding: '4px 12px', background: '#f5f5f5', border: '1px solid #d9d9d9' }}>
                                        {vaga.location || 'Local não informado'}
                                    </Tag>
                                    {vaga.salary && (
                                        <Tag icon={<DollarOutlined />} color="success" style={{ fontSize: 14, padding: '4px 12px' }}>
                                            R$ {Number(vaga.salary).toLocaleString('pt-BR')}
                                        </Tag>
                                    )}
                                </div>
                            </div>

                            <Divider />

                            <Title level={4}>Descrição da Vaga</Title>
                            <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.8 }}>
                                {vaga.description}
                            </Paragraph>

                            {vaga.requirements && (
                                <>
                                    <Title level={4} style={{ marginTop: 32 }}>Requisitos</Title>
                                    <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.8 }}>
                                        {vaga.requirements}
                                    </Paragraph>
                                </>
                            )}

                            {vaga.benefits && (
                                <>
                                    <Title level={4} style={{ marginTop: 32 }}>Benefícios</Title>
                                    <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.8 }}>
                                        {vaga.benefits}
                                    </Paragraph>
                                </>
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card style={{ borderRadius: 8, position: 'sticky', top: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Title level={4} style={{ marginBottom: 20 }}>Empresa</Title>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                {vaga.company?.logo_url ? (
                                    <img src={vaga.company.logo_url} alt={vaga.company.name} style={{ maxWidth: 120, maxHeight: 120, objectFit: 'contain', marginBottom: 16 }} />
                                ) : (
                                    <div style={{ width: 80, height: 80, background: '#f0f2f5', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BankOutlined style={{ fontSize: 32, color: '#bfbfbf' }} />
                                    </div>
                                )}
                                <Title level={5}>{vaga.company?.name}</Title>
                            </div>

                            {vaga.company?.description && (
                                <Paragraph ellipsis={{ rows: 4 }} style={{ color: '#595959', fontSize: 13 }}>
                                    {vaga.company.description}
                                </Paragraph>
                            )}

                            <Divider />

                            <Button
                                type="primary"
                                size="large"
                                block
                                style={{ height: 50, fontSize: 16, fontWeight: 'bold' }}
                                onClick={() => setApplyModalVisible(true)}
                            >
                                Candidatar-se a esta vaga
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Content>

            <Modal
                title={
                    <div>
                        <Title level={4} style={{ margin: 0 }}>Candidatura para {vaga.title}</Title>
                        <Text type="secondary">{vaga.company?.name}</Text>
                    </div>
                }
                open={applyModalVisible}
                onCancel={() => !submitting && setApplyModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 8, marginBottom: 24, display: 'flex', gap: 12 }}>
                    <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 20, marginTop: 2 }} />
                    <Text>Para finalizarmos a sua candidatura, anexe o seu currículo mais atualizado. Você poderá ajustar seu perfil completo na sua área logada depois.</Text>
                </div>

                <Form form={form} layout="vertical" onFinish={handleApply}>
                    <Form.Item
                        name="resume"
                        label={<Text strong>Anexar Currículo (PDF)</Text>}
                        rules={[{ required: true, message: 'O arquivo do currículo é obrigatório' }]}
                    >
                        <Upload
                            beforeUpload={() => false}
                            fileList={fileList}
                            onChange={handleFileChange}
                            accept=".pdf"
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />} size="large" block style={{ height: 60, borderStyle: 'dashed' }}>
                                Selecionar arquivo PDF
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="cover_letter"
                        label={<Text strong>Carta de Apresentação (Opcional)</Text>}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Fale um pouco sobre você e por que você se encaixa nessa vaga..."
                            maxLength={1000}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
                            {submitting ? 'Enviando Candidatura...' : 'Enviar Candidatura'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default VagaDetails;
