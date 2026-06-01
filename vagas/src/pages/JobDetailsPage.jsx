import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Empty, Form, Input, Spin, Tag, Typography, Upload, message } from 'antd';
import { ArrowLeftOutlined, BankOutlined, EnvironmentOutlined, FilePdfOutlined, SendOutlined } from '@ant-design/icons';
import { fetchPublicJob, submitPublicApplication, uploadResume } from '../api';
import '../portal.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

function formatModality(modality) {
  if (modality === 'REMOTE') return 'Remoto';
  if (modality === 'HYBRID') return 'Hibrido';
  return 'Presencial';
}

function formatSalary(job) {
  if (!job.salary_min && !job.salary_max) return 'Faixa a combinar';
  const min = job.salary_min ? Number(job.salary_min).toLocaleString('pt-BR') : null;
  const max = job.salary_max ? Number(job.salary_max).toLocaleString('pt-BR') : null;
  if (min && max) return `R$ ${min} - R$ ${max}`;
  if (min) return `A partir de R$ ${min}`;
  return `Ate R$ ${max}`;
}

export default function JobDetailsPage({ forcedCompanySlug = null }) {
  const navigate = useNavigate();
  const params = useParams();
  const companySlug = forcedCompanySlug || params.companySlug;
  const jobSlug = params.jobSlug;

  const [form] = Form.useForm();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    async function loadJob() {
      setLoading(true);
      try {
        const data = await fetchPublicJob(companySlug, jobSlug);
        setJob(data);
      } catch (error) {
        console.error('Erro ao carregar vaga publica:', error);
        message.error('Nao foi possivel carregar esta vaga.');
      } finally {
        setLoading(false);
      }
    }

    if (companySlug && jobSlug) loadJob();
  }, [companySlug, jobSlug]);

  const portalBasePath = useMemo(() => (forcedCompanySlug ? '' : `/${companySlug}`), [companySlug, forcedCompanySlug]);

  const handleSubmit = async (values) => {
    if (!fileList.length) {
      message.error('Anexe o curriculo em PDF.');
      return;
    }

    setSubmitting(true);
    try {
      const resumeUrl = await uploadResume(fileList[0].originFileObj);
      await submitPublicApplication({
        job_id: job.id,
        nome: values.nome,
        email: values.email,
        telefone: values.telefone,
        linkedin_url: values.linkedin_url,
        cover_letter: values.cover_letter,
        resume_url: resumeUrl
      });

      message.success('Candidatura enviada com sucesso!');
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Erro ao enviar candidatura publica:', error);
      message.error(error.response?.data?.error || 'Nao foi possivel enviar sua candidatura.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="vagas-portal"><div className="vagas-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}><Spin size="large" /></div></div>;
  }

  if (!job) {
    return <div className="vagas-portal"><div className="vagas-shell" style={{ padding: '96px 0' }}><div className="vagas-empty"><Empty description="Vaga nao encontrada" /></div></div></div>;
  }

  return (
    <div className="vagas-portal">
      <section className="vaga-detail-hero">
        <div className="vagas-shell">
          <Button type="link" className="vagas-back-link" icon={<ArrowLeftOutlined />} onClick={() => navigate(portalBasePath || '/')}>
            Voltar para as vagas
          </Button>
          <Title level={1}>{job.title}</Title>
          <div className="vaga-detail-meta">
            <Tag color="blue">{job.type}</Tag>
            <Tag color={job.modality === 'REMOTE' ? 'cyan' : job.modality === 'HYBRID' ? 'gold' : 'default'}>{formatModality(job.modality)}</Tag>
            <Tag icon={<EnvironmentOutlined />}>{job.location?.name || 'Operacao principal'}</Tag>
            <Tag>{formatSalary(job)}</Tag>
          </div>
        </div>
      </section>

      <div className="vagas-shell vaga-detail-layout">
        <article className="vaga-detail-panel">
          <div style={{ marginBottom: 28 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              <BankOutlined style={{ marginRight: 8 }} />
              {job.company?.name}
            </Text>
            <Paragraph className="vaga-richtext" style={{ marginBottom: 0 }}>
              {job.company?.description || 'Esta empresa utiliza o portal BM Talentos para divulgar oportunidades e receber candidaturas diretamente.'}
            </Paragraph>
          </div>

          <div style={{ marginBottom: 28 }}>
            <Title level={4}>Descricao da vaga</Title>
            <Paragraph className="vaga-richtext">{job.description}</Paragraph>
          </div>

          {job.requirements && (
            <div style={{ marginBottom: 28 }}>
              <Title level={4}>Requisitos</Title>
              <Paragraph className="vaga-richtext">{job.requirements}</Paragraph>
            </div>
          )}

          {job.benefits && (
            <div style={{ marginBottom: 28 }}>
              <Title level={4}>Beneficios</Title>
              <Paragraph className="vaga-richtext">{job.benefits}</Paragraph>
            </div>
          )}

          {job.selection_stages?.length ? (
            <div>
              <Title level={4}>Etapas do processo</Title>
              <div className="vaga-card-meta">
                {job.selection_stages.map((stage) => <Tag key={stage}>{stage}</Tag>)}
              </div>
            </div>
          ) : null}
        </article>

        <aside className="vaga-apply-panel">
          <Title level={4}>Candidate-se agora</Title>
          <Text type="secondary">
            Formulario independente do site da BM. O candidato entra, envia curriculo e segue direto para a triagem.
          </Text>

          <Alert
            style={{ margin: '18px 0 22px' }}
            type="info"
            showIcon
            message="Candidatura publica"
            description="Preencha seus dados e anexe um curriculo PDF. Nao exigimos login no portal principal para esta etapa."
          />

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="nome" label="Nome completo" rules={[{ required: true, message: 'Informe seu nome completo' }]}>
              <Input placeholder="Como voce gostaria de ser identificado no processo" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Informe seu email' }, { type: 'email', message: 'Digite um email valido' }]}>
              <Input placeholder="voce@exemplo.com" />
            </Form.Item>
            <Form.Item name="telefone" label="Telefone">
              <Input placeholder="(11) 99999-9999" />
            </Form.Item>
            <Form.Item name="linkedin_url" label="LinkedIn">
              <Input placeholder="https://linkedin.com/in/seu-perfil" />
            </Form.Item>
            <Form.Item label="Curriculo em PDF" required>
              <Upload beforeUpload={() => false} fileList={fileList} accept=".pdf" maxCount={1} onChange={({ fileList: nextFiles }) => setFileList(nextFiles.slice(-1))}>
                <Button icon={<FilePdfOutlined />} block>Selecionar PDF</Button>
              </Upload>
            </Form.Item>
            <Form.Item name="cover_letter" label="Mensagem para recrutamento">
              <TextArea rows={5} placeholder="Conte rapidamente por que esta vaga faz sentido para voce." maxLength={1200} showCount />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
                <SendOutlined /> {submitting ? 'Enviando...' : 'Enviar candidatura'}
              </Button>
            </Form.Item>
          </Form>
        </aside>
      </div>
    </div>
  );
}
