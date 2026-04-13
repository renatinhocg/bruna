"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import { Card, Tabs, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Space, message, Progress, Calendar, Badge } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Task {
  id: number;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: string;
  data_prevista?: string;
  responsavel?: string;
  progresso: number;
  tags: string[];
}

interface Projeto {
  id: number;
  nome: string;
  descricao?: string;
  cor?: string;
  icone?: string;
  data_inicio?: string;
  data_meta?: string;
  data_conclusao?: string;
  criado_em: string;
  tasks: Task[];
}

// Componente Kanban Board
function KanbanBoard({ tasks, onUpdateTask, onEditTask }: { tasks: Task[]; onUpdateTask: (id: number, status: string) => void; onEditTask: (task: Task) => void }) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const colunas = [
    { key: 'PLANEJADO', label: 'Planejado', color: '#d9d9d9' },
    { key: 'EM_DESENVOLVIMENTO', label: 'Em Desenvolvimento', color: '#1890ff' },
    { key: 'EM_TESTE', label: 'Em Teste', color: '#faad14' },
    { key: 'CONCLUIDO', label: 'Concluído', color: '#52c41a' },
  ];

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: string) => {
    if (draggedTask && draggedTask.status !== status) {
      onUpdateTask(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  return (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: 16 }}>
      {colunas.map((coluna) => {
        const tasksDaColuna = tasks.filter(t => t.status === coluna.key);
        return (
          <div
            key={coluna.key}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(coluna.key)}
            style={{
              flex: 1,
              minWidth: 280,
              background: '#fafafa',
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{coluna.label}</span>
              <Tag color={coluna.color}>{tasksDaColuna.length}</Tag>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tasksDaColuna.map((task) => (
                <Card
                  key={task.id}
                  size="small"
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onClick={() => onEditTask(task)}
                  style={{
                    cursor: 'pointer',
                    borderLeft: `3px solid ${coluna.color}`,
                    opacity: draggedTask?.id === task.id ? 0.5 : 1,
                  }}
                  hoverable
                >
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{task.titulo}</div>
                  {task.descricao && (
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                      {task.descricao.substring(0, 60)}
                      {task.descricao.length > 60 ? '...' : ''}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color={getPrioridadeColor(task.prioridade)}>{task.prioridade}</Tag>
                    {task.data_prevista && (
                      <span style={{ fontSize: 11, color: '#999' }}>
                        {dayjs(task.data_prevista).format('DD/MM')}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
              {tasksDaColuna.length === 0 && (
                <div style={{ textAlign: 'center', color: '#ccc', padding: 20 }}>
                  Arraste tarefas aqui
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Funções auxiliares de cor
function getPrioridadeColor(prioridade: string) {
  const colors: Record<string, string> = {
    BAIXA: 'default',
    MEDIA: 'blue',
    ALTA: 'orange',
    URGENTE: 'red',
  };
  return colors[prioridade] || 'default';
}

// Componente Calendar View
function CalendarView({ tasks, onEditTask }: { tasks: Task[]; onEditTask: (task: Task) => void }) {
  const getTasksForDate = (date: dayjs.Dayjs) => {
    return tasks.filter((task) => {
      if (!task.data_prevista) return false;
      return dayjs(task.data_prevista).isSame(date, 'day');
    });
  };

  const dateCellRender = (value: dayjs.Dayjs) => {
    const tasksForDate = getTasksForDate(value);
    if (tasksForDate.length === 0) return null;

    return (
      <div style={{ fontSize: 11 }}>
        {tasksForDate.map((task) => (
          <div
            key={task.id}
            onClick={() => onEditTask(task)}
            style={{
              background: getStatusBackgroundColor(task.status),
              padding: '2px 6px',
              marginBottom: 2,
              borderRadius: 3,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Badge
              status={getStatusBadge(task.status)}
              text={task.titulo}
              style={{ fontSize: 11 }}
            />
          </div>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string): 'success' | 'processing' | 'default' | 'error' | 'warning' => {
    const badges: Record<string, 'success' | 'processing' | 'default' | 'error' | 'warning'> = {
      PLANEJADO: 'default',
      EM_DESENVOLVIMENTO: 'processing',
      EM_TESTE: 'warning',
      CONCLUIDO: 'success',
      CANCELADO: 'error',
    };
    return badges[status] || 'default';
  };

  const getStatusBackgroundColor = (status: string) => {
    const colors: Record<string, string> = {
      PLANEJADO: '#f0f0f0',
      EM_DESENVOLVIMENTO: '#e6f7ff',
      EM_TESTE: '#fffbe6',
      CONCLUIDO: '#f6ffed',
      CANCELADO: '#fff1f0',
    };
    return colors[status] || '#f0f0f0';
  };

  return (
    <div style={{ padding: 16 }}>
      <Calendar cellRender={dateCellRender} />
      <div style={{ marginTop: 16, padding: 16, background: '#fafafa', borderRadius: 8 }}>
        <h4 style={{ marginBottom: 12 }}>📊 Estatísticas</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#999' }}>Total de Tarefas</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{tasks.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999' }}>Com Prazo Definido</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {tasks.filter((t) => t.data_prevista).length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999' }}>Concluídas</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>
              {tasks.filter((t) => t.status === 'CONCLUIDO').length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999' }}>Em Andamento</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>
              {tasks.filter((t) => t.status === 'EM_DESENVOLVIMENTO').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjetoDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const projetoId = params?.id as string;
  const apiUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002').replace(/\/$/, '');

  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [projetoModalVisible, setProjetoModalVisible] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [savingProjeto, setSavingProjeto] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [projetoForm] = Form.useForm();

  // Calcular progresso do projeto
  const projetoProgresso = useMemo(() => {
    if (!projeto || !projeto.tasks || projeto.tasks.length === 0) {
      return { percentual: 0, concluidas: 0, total: 0 };
    }
    const concluidas = projeto.tasks.filter(t => t.status === 'CONCLUIDO').length;
    const total = projeto.tasks.length;
    const percentual = Math.round((concluidas / total) * 100);
    return { percentual, concluidas, total };
  }, [projeto]);

  useEffect(() => {
    if (projetoId) {
      fetchProjeto();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetoId]);

  const fetchProjeto = async () => {
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await fetch(`${apiUrl}/projetos/${projetoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjeto(data.data || data);
      }
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      message.error('Erro ao carregar projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleNovaTask = () => {
    setEditingTask(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditarTask = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      titulo: task.titulo,
      descricao: task.descricao,
      status: task.status,
      prioridade: task.prioridade,
      data_prevista: task.data_prevista ? dayjs(task.data_prevista) : null,
      progresso: task.progresso,
    });
    setModalVisible(true);
  };

  const handleSalvarTask = async (values: {
    titulo: string;
    descricao?: string;
    status: string;
    prioridade: string;
    responsavel?: string;
    tags?: string;
    data_prevista?: dayjs.Dayjs | null;
    progresso?: number;
  }) => {
    try {
      setSavingTask(true);
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const method = editingTask ? 'PUT' : 'POST';
      const url = editingTask 
        ? `${apiUrl}/tasks/${editingTask.id}`
        : `${apiUrl}/tasks`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          projeto_id: parseInt(projetoId),
          data_prevista: values.data_prevista ? values.data_prevista.toISOString() : null,
        }),
      });

      if (res.ok) {
        message.success(editingTask ? 'Task atualizada!' : 'Task criada!');
        await fetchProjeto();
        setModalVisible(false);
        form.resetFields();
        setEditingTask(null);
      } else {
        message.error('Erro ao salvar task');
      }
    } catch (error) {
      console.error('Erro ao salvar task:', error);
      message.error('Erro ao salvar task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    const hide = message.loading('Atualizando status...', 0);
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchProjeto();
        hide();
        message.success('Status atualizado!');
      } else {
        hide();
        message.error('Erro ao atualizar status');
      }
    } catch {
      hide();
      message.error('Erro ao atualizar status');
    }
  };

  const handleDeletarTask = async (id: number) => {
    const hide = message.loading('Deletando tarefa...', 0);
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await fetch(`${apiUrl}/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchProjeto();
        hide();
        message.success('Task deletada!');
      } else {
        hide();
        message.error('Erro ao deletar task');
      }
    } catch (error) {
      console.error('Erro ao deletar task:', error);
      hide();
      message.error('Erro ao deletar task');
    }
  };

  const handleEditarProjeto = () => {
    if (!projeto) return;
    projetoForm.setFieldsValue({
      nome: projeto.nome,
      descricao: projeto.descricao,
      icone: projeto.icone,
      cor: projeto.cor,
      data_inicio: projeto.data_inicio ? dayjs(projeto.data_inicio) : null,
      data_meta: projeto.data_meta ? dayjs(projeto.data_meta) : null,
      data_conclusao: projeto.data_conclusao ? dayjs(projeto.data_conclusao) : null,
    });
    setProjetoModalVisible(true);
  };

  const handleSalvarProjeto = async (values: { 
    nome: string; 
    descricao?: string; 
    icone?: string; 
    cor?: string; 
    data_inicio?: dayjs.Dayjs | null; 
    data_meta?: dayjs.Dayjs | null; 
    data_conclusao?: dayjs.Dayjs | null 
  }) => {
    try {
      setSavingProjeto(true);
      const payload = {
        ...values,
        data_inicio: values.data_inicio ? values.data_inicio.toISOString() : null,
        data_meta: values.data_meta ? values.data_meta.toISOString() : null,
        data_conclusao: values.data_conclusao ? values.data_conclusao.toISOString() : null,
      };
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await fetch(`${apiUrl}/projetos/${projetoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        message.success('Projeto atualizado!');
        await fetchProjeto();
        setProjetoModalVisible(false);
        projetoForm.resetFields();
      } else {
        message.error('Erro ao atualizar projeto');
      }
    } catch {
      message.error('Erro ao atualizar projeto');
    } finally {
      setSavingProjeto(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PLANEJADO': 'default',
      'EM_DESENVOLVIMENTO': 'processing',
      'EM_TESTE': 'warning',
      'CONCLUIDO': 'success',
      'CANCELADO': 'error',
    };
    return colors[status] || 'default';
  };

  const getPrioridadeColor = (prioridade: string) => {
    const colors: { [key: string]: string } = {
      'BAIXA': 'green',
      'MEDIA': 'blue',
      'ALTA': 'orange',
      'URGENTE': 'red',
    };
    return colors[prioridade] || 'default';
  };

  const columns = [
    {
      title: 'Tarefa',
      dataIndex: 'titulo',
      key: 'titulo',
      render: (text: string, record: Task) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.descricao && (
            <div style={{ fontSize: 12, color: '#999' }}>{record.descricao}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Prioridade',
      dataIndex: 'prioridade',
      key: 'prioridade',
      render: (prioridade: string) => <Tag color={getPrioridadeColor(prioridade)}>{prioridade}</Tag>,
    },
    {
      title: 'Prazo',
      dataIndex: 'data_prevista',
      key: 'data_prevista',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Progresso',
      dataIndex: 'progresso',
      key: 'progresso',
      render: (progresso: number) => <Progress percent={progresso} size="small" />,
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: unknown, record: Task) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditarTask(record)}
          />
          <Button 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Deletar tarefa?',
                content: 'Esta ação não pode ser desfeita.',
                onOk: () => handleDeletarTask(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  if (loading || !projeto) {
    return <AdminLayout><div style={{ textAlign: 'center', padding: 100 }}>Carregando...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/planner')} style={{ marginBottom: 16 }}>
          Voltar
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
                {projeto.icone} {projeto.nome}
              </h1>
              <Button 
                size="small" 
                icon={<EditOutlined />} 
                onClick={handleEditarProjeto}
                type="text"
              />
            </div>
            {projeto.descricao && <p style={{ color: '#999', marginTop: 8 }}>{projeto.descricao}</p>}
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNovaTask}>
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Card de Informações do Projeto */}
      <Card style={{ marginBottom: 24, background: `linear-gradient(135deg, ${projeto.cor || '#3b82f6'}15, ${projeto.cor || '#3b82f6'}05)`, borderLeft: `4px solid ${projeto.cor || '#3b82f6'}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>📅 Data Início</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>
              {projeto.data_inicio ? dayjs(projeto.data_inicio).format('DD/MM/YYYY') : 'Não definida'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>🎯 Data Meta</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>
              {projeto.data_meta ? dayjs(projeto.data_meta).format('DD/MM/YYYY') : 'Não definida'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>✅ Data Conclusão</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>
              {projeto.data_conclusao ? dayjs(projeto.data_conclusao).format('DD/MM/YYYY') : 'Em andamento'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>📊 Progresso</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>
              {projetoProgresso.percentual}%
              <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                ({projetoProgresso.concluidas}/{projetoProgresso.total} tarefas)
              </span>
            </div>
            <Progress 
              percent={projetoProgresso.percentual} 
              strokeColor={projeto.cor || '#3b82f6'}
              style={{ marginTop: 8 }}
              showInfo={false}
            />
          </div>
        </div>
      </Card>

      <Card>
        <Tabs
          defaultActiveKey="lista"
          items={[
            {
              key: 'lista',
              label: '📋 Lista',
              children: (
                <Table
                  columns={columns}
                  dataSource={projeto.tasks || []}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'kanban',
              label: '📊 Kanban',
              children: <KanbanBoard tasks={projeto.tasks || []} onUpdateTask={handleUpdateTaskStatus} onEditTask={handleEditarTask} />,
            },
            {
              key: 'calendario',
              label: '📅 Calendário',
              children: <CalendarView tasks={projeto.tasks || []} onEditTask={handleEditarTask} />,
            },
          ]}
        />
      </Card>

      <Modal
        title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        open={modalVisible}
        onCancel={() => {
          if (savingTask) return;
          setModalVisible(false);
          form.resetFields();
          setEditingTask(null);
        }}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={savingTask}
        okButtonProps={{ loading: savingTask }}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSalvarTask}>
          <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Título obrigatório' }]}>
            <Input placeholder="Ex: Preparar relatório de sessão" />
          </Form.Item>
          <Form.Item name="descricao" label="Descrição">
            <Input.TextArea rows={3} placeholder="Descreva a tarefa" />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="PLANEJADO">
            <Select>
              <Select.Option value="PLANEJADO">Planejado</Select.Option>
              <Select.Option value="EM_DESENVOLVIMENTO">Em Desenvolvimento</Select.Option>
              <Select.Option value="EM_TESTE">Em Teste</Select.Option>
              <Select.Option value="CONCLUIDO">Concluído</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="prioridade" label="Prioridade" initialValue="MEDIA">
            <Select>
              <Select.Option value="BAIXA">Baixa</Select.Option>
              <Select.Option value="MEDIA">Média</Select.Option>
              <Select.Option value="ALTA">Alta</Select.Option>
              <Select.Option value="URGENTE">Urgente</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="data_prevista" label="Data Prevista">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="progresso" label="Progresso (%)" initialValue={0}>
            <Input type="number" min={0} max={100} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Editar Projeto"
        open={projetoModalVisible}
        onCancel={() => {
          if (savingProjeto) return;
          setProjetoModalVisible(false);
          projetoForm.resetFields();
        }}
        onOk={() => projetoForm.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={savingProjeto}
        okButtonProps={{ loading: savingProjeto }}
        width={600}
      >
        <Form form={projetoForm} layout="vertical" onFinish={handleSalvarProjeto}>
          <Form.Item name="nome" label="Nome do Projeto" rules={[{ required: true, message: 'Nome obrigatório' }]}>
            <Input placeholder="Ex: Projeto Terapêutico Individual" />
          </Form.Item>
          <Form.Item name="descricao" label="Descrição / Meta do Projeto">
            <Input.TextArea 
              rows={4} 
              placeholder="Descreva o objetivo e meta deste projeto. Ex: Acompanhar desenvolvimento terapêutico do paciente com foco em ansiedade e autoestima." 
            />
          </Form.Item>
          <Form.Item name="icone" label="Ícone">
            <Select>
              <Select.Option value="📋">📋 Geral</Select.Option>
              <Select.Option value="🧠">🧠 Psicologia</Select.Option>
              <Select.Option value="💼">💼 Carreira</Select.Option>
              <Select.Option value="📊">📊 Avaliação</Select.Option>
              <Select.Option value="🎯">🎯 Objetivos</Select.Option>
              <Select.Option value="👥">👥 Grupo</Select.Option>
              <Select.Option value="🏥">🏥 Clínico</Select.Option>
              <Select.Option value="🎓">🎓 Educacional</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="cor" label="Cor">
            <Select>
              <Select.Option value="#3b82f6">🔵 Azul</Select.Option>
              <Select.Option value="#52c41a">🟢 Verde</Select.Option>
              <Select.Option value="#f5222d">🔴 Vermelho</Select.Option>
              <Select.Option value="#faad14">🟡 Amarelo</Select.Option>
              <Select.Option value="#722ed1">🟣 Roxo</Select.Option>
              <Select.Option value="#eb2f96">🌸 Rosa</Select.Option>
            </Select>
          </Form.Item>
          
          <div style={{ marginTop: 24, marginBottom: 12, fontWeight: 600, color: '#666' }}>📅 Datas do Projeto</div>
          <Form.Item name="data_inicio" label="Data de Início">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Quando começou?" />
          </Form.Item>
          <Form.Item name="data_meta" label="Data Meta (Previsão)">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Quando pretende concluir?" />
          </Form.Item>
          <Form.Item name="data_conclusao" label="Data de Conclusão Real">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Quando foi concluído?" />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
