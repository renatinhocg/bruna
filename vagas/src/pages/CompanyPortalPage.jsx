import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Empty, Spin, Tag, Typography, message } from 'antd';
import { ArrowRightOutlined, BankOutlined, EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';
import { fetchCompanyPortal } from '../api';
import '../portal.css';

const { Title, Paragraph, Text } = Typography;

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

export default function CompanyPortalPage({ forcedCompanySlug = null }) {
  const navigate = useNavigate();
  const params = useParams();
  const companySlug = forcedCompanySlug || params.companySlug;

  const [portal, setPortal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortal() {
      setLoading(true);
      try {
        const data = await fetchCompanyPortal(companySlug);
        setPortal(data);
      } catch (error) {
        console.error('Erro ao carregar portal da empresa:', error);
        message.error('Nao foi possivel carregar o portal desta empresa.');
      } finally {
        setLoading(false);
      }
    }

    if (companySlug) loadPortal();
  }, [companySlug]);

  const portalBasePath = useMemo(() => (forcedCompanySlug ? '' : `/${companySlug}`), [companySlug, forcedCompanySlug]);

  if (loading) {
    return <div className="vagas-portal"><div className="vagas-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}><Spin size="large" /></div></div>;
  }

  if (!portal) {
    return <div className="vagas-portal"><div className="vagas-shell" style={{ padding: '96px 0' }}><div className="vagas-empty"><Empty description="Portal da empresa nao encontrado" /></div></div></div>;
  }

  return (
    <div className="vagas-portal">
      <section className="vagas-hero">
        <div className="vagas-shell vagas-hero-grid">
          <div>
            <div className="vagas-eyebrow">BM Talentos</div>
            <Title level={1}>{portal.name}</Title>
            <Paragraph className="vagas-hero-copy">
              {portal.description || 'Conheca a empresa, entenda o momento do time e encontre a vaga que faz sentido para sua proxima fase profissional.'}
            </Paragraph>
            <Button
              type="primary"
              size="large"
              className="vagas-hero-button"
              onClick={() => document.getElementById('vagas-abertas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Ver vagas abertas <ArrowRightOutlined />
            </Button>
          </div>

          <div className="vagas-company-card">
            <div className="vagas-company-logo">
              {portal.logo_url ? <img src={portal.logo_url} alt={portal.name} /> : <BankOutlined style={{ fontSize: 34, color: '#fff' }} />}
            </div>
            <Title level={4} style={{ color: '#fff', marginBottom: 8 }}>{portal.name}</Title>
            <Text style={{ color: 'rgba(255,255,255,0.78)' }}>
              Portal de recrutamento dedicado para conhecer a empresa e se candidatar sem entrar no site principal da BM.
            </Text>
            {portal.website_url && (
              <div style={{ marginTop: 18 }}>
                <Button ghost icon={<GlobalOutlined />} href={portal.website_url} target="_blank">Visitar site da empresa</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="vagas-main">
        <div className="vagas-shell">
          <section className="vagas-section">
            <div className="vagas-stat-grid">
              <div className="vagas-stat"><Text type="secondary">Vagas abertas</Text><strong>{portal.jobs?.length || 0}</strong><Text>Oportunidades publicadas agora</Text></div>
              <div className="vagas-stat"><Text type="secondary">Locais</Text><strong>{portal.locations?.length || 0}</strong><Text>Unidades e operacoes da empresa</Text></div>
              <div className="vagas-stat"><Text type="secondary">Status</Text><strong>{portal.status === 'ACTIVE' ? 'Ativa' : 'Pausada'}</strong><Text>Portal mantido pela BM Talentos</Text></div>
            </div>
          </section>

          <section className="vagas-section">
            <div className="vagas-section-head">
              <div>
                <Title level={3} style={{ marginBottom: 6 }}>Sobre a empresa</Title>
                <Text type="secondary">Uma apresentacao institucional antes das vagas, no estilo portal dedicado.</Text>
              </div>
            </div>
            <div className="vagas-about">
              <Paragraph className="vaga-richtext" style={{ marginBottom: 0 }}>
                {portal.description || 'Adicione a descricao da empresa no admin para enriquecer este bloco com cultura, contexto e proposta de valor da marca empregadora.'}
              </Paragraph>
            </div>
          </section>

          <section className="vagas-section" id="vagas-abertas">
            <div className="vagas-section-head">
              <div>
                <Title level={3} style={{ marginBottom: 6 }}>Vagas abertas</Title>
                <Text type="secondary">Selecione uma oportunidade para ver os detalhes completos e se candidatar.</Text>
              </div>
            </div>

            {portal.jobs?.length ? (
              <div className="vagas-jobs-grid">
                {portal.jobs.map((job) => (
                  <article key={job.id} className="vaga-card">
                    <div className="vaga-card-top">
                      <div>
                        <Title level={4} style={{ marginBottom: 8 }}>{job.title}</Title>
                        <Text type="secondary">
                          {job.location?.city ? `${job.location.city}${job.location.state ? `, ${job.location.state}` : ''}` : 'Local a definir'}
                        </Text>
                      </div>
                      <Tag color={job.status === 'OPEN' ? 'green' : 'default'}>
                        {job.status === 'OPEN' ? 'Inscricoes abertas' : job.status}
                      </Tag>
                    </div>

                    <div className="vaga-card-meta">
                      <Tag color="blue">{job.type}</Tag>
                      <Tag color={job.modality === 'REMOTE' ? 'cyan' : job.modality === 'HYBRID' ? 'gold' : 'default'}>
                        {formatModality(job.modality)}
                      </Tag>
                      <Tag icon={<EnvironmentOutlined />}>{job.location?.name || 'Operacao principal'}</Tag>
                    </div>

                    <Paragraph className="vaga-richtext" ellipsis={{ rows: 4 }}>{job.description}</Paragraph>

                    <div className="vaga-card-footer">
                      <Text strong>{formatSalary(job)}</Text>
                      <Button type="primary" onClick={() => navigate(`${portalBasePath}/vaga/${job.public_slug}`)}>
                        Ver detalhes <ArrowRightOutlined />
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="vagas-empty"><Empty description="Nenhuma vaga aberta neste momento" /></div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
