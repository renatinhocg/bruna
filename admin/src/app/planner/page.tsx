"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { Card, Row, Col, Button, Modal, Form, Input, Select, Space, Empty, Spin, message } from 'antd';
import { PlusOutlined, FolderOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('pt-br');
dayjs.extend(relativeTime);

interface Projeto {
  id: number;
  nome: string;
  descricao?: string;
  cor?: string;
  icone?: string;
  tags: string[];
  status: string;
  criado_em: string;
  atualizado_em: string;
  _count?: { tasks: number };
}

interface Template {
  id: number;
  nome: string;
  descricao?: string;
  icone?: string;
  cor?: string;
  tipo: string;
}

export default function PlannerPage() {
  const router = useRouter();
  const apiUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002').replace(/\/$/, '');
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProjetos();
    fetchTemplates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProjetos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await fetch(`${apiUrl}/projetos`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        console.log('Projetos carregados:', data);
        const projetosData = Array.isArray(data) ? data : (data.data || []);
        setProjetos(projetosData);
      } else {
        console.error('Erro na resposta:', res.status);
      }
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await fetch(`${apiUrl}/templates?is_publico=true`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        console.log('Templates carregados:', data);
        setTemplates(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
    }
  };

  const handleNovoProjeto = async (values: { nome: string; descricao?: string; icone?: string; cor?: string }) => {
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await fetch(`${apiUrl}/projetos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        message.success('Projeto criado!');
        await fetchProjetos();
        setModalVisible(false);
        form.resetFields();
      }
    } catch {
      message.error('Erro ao criar projeto');
    }
  };

  const handleCriarDeTemplate = async (template: Template) => {
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      await fetch(`${apiUrl}/projetos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome: template.nome, descricao: template.descricao, cor: template.cor, icone: template.icone, tipo: template.tipo, template_id: template.id }),
      });
      message.success('Projeto criado!');
      await fetchProjetos();
      setTemplateModalVisible(false);
    } catch {
      message.error('Erro');
    }
  };

  const handleDeletarProjeto = async (id: number) => {
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      await fetch(`${apiUrl}/projetos/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      message.success('Projeto deletado!');
      await fetchProjetos();
    } catch {
      message.error('Erro');
    }
  };

  const projetosAtivos = projetos.filter(p => p.status === 'ativo');
  const projetosConcluidos = projetos.filter(p => p.status === 'concluido');

  console.log('Projetos ativos:', projetosAtivos.length);
  console.log('Projetos concluídos:', projetosConcluidos.length);

  if (loading) return <AdminLayout><div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>📋 Planner</h1>
        <Space>
          <Button icon={<FolderOutlined />} onClick={() => setTemplateModalVisible(true)}>Usar Template</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>Novo Projeto</Button>
        </Space>
      </div>

      {projetosAtivos.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}> Projetos Ativos</h2>
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            {projetosAtivos.map((projeto) => (
              <Col key={projeto.id} xs={24} sm={12} lg={8} xl={6}>
                <Card hoverable onClick={() => router.push(`/planner/${projeto.id}`)} style={{ borderLeft: `4px solid ${projeto.cor || '#3b82f6'}`, cursor: 'pointer' }}
                  actions={[
                    <EditOutlined key="edit" onClick={(e) => e.stopPropagation()} />,
                    <DeleteOutlined key="delete" onClick={(e) => { e.stopPropagation(); Modal.confirm({ title: 'Deletar?', onOk: () => handleDeletarProjeto(projeto.id) }); }} />,
                  ]}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 24, marginRight: 8 }}>{projeto.icone || ''}</span>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{projeto.nome}</span>
                  </div>
                  {projeto.descricao && <p style={{ color: '#999', fontSize: 13, marginBottom: 12 }}>{projeto.descricao.substring(0, 80)}{projeto.descricao.length > 80 ? '...' : ''}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
                    <span>{projeto._count?.tasks || 0} tarefas</span>
                    <span>{dayjs(projeto.atualizado_em).fromNow()}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {projetosConcluidos.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}> Concluídos</h2>
          <Row gutter={[16, 16]}>
            {projetosConcluidos.map((projeto) => (
              <Col key={projeto.id} xs={24} sm={12} lg={8} xl={6}>
                <Card hoverable onClick={() => router.push(`/planner/${projeto.id}`)} style={{ borderLeft: `4px solid ${projeto.cor || '#52c41a'}`, opacity: 0.8, cursor: 'pointer' }}>
                  <div>{projeto.icone || ''} {projeto.nome}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{projeto._count?.tasks || 0} tarefas</div>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {projetos.length === 0 && <Empty description="Nenhum projeto" style={{ marginTop: 60 }}><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>Criar Projeto</Button></Empty>}

      <Modal title="Novo Projeto" open={modalVisible} onCancel={() => { setModalVisible(false); form.resetFields(); }} onOk={() => form.submit()} okText="Criar" cancelText="Cancelar">
        <Form form={form} layout="vertical" onFinish={handleNovoProjeto}>
          <Form.Item name="nome" label="Nome" rules={[{ required: true }]}><Input placeholder="Ex: Projeto Terapêutico" /></Form.Item>
          <Form.Item name="descricao" label="Descrição"><Input.TextArea rows={3} /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="icone" label="Ícone" initialValue=""><Select><Select.Option value=""> Geral</Select.Option><Select.Option value=""> Psicologia</Select.Option><Select.Option value=""> Carreira</Select.Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item name="cor" label="Cor" initialValue="#3b82f6"><Select><Select.Option value="#3b82f6"> Azul</Select.Option><Select.Option value="#52c41a"> Verde</Select.Option><Select.Option value="#f5222d"> Vermelho</Select.Option></Select></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="Templates" open={templateModalVisible} onCancel={() => setTemplateModalVisible(false)} footer={null} width={800}>
        <Row gutter={[16, 16]}>
          {templates.map((t) => (
            <Col key={t.id} span={12}><Card hoverable onClick={() => handleCriarDeTemplate(t)} style={{ borderLeft: `4px solid ${t.cor || '#3b82f6'}` }}><div>{t.icone || ''} {t.nome}</div><p style={{ fontSize: 13, color: '#666' }}>{t.descricao}</p></Card></Col>
          ))}
        </Row>
        {templates.length === 0 && <Empty description="Nenhum template" style={{ marginTop: 40 }} />}
      </Modal>
    </AdminLayout>
  );
}
