"use client";
import { useRouter } from "next/navigation";
// Componente de Coluna do Kanban com suporte a drop
function KanbanColumn({ column, columnTasks, onEdit, onDelete }: { column: ColumnConfig, columnTasks: Task[], onEdit: (task: Task | null) => void, onDelete: (id: number) => void }) {
  const containerId = String(column.id);
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  return (
    <SortableContext key={containerId} items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        style={{
          background: '#18181b',
          borderRadius: 12,
          padding: 12,
          minHeight: 420,
          boxShadow: '0 2px 8px #0000000a',
          display: 'flex',
          flexDirection: 'column',
          border: isOver ? `2px solid ${column.color}` : '1px solid #232323',
          transition: 'border 0.2s',
        }}
        id={containerId}
        data-status={containerId}
      >
        <div style={{
          marginBottom: 8,
          paddingBottom: 8,
          borderBottom: `2px solid ${column.color}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 600,
          color: column.color,
          fontSize: 15
        }}>
          <span style={{ letterSpacing: 1 }}>{column.title.toUpperCase()}</span>
          <span style={{ background: '#232323', color: '#fff', borderRadius: 8, padding: '2px 8px', fontSize: 13, marginLeft: 6 }}>{columnTasks.length}</span>
          <span style={{ flex: 1 }} />
          <Button type="text" size="small" style={{ color: '#888' }} icon={<PlusOutlined />} onClick={() => onEdit(null)} />
        </div>

        <div style={{ minHeight: 300, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {columnTasks.map(task => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>

        <Button type="link" style={{ color: '#aaa', marginTop: 8, fontWeight: 500 }} icon={<PlusOutlined />} onClick={() => onEdit(null)}>
          Adicionar Tarefa
        </Button>
      </div>
    </SortableContext>
  );
}

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button, Modal, Form, Input, Select, DatePicker, Tag, message, Statistic, Row, Col } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import React, { useCallback } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import apiService from '@/services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;


// Tipos
type TaskStatus = 'PLANEJADO' | 'EM_DESENVOLVIMENTO' | 'HOMOLOGACAO' | 'PRODUCAO';
type TaskPrioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

interface Task {
  id: number;
  titulo: string;
  descricao?: string;
  status: TaskStatus;
  prioridade: TaskPrioridade;
  data_inicio?: string;
  data_prevista?: string;
  data_conclusao?: string;
  tags?: string[];
  responsavel?: string;
  created_at: string;
  updated_at: string;
}

interface KanbanStats {
  porStatus: {
    planejado: number;
    emDesenvolvimento: number;
    homologacao: number;
    producao: number;
  };
  porPrioridade: {
    alta: number;
    urgente: number;
  };
  total: number;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  color: string;
}

interface Admin {
  id: number;
  nome: string;
  tipo: string;
}

// Configuração das colunas
const COLUMNS: ColumnConfig[] = [
  { id: 'PLANEJADO', title: 'Planejado', color: '#1890ff' },
  { id: 'EM_DESENVOLVIMENTO', title: 'Em Desenvolvimento', color: '#faad14' },
  { id: 'HOMOLOGACAO', title: 'Homologação', color: '#722ed1' },
  { id: 'PRODUCAO', title: 'Produção', color: '#52c41a' }
];

// Mapeamento de cores de prioridade
const PRIORIDADE_COLORS: Record<TaskPrioridade, string> = {
  BAIXA: 'default',
  MEDIA: 'blue',
  ALTA: 'orange',
  URGENTE: 'red'
};

// Componente de Card Arrastável
function DraggableTaskCard({ task, onEdit, onDelete }: { task: Task; onEdit: (task: Task | null) => void; onDelete: (id: number) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab'
  };

  return (
    <div ref={setNodeRef} style={{ ...style, background: '#23232b', borderRadius: 10, boxShadow: '0 2px 8px #0000000a', padding: 12, marginBottom: 0, border: '1px solid #232323', color: '#fff', position: 'relative', minHeight: 60 }} {...attributes} {...listeners}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <span style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>{task.titulo}</span>
        <Tag color={PRIORIDADE_COLORS[task.prioridade]} style={{ fontSize: 11, borderRadius: 6, marginLeft: 4 }}>{task.prioridade}</Tag>
        <Button type="text" size="small" icon={<EditOutlined />} onClick={e => { e.stopPropagation(); onEdit(task); }} style={{ color: '#888' }} />
        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={e => { e.stopPropagation(); onDelete(task.id); }} style={{ color: '#888' }} />
        <Button type="text" size="small" icon={<span style={{ fontSize: 18, fontWeight: 700, color: '#aaa' }}>⋯</span>} style={{ color: '#888' }} />
      </div>
      {task.descricao && (
        <div style={{ fontSize: 12, color: '#bbb', marginBottom: 4, marginTop: 2 }}>
          {task.descricao.length > 80 ? `${task.descricao.substring(0, 80)}...` : task.descricao}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        {task.tags && task.tags.length > 0 && (
          <span style={{ display: 'flex', gap: 4 }}>
            {task.tags.map((tag, idx) => (
              <Tag key={idx} style={{ fontSize: 10, borderRadius: 5, background: '#18181b', color: '#fff', border: 'none', padding: '1px 7px' }}>{tag}</Tag>
            ))}
          </span>
        )}
        {task.responsavel && (
          <span style={{ fontSize: 12, color: '#aaa', display: 'flex', alignItems: 'center', gap: 3 }}><UserOutlined /> {task.responsavel}</span>
        )}
        {task.data_prevista && (
          <span style={{ fontSize: 12, color: '#aaa', display: 'flex', alignItems: 'center', gap: 3 }}><CalendarOutlined /> {dayjs(task.data_prevista).format('DD/MM')}</span>
        )}
      </div>
    </div>
  );
}

// Componente principal
// Aceita prop opcional de projeto selecionado
const KanbanPage = () => {
  // Filtros
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterPrioridade, setFilterPrioridade] = useState<string[]>([]);
  const [filterResponsavel, setFilterResponsavel] = useState<string[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);

  // Gerar lista de tags únicas
  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || [])));
  const allResponsaveis = Array.from(new Set(tasks.map(t => t.responsavel).filter(Boolean)));

  // Filtrar tasks conforme filtros
  const filteredTasks = tasks.filter(task => {
    const tagsOk = filterTags.length === 0 || (task.tags || []).some(tag => filterTags.includes(tag));
    const prioridadeOk = filterPrioridade.length === 0 || filterPrioridade.includes(task.prioridade);
    const responsavelOk = filterResponsavel.length === 0 || (task.responsavel ? filterResponsavel.includes(task.responsavel) : false);
    return tagsOk && prioridadeOk && responsavelOk;
  });
  const [stats, setStats] = useState<KanbanStats | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
    const [admins, setAdmins] = useState<Admin[]>([]);
  const searchParams = useSearchParams();
  // Buscar admins para o campo responsável
  useEffect(() => {
      apiService.getUsers().then((users: Admin[]) => {
        setAdmins(users.filter((u: Admin) => u.tipo === 'admin'));
    });
  }, [searchParams]);
  const [projetoNome, setProjetoNome] = useState<string>("");

  // Log dos ids das colunas para debug
  console.log('🟨 Colunas Kanban ids:', COLUMNS.map(c => c.id));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadData = useCallback(async () => {
    try {
      const projectId = searchParams.get('id');
      const [tasksData, statsData] = await Promise.all([
        apiService.getTasks(projectId),
        apiService.getKanbanStats(projectId)
      ]);
      console.log('🟦 Tasks recebidas do backend:', tasksData);
      setTasks(tasksData);
      setStats(statsData);
    } catch {
      message.error('Erro ao carregar dados');
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
    // Buscar nome do projeto
    const id = searchParams.get('id');
    if (id) {
      apiService.getProjetoById(id).then(res => {
        setProjetoNome(res.data?.nome || "");
      }).catch(() => setProjetoNome(""));
    }
  }, [searchParams, loadData]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;



    if (!over) {
      console.log('🟧 handleDragEnd: over está undefined/null');
      return;
    }

    const taskId = active.id as number;
    console.log('🟧 handleDragEnd: over.id =', over.id);
    // Garante que o status é string do enum
    let newStatus = over.id;
    const statusEnumArray = ['PLANEJADO', 'EM_DESENVOLVIMENTO', 'HOMOLOGACAO', 'PRODUCAO'];
    if (typeof newStatus === 'number') {
      newStatus = statusEnumArray[newStatus] || 'PLANEJADO';
    }
    if (!statusEnumArray.includes(newStatus)) {
      newStatus = 'PLANEJADO';
    }
    const statusTyped = newStatus as TaskStatus;
    console.log('🟧 handleDragEnd: statusTyped a ser enviado =', statusTyped);

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: statusTyped } : task
      )
    );

    try {
      await apiService.updateTaskStatus(taskId, statusTyped);
      message.success('Status atualizado com sucesso!');
      loadData(); // Recarregar para pegar timestamps atualizados
    } catch {
      message.error('Erro ao atualizar status');
      loadData(); // Reverter em caso de erro
    }
  };

  const handleOpenModal = (task: Task | null) => {
    if (task) {
      setEditingTask(task);
      form.setFieldsValue({
        titulo: task.titulo,
        descricao: task.descricao,
        status: task.status,
        prioridade: task.prioridade,
        data_inicio: task.data_inicio ? dayjs(task.data_inicio) : null,
        data_vencimento: task.data_prevista ? dayjs(task.data_prevista) : null,
        data_conclusao: task.data_conclusao ? dayjs(task.data_conclusao) : null,
        tags: task.tags || [],
        responsaveis: task.responsavel ? [task.responsavel] : []
      });
    } else {
      setEditingTask(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingTask(null);
    form.resetFields();
  };

interface FormValues {
  titulo: string;
  descricao?: string;
  status: TaskStatus;
  prioridade: TaskPrioridade;
  data_inicio?: dayjs.Dayjs;
  data_vencimento?: dayjs.Dayjs;
  data_conclusao?: dayjs.Dayjs;
  tags?: string[];
  responsaveis?: string[];
}

  const handleSubmit = async (values: FormValues) => {
    try {
      console.log('Submitting task:', values);
      const projectId = searchParams.get('id');
      const taskData = {
        titulo: values.titulo,
        descricao: values.descricao,
        status: values.status || 'PLANEJADO',
        prioridade: values.prioridade || 'MEDIA',
        data_inicio: values.data_inicio ? values.data_inicio.toISOString() : null,
        data_prevista: values.data_vencimento ? values.data_vencimento.toISOString() : null,
        data_conclusao: values.data_conclusao ? values.data_conclusao.toISOString() : null,
        tags: Array.isArray(values.tags) ? values.tags.filter((t: string) => t && typeof t === 'string') : [],
        responsavel: Array.isArray(values.responsaveis) && values.responsaveis.length > 0 ? values.responsaveis[0] : null,
        projeto_id: projectId ? Number(projectId) : undefined
      };

      console.log('Task data:', taskData);

      if (editingTask) {
        await apiService.updateTask(editingTask.id, taskData);
        message.success('Task atualizada com sucesso!');
      } else {
        await apiService.createTask(taskData);
        message.success('Task criada com sucesso!');
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar task:', error);
      message.error('Erro ao salvar task: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const [deleteTaskModal, setDeleteTaskModal] = React.useState<{ open: boolean, id?: number }>({ open: false });
  const handleDelete = (id: number) => {
    console.log('Clicou para deletar task', id);
    setDeleteTaskModal({ open: true, id });
  };
  const confirmDeleteTask = async () => {
    if (!deleteTaskModal.id) return;
    try {
      await apiService.deleteTask(deleteTaskModal.id);
      message.success('Task excluída com sucesso!');
      loadData();
    } catch (error) {
      message.error('Erro ao excluir task');
      console.error(error);
    }
    setDeleteTaskModal({ open: false });
  };



  const router = useRouter();
  return (
    <div style={{ padding: 24 }}>
      <Button type="default" onClick={() => router.push('/projetos')} style={{ marginBottom: 16 }}>
        ← Voltar para Projetos
      </Button>
      <Modal
        open={deleteTaskModal.open}
        onCancel={() => setDeleteTaskModal({ open: false })}
        onOk={confirmDeleteTask}
        okText="Excluir"
        okButtonProps={{ danger: true }}
        cancelText="Cancelar"
      >
        <div style={{ color: 'red', fontWeight: 700 }}>DEBUG: Modal de exclusão renderizado</div>
        Tem certeza que deseja excluir esta task?
      </Modal>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Gestão de Projetos</h1>
  <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
          Nova Task
        </Button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic title="Total de Tasks" value={stats.total} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Em Desenvolvimento" 
                value={stats.porStatus.emDesenvolvimento} 
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Prioridade Alta" 
                value={stats.porPrioridade.alta} 
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Produção" 
                value={stats.porStatus.producao} 
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros no topo */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <FilterOutlined style={{ fontSize: 20, color: '#c026d3' }} />
        <Select
          mode="multiple"
          allowClear
          placeholder="Etiquetas"
          style={{ minWidth: 120 }}
          value={filterTags}
          onChange={setFilterTags}
          options={allTags.map(tag => ({ value: tag, label: tag }))}
        />
        <Select
          mode="multiple"
          allowClear
          placeholder="Prioridade"
          style={{ minWidth: 120 }}
          value={filterPrioridade}
          onChange={setFilterPrioridade}
          options={Object.keys(PRIORIDADE_COLORS).map(p => ({ value: p, label: p.charAt(0) + p.slice(1).toLowerCase() }))}
        />
        <Select
          mode="multiple"
          allowClear
          placeholder="Responsável"
          style={{ minWidth: 120 }}
          value={filterResponsavel}
          onChange={setFilterResponsavel}
          options={allResponsaveis.map(r => ({ value: r, label: r }))}
        />
      </div>
      {projetoNome && (
        <h2 style={{ marginBottom: 24, fontWeight: 600, fontSize: 22 }}>
          Kanban do Projeto: <span style={{ color: '#1890ff' }}>{projetoNome}</span>
        </h2>
      )}
      {/* Kanban Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              columnTasks={filteredTasks.filter(t => t.status === column.id)}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DndContext>

      {/* Modal de Criar/Editar */}
      <Modal
        title={editingTask ? 'Editar Task' : 'Nova Task'}
        open={modalVisible}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="titulo"
            label="Título"
            rules={[{ required: true, message: 'Título é obrigatório' }]}
          >
            <Input placeholder="Título da task" />
          </Form.Item>

          <Form.Item name="descricao" label="Descrição">
            <TextArea rows={3} placeholder="Descrição detalhada" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Status" initialValue="PLANEJADO">
                <Select>
                  <Select.Option value="PLANEJADO">Planejado</Select.Option>
                  <Select.Option value="EM_DESENVOLVIMENTO">Em Desenvolvimento</Select.Option>
                  <Select.Option value="HOMOLOGACAO">Homologação</Select.Option>
                  <Select.Option value="PRODUCAO">Produção</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="prioridade" label="Prioridade" initialValue="MEDIA">
                <Select>
                  <Select.Option value="BAIXA">Baixa</Select.Option>
                  <Select.Option value="MEDIA">Média</Select.Option>
                  <Select.Option value="ALTA">Alta</Select.Option>
                  <Select.Option value="URGENTE">Urgente</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="responsaveis" label="Responsáveis">
                <Select
                  mode="multiple"
                  showSearch
                  placeholder="Selecione os responsáveis"
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const child = option?.children;
                    return String(child).toLowerCase().includes(input.toLowerCase());
                  }}
                  allowClear
                >
                  {admins.map(admin => (
                    <Select.Option key={admin.id} value={admin.nome}>{admin.nome}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="data_inicio" label="Data de Início">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Selecione a data de início" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="data_vencimento" label="Data de Vencimento">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Selecione a data de vencimento" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="data_conclusao" label="Data de Conclusão">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Selecione a data de conclusão" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Adicione ou selecione tags"
              allowClear
              options={allTags.map(tag => ({ value: tag, label: tag }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default KanbanPage;
