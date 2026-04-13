"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { Table, Button, Modal, Form, Input, Tag, Select, Space, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "@/services/api";


const statusOptions = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
];

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, id?: string }>({ open: false });
  type Projeto = {
    id: string;
    nome: string;
    descricao?: string;
    tags?: string[];
    status?: string;
    criado_em?: string;
  };
  const [editing, setEditing] = useState<Projeto | null>(null);
  const [form] = Form.useForm();

  const fetchProjetos = async () => {
    setLoading(true);
    try {
      const res = await api.getProjetos();
      setProjetos(res.data || []);
    } catch {
      message.error("Erro ao buscar projetos");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjetos();
  }, []);

  const openModal = (projeto: Projeto | null = null) => {
    setEditing(projeto);
    setModalOpen(true);
    if (projeto) {
      form.setFieldsValue({
        nome: projeto.nome,
        descricao: projeto.descricao,
        tags: projeto.tags || [],
        status: projeto.status,
      });
    } else {
      form.resetFields();
    }
  };

  const handleOk = async () => {
    try {
      let values = await form.validateFields();
      console.log('Valor do nome antes do trim:', values.nome);
      // Remover espaços em branco do nome
      values = { ...values, nome: values.nome?.trim() };
      console.log('Valor do nome depois do trim:', values.nome);
      if (!values.nome) {
        form.setFields([{
          name: 'nome',
          errors: ['Informe o nome']
        }]);
        return;
      }
      if (editing) {
        await api.updateProjeto(editing.id, values);
        message.success("Projeto atualizado!");
      } else {
        await api.createProjeto(values);
        message.success("Projeto criado!");
      }
      setModalOpen(false);
      fetchProjetos();
    } catch (e) {
      console.error('Erro ao salvar projeto:', e);
      message.error("Erro ao salvar projeto");
    }
  };

  const handleDelete = (id: string) => {
    console.log(`Abrindo modal de exclusão para projeto id=${id}`);
    setDeleteModal({ open: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.deleteProjeto(Number(deleteModal.id));
      message.success("Projeto excluído!");
      fetchProjetos();
    } catch (e) {
      console.error('Erro ao excluir projeto:', e);
      message.error("Erro ao excluir projeto");
    }
    setDeleteModal({ open: false });
  };

  const router = useRouter();
  const columns = [
    { title: "Nome", dataIndex: "nome", key: "nome" },
    { title: "Descrição", dataIndex: "descricao", key: "descricao" },
    { title: "Tags", dataIndex: "tags", key: "tags", render: (tags: string[]) => tags?.map((tag: string) => <Tag key={tag}>{tag}</Tag>) },
    { title: "Status", dataIndex: "status", key: "status", render: (s: string) => <Tag color={s === "ativo" ? "green" : "red"}>{s}</Tag> },
  { title: "Criado em", dataIndex: "criado_em", key: "criado_em", render: (d: string) => d && new Date(d).toLocaleDateString() },
    {
      title: "Ações",
      key: "acoes",
      render: (_: unknown, rec: Projeto) => (
        <Space>
          <Button size="small" onClick={() => openModal(rec)}>Editar</Button>
          <Button size="small" danger onClick={() => { console.log('Clicou em Excluir', rec.id); handleDelete(rec.id); }}>Excluir</Button>
          <Button size="small" type="primary" onClick={() => router.push(`/kanban?id=${rec.id}`)}>Kanban</Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#c026d3', letterSpacing: 1 }}>Lista de Projetos</h1>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: '#666' }}>Gerencie seus projetos cadastrados</span>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Novo Projeto
          </Button>
        </div>
        <Table rowKey="id" columns={columns} dataSource={projetos} loading={loading} />
        <Modal
          open={deleteModal.open}
          onCancel={() => setDeleteModal({ open: false })}
          onOk={confirmDelete}
          okText="Excluir"
          okButtonProps={{ danger: true }}
          cancelText="Cancelar"
        >
          Tem certeza que deseja excluir este projeto?
        </Modal>
        <Modal
          title={editing ? "Editar Projeto" : "Novo Projeto"}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleOk}
          okText="Salvar"
        >
          <Form form={form} layout="vertical">
            <Form.Item name="nome" label="Nome" rules={[{ required: true, message: "Informe o nome" }]}> 
              <Input />
            </Form.Item>
            <Form.Item name="descricao" label="Descrição">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="tags" label="Tags">
              <Select mode="tags" style={{ width: "100%" }} placeholder="Adicione tags" options={[]} />
            </Form.Item>
            <Form.Item name="status" label="Status" initialValue="ativo">
              <Select options={statusOptions} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
