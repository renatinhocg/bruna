'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Form,
    Input,
    Select,
    Button,
    Space,
    Row,
    Col,
    Typography,
    notification,
    Spin,
    Divider,
    DatePicker,
    Checkbox,
    InputNumber,
    Tag
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    ProjectOutlined,
    DollarOutlined,
    FileTextOutlined,
    CalendarOutlined,
    AuditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiService from '../../../services/api';
import AdminLayout from '../../../components/AdminLayout';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function VagasCadastroPage() {
    const navigate = useNavigate();
    const params = useParams();
    const vagaNome = params.nome as string | undefined;

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [locaisPorEmpresa, setLocaisPorEmpresa] = useState<Record<number, any[]>>({});
    const [loadedVaga, setLoadedVaga] = useState<any>(null);
    const [api, contextHolder] = notification.useNotification();
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

    const SELECTION_STAGES = [
        'Entrevista Inicial',
        'Teste Técnico',
        'Dinâmica em Grupo',
        'Entrevista com Gestor',
        'Análise de Projeto',
        'Case Study',
        'Proposta Salarial',
    ];

    // Carregar empresas e locais
    const loadInitialData = useCallback(async () => {
        setPageLoading(true);
        try {
            const empresasData = await apiService.getCompanies();
            setEmpresas(empresasData);

            // Carregar locais para cada empresa
            const locaisData = await fetch('http://localhost:8002/api/locations').then(r => r.json());
            const locaisPorEmpresaMap: Record<number, any[]> = {};
            locaisData.forEach((local: any) => {
                if (!locaisPorEmpresaMap[local.company_id]) {
                    locaisPorEmpresaMap[local.company_id] = [];
                }
                locaisPorEmpresaMap[local.company_id].push(local);
            });
            setLocaisPorEmpresa(locaisPorEmpresaMap);

            if (vagaNome) {
                // Tenta buscar vaga por slug/slugified title
                const all = await apiService.getJobs();
                const toSlug = (s: string) =>
                    String(s || '')
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/\p{Diacritic}/gu, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');

                const vagaData = all.find((v: any) => (v.slug && v.slug === vagaNome) || toSlug(v.title || v.nome) === vagaNome);
                if (vagaData) {
                    setLoadedVaga(vagaData);
                    setSelectedCompanyId(vagaData.company_id);
                    
                    const formData = {
                        title: vagaData.title,
                        company_id: vagaData.company_id,
                        location_id: vagaData.location_id,
                        type: vagaData.type,
                        modality: vagaData.modality,
                        description: vagaData.description,
                        requirements: vagaData.requirements,
                        benefits: vagaData.benefits,
                        salary_min: vagaData.salary_min ? parseFloat(vagaData.salary_min) : null,
                        salary_max: vagaData.salary_max ? parseFloat(vagaData.salary_max) : null,
                        status: vagaData.status,
                        start_date: vagaData.start_date ? dayjs(vagaData.start_date) : null,
                        end_date: vagaData.end_date ? dayjs(vagaData.end_date) : null,
                        selection_stages: vagaData.selection_stages || [],
                        accessibility_note: vagaData.accessibility_note,
                    };
                    form.setFieldsValue(formData);
                } else {
                    api.error({ message: 'Vaga não encontrada', placement: 'topRight' });
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            api.error({
                message: 'Erro ao carregar informações',
                description: 'Não foi possível carregar as informações necessárias.',
                placement: 'topRight'
            });
        } finally {
            setPageLoading(false);
        }
    }, [vagaNome, form, api]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                title: values.title,
                company_id: values.company_id,
                location_id: values.location_id,
                type: values.type,
                modality: values.modality,
                description: values.description,
                requirements: values.requirements,
                benefits: values.benefits,
                salary_min: values.salary_min,
                salary_max: values.salary_max,
                status: values.status,
                start_date: values.start_date ? values.start_date.toISOString() : null,
                end_date: values.end_date ? values.end_date.toISOString() : null,
                selection_stages: values.selection_stages || [],
                accessibility_note: values.accessibility_note,
            };

            if (loadedVaga && loadedVaga.id) {
                await apiService.updateJob(loadedVaga.id, payload);
                api.success({
                    message: 'Sucesso!',
                    description: 'Vaga atualizada com sucesso.',
                    placement: 'topRight'
                });
            } else {
                await apiService.createJob(payload);
                api.success({
                    message: 'Sucesso!',
                    description: 'Vaga criada com sucesso.',
                    placement: 'topRight'
                });
            }
            setTimeout(() => navigate('/vagas'), 1000);
        } catch (error: any) {
            console.error('Erro ao salvar vaga:', error);
            api.error({
                message: 'Erro ao salvar vaga',
                description: error.message || 'Verifique os dados preenchidos e tente novamente.',
                placement: 'topRight'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            {contextHolder}
            <div style={{ width: '100%', padding: '12px 24px 24px 24px' }}>
                {/* Cabeçalho de Navegação com Botão Voltar */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    <Button 
                        type="text" 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/vagas')}
                        style={{ marginRight: 16, display: 'flex', alignItems: 'center' }}
                    >
                        Voltar para a lista
                    </Button>
                </div>

                {pageLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                        <Spin size="large" tip="Carregando formulário..." />
                    </div>
                ) : (
                    <div>
                        <div style={{ marginBottom: 32 }}>
                            <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
                                {loadedVaga ? 'Editar Oportunidade' : 'Cadastrar Nova Vaga'}
                            </Title>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                {loadedVaga
                                    ? 'Atualize os detalhes, requisitos e status da oportunidade selecionada.'
                                    : 'Preencha os dados abaixo para publicar uma nova vaga no painel de carreiras.'}
                            </Text>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            size="large"
                            initialValues={{ status: 'OPEN', type: 'CLT', modality: 'REMOTE' }}
                        >
                            {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
                            <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                                <Space style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                                    <ProjectOutlined style={{ fontSize: 18, color: '#4f46e5' }} />
                                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                                        Informações Básicas da Vaga
                                    </span>
                                </Space>
                                
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Título da Vaga"
                                            name="title"
                                            rules={[{ required: true, message: 'O título é obrigatório' }]}
                                        >
                                            <Input placeholder="Ex: Desenvolvedor Front-end Pleno" style={{ borderRadius: 8 }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Empresa Cliente"
                                            name="company_id"
                                            rules={[{ required: true, message: 'Selecione a empresa' }]}
                                        >
                                            <Select 
                                                placeholder="Selecione a empresa parceira"
                                                style={{ borderRadius: 8 }}
                                                onChange={(value) => setSelectedCompanyId(value)}
                                            >
                                                {empresas.map(e => (
                                                    <Option key={e.id} value={e.id}>{e.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={24}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item label="Tipo de Contrato" name="type" rules={[{ required: true }]}>
                                            <Select style={{ borderRadius: 8 }}>
                                                <Option value="CLT">CLT</Option>
                                                <Option value="PJ">PJ</Option>
                                                <Option value="FREELANCER">Freelancer</Option>
                                                <Option value="ESTAGIO">Estágio</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item label="Modalidade" name="modality" rules={[{ required: true }]}>
                                            <Select style={{ borderRadius: 8 }}>
                                                <Option value="REMOTE">Remoto</Option>
                                                <Option value="HYBRID">Híbrido</Option>
                                                <Option value="PRESENTIAL">Presencial</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={24}>
                                    <Col xs={24}>
                                        <Form.Item label="Local de Trabalho (Filial/Endereço)" name="location_id">
                                            <Select placeholder="Selecione uma filial ou local" style={{ borderRadius: 8 }}>
                                                {selectedCompanyId && locaisPorEmpresa[selectedCompanyId]?.map(local => (
                                                    <Option key={local.id} value={local.id}>
                                                        {local.name} {local.city && `- ${local.city}, ${local.state}`}
                                                    </Option>
                                                ))}
                                                {(!selectedCompanyId || !locaisPorEmpresa[selectedCompanyId]?.length) && (
                                                    <Option disabled>Selecione uma empresa primeiro</Option>
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>

                            <Divider style={{ margin: '24px 0' }} />

                            {/* SEÇÃO 2: REMUNERAÇÃO */}
                            <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                                <Space style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                                    <DollarOutlined style={{ fontSize: 18, color: '#10b981' }} />
                                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                                        Remuneração
                                    </span>
                                </Space>

                                <Row gutter={24}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item label="Salário Mínimo (R$)" name="salary_min">
                                            <InputNumber 
                                                placeholder="Ex: 3500"
                                                style={{ width: '100%' }}
                                                min={0}
                                                formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item label="Salário Máximo (R$)" name="salary_max">
                                            <InputNumber 
                                                placeholder="Ex: 7000"
                                                style={{ width: '100%' }}
                                                min={0}
                                                formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>

                            <Divider style={{ margin: '24px 0' }} />

                            {/* SEÇÃO 3: PRAZO E ETAPAS */}
                            <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                                <Space style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                                    <CalendarOutlined style={{ fontSize: 18, color: '#f59e0b' }} />
                                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                                        Prazo & Etapas de Seleção
                                    </span>
                                </Space>

                                <Row gutter={24}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item label="Data de Início" name="start_date">
                                            <DatePicker style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item label="Data de Término" name="end_date">
                                            <DatePicker style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item label="Etapas de Seleção" name="selection_stages">
                                    <Checkbox.Group style={{ width: '100%' }}>
                                        <Row>
                                            {SELECTION_STAGES.map(stage => (
                                                <Col span={24} key={stage} style={{ marginBottom: 8 }}>
                                                    <Checkbox value={stage}>{stage}</Checkbox>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>

                            <Divider style={{ margin: '24px 0' }} />

                            {/* SEÇÃO 4: STATUS E ACESSIBILIDADE */}
                            <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                                <Row gutter={24}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item label="Status da Vaga" name="status" rules={[{ required: true }]}>
                                            <Select style={{ borderRadius: 8 }}>
                                                <Option value="OPEN">Aberta (Visível para candidatos)</Option>
                                                <Option value="CLOSED">Fechada (Pausada no painel)</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={24}>
                                    <Col xs={24}>
                                        <Space style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                                            <AuditOutlined style={{ fontSize: 18, color: '#8b5cf6' }} />
                                            <span style={{ fontSize: 14, fontWeight: 500, color: '#1f2937' }}>
                                                Informações de Acessibilidade
                                            </span>
                                        </Space>
                                        <Form.Item label="Observações sobre Acessibilidade" name="accessibility_note">
                                            <TextArea 
                                                rows={3} 
                                                placeholder="Ex: Ambiente com rampas, horário flexível para PCD, contratação de pessoas com deficiência, etc..."
                                                style={{ borderRadius: 8 }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>

                            <Divider style={{ margin: '24px 0' }} />

                            {/* SEÇÃO 5: DETALHAMENTO DA OPORTUNIDADE */}
                            <div style={{ marginBottom: 32, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                                <Space style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                                    <FileTextOutlined style={{ fontSize: 18, color: '#f59e0b' }} />
                                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                                        Detalhamento da Oportunidade
                                    </span>
                                </Space>

                                <Form.Item
                                    label="Descrição Completa da Vaga"
                                    name="description"
                                    rules={[{ required: true, message: 'A descrição da vaga é obrigatória' }]}
                                    help="Descreva detalhadamente o dia a dia, escopo do projeto, responsabilidades e desafios."
                                >
                                    <TextArea rows={6} placeholder="Descreva a vaga aqui..." style={{ borderRadius: 8 }} />
                                </Form.Item>

                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Requisitos (Opcional)" name="requirements">
                                            <TextArea rows={5} placeholder="Liste os requisitos técnicos, vivências e ferramentas recomendadas..." style={{ borderRadius: 8 }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Benefícios (Opcional)" name="benefits">
                                            <TextArea rows={5} placeholder="Ex: Vale Refeição, Plano de Saúde, Horário Flexível, etc..." style={{ borderRadius: 8 }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>

                            {/* Ações do Formulário */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: 24 }}>
                                <Space size="middle">
                                    <Button onClick={() => navigate('/vagas')} disabled={loading} style={{ borderRadius: 8, minWidth: 120 }}>
                                        Cancelar
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        loading={loading}
                                        icon={<SaveOutlined />}
                                        style={{ 
                                            borderRadius: 8, 
                                            minWidth: 160,
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                                            border: 'none',
                                            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
                                        }}
                                    >
                                        {loadedVaga ? 'Atualizar Vaga' : 'Publicar Vaga'}
                                    </Button>
                                </Space>
                            </div>
                        </Form>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
