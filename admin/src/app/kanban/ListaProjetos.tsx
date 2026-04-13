import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, message, Spin, Popconfirm } from 'antd';
import apiService from '@/services/api';


type Projeto = {
  id: number;
  nome: string;
};

interface ListaProjetosProps {
  onSelecionar: (projeto: Projeto) => void;
}



const ListaProjetos: React.FC<ListaProjetosProps> = ({ onSelecionar }) => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editandoProjeto, setEditandoProjeto] = useState<Projeto | null>(null);

  const fetchProjetos = async () => {
    setLoading(true);
    try {
      const res = await apiService.getProjetos();
      setProjetos(res.data || []);
    } catch {
      message.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjetos();
  }, []);

  const handleAddProjeto = async (values: { nome: string }) => {
    try {
      if (editandoProjeto) {
        // Editar projeto existente
        const res = await apiService.updateProjeto(editandoProjeto.id, { nome: values.nome });
        setProjetos(projetos.map(p => p.id === editandoProjeto.id ? res.data : p));
        message.success('Projeto atualizado!');
      } else {
        // Criar novo projeto
        const res = await apiService.createProjeto({ nome: values.nome });
        setProjetos([...projetos, res.data]);
        message.success('Projeto criado!');
      }
      setModalVisible(false);
      setEditandoProjeto(null);
      form.resetFields();
    } catch {
      message.error('Erro ao salvar projeto');
    }
  };

  const handleEditarProjeto = (projeto: Projeto) => {
    setEditandoProjeto(projeto);
    form.setFieldsValue({ nome: projeto.nome });
    setModalVisible(true);
  };

  const handleExcluirProjeto = async (id: number) => {
    try {
      await apiService.deleteProjeto(id);
      setProjetos(projetos.filter(p => p.id !== id));
      message.success('Projeto excluído!');
    } catch {
      message.error('Erro ao excluir projeto');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Projetos</h2>
        <Button type="primary" onClick={() => setModalVisible(true)}>Novo Projeto</Button>
      </div>
      {loading ? (
        <Spin />
      ) : (
        <ul>
          {projetos.map((projeto) => (
            <li key={projeto.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button type="link" onClick={() => onSelecionar(projeto)}>{projeto.nome}</Button>
              <Button size="small" onClick={() => handleEditarProjeto(projeto)}>Editar</Button>
              <Popconfirm title="Excluir projeto?" onConfirm={() => handleExcluirProjeto(projeto.id)} okText="Sim" cancelText="Não">
                <Button size="small" danger>Excluir</Button>
              </Popconfirm>
            </li>
          ))}
        </ul>
      )}

      <Modal
        title={editandoProjeto ? 'Editar Projeto' : 'Novo Projeto'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setEditandoProjeto(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editandoProjeto ? 'Salvar' : 'Criar'}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleAddProjeto}>
          <Form.Item
            name="nome"
            label="Nome do Projeto"
            rules={[{ required: true, message: 'Informe o nome do projeto' }]}
          >
            <Input placeholder="Nome do projeto" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListaProjetos;
