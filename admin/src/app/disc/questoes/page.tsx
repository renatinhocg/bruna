'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Breadcrumb, message, Tag, Switch } from 'antd';
import { RedoOutlined, HomeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import apiService from '../../../services/api';

interface Opcao {
  id: number;
  texto: string;
  fator: string;
  ordem: number;
  ativo: boolean;
}

interface Questao {
  id: number;
  numero: number;
  instrucao: string;
  ordem: number;
  ativo: boolean;
  opcoes: Opcao[];
}

export default function GerenciamentoDISCPage() {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      fetchQuestoes();
    }
  }, [router]);

  const fetchQuestoes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getQuestoesDISCAdmin();
      
      if (response && Array.isArray(response)) {
        setQuestoes(response);
      } else {
        message.error('Erro ao carregar questões');
      }
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      message.error('Erro ao buscar questões do teste DISC');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuestao = async (questaoId: number, ativo: boolean) => {
    try {
      await apiService.updateQuestaoDISC(questaoId, { ativo: !ativo });
      message.success('Questão atualizada com sucesso');
      fetchQuestoes();
    } catch (error) {
      console.error('Erro ao atualizar questão:', error);
      message.error('Erro ao atualizar questão');
    }
  };

  const handleToggleOpcao = async (opcaoId: number, ativo: boolean) => {
    try {
      await apiService.updateOpcaoDISC(opcaoId, { ativo: !ativo });
      message.success('Opção atualizada com sucesso');
      fetchQuestoes();
    } catch (error) {
      console.error('Erro ao atualizar opção:', error);
      message.error('Erro ao atualizar opção');
    }
  };

  const getFatorColor = (fator: string) => {
    const cores: { [key: string]: string } = {
      'D': 'red',
      'I': 'gold',
      'S': 'green',
      'C': 'blue'
    };
    return cores[fator] || 'default';
  };

  const getFatorNome = (fator: string) => {
    const nomes: { [key: string]: string } = {
      'D': 'Dominância',
      'I': 'Influência',
      'S': 'Estabilidade',
      'C': 'Conformidade'
    };
    return nomes[fator] || fator;
  };

  const expandedRowRender = (questao: Questao) => {
    const opcoesColumns = [
      {
        title: 'Texto',
        dataIndex: 'texto',
        key: 'texto',
        width: '40%',
      },
      {
        title: 'Fator',
        dataIndex: 'fator',
        key: 'fator',
        render: (fator: string) => (
          <Tag color={getFatorColor(fator)}>
            {fator} - {getFatorNome(fator)}
          </Tag>
        ),
      },
      {
        title: 'Ordem',
        dataIndex: 'ordem',
        key: 'ordem',
        width: 80,
      },
      {
        title: 'Ativa',
        key: 'ativa',
        width: 100,
        render: (record: Opcao) => (
          <Switch
            checked={record.ativo}
            onChange={() => handleToggleOpcao(record.id, record.ativo)}
          />
        ),
      }
    ];

    return (
      <Table
        columns={opcoesColumns}
        dataSource={questao.opcoes}
        pagination={false}
        rowKey="id"
        size="small"
      />
    );
  };

  const columns = [
    {
      title: 'Questão',
      dataIndex: 'numero',
      key: 'numero',
      width: 100,
      render: (numero: number) => `Questão ${numero}`,
    },
    {
      title: 'Instrução',
      dataIndex: 'instrucao',
      key: 'instrucao',
      width: '50%',
    },
    {
      title: 'Opções',
      key: 'opcoes',
      width: 100,
      render: (record: Questao) => `${record.opcoes.length} opções`,
    },
    {
      title: 'Ativa',
      key: 'ativa',
      width: 100,
      render: (record: Questao) => (
        <Switch
          checked={record.ativo}
          onChange={() => handleToggleQuestao(record.id, record.ativo)}
        />
      ),
    }
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item href="/dashboard">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/disc">DISC</Breadcrumb.Item>
          <Breadcrumb.Item>Questões</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Gerenciamento - Questões DISC</h1>
          <Space>
            <Button 
              type="default" 
              icon={<RedoOutlined />}
              onClick={fetchQuestoes}
            >
              Atualizar
            </Button>
            <Button 
              type="primary"
              onClick={() => router.push('/disc')}
            >
              Ver Resultados
            </Button>
          </Space>
        </div>

        <Card>
          <div style={{ marginBottom: 16 }}>
            <h3>Sobre o Teste DISC</h3>
            <p>
              O DISC avalia 4 fatores comportamentais principais:
            </p>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div><Tag color="red">D</Tag> <strong>Dominância:</strong> Focado em resultados, direto e assertivo</div>
              <div><Tag color="gold">I</Tag> <strong>Influência:</strong> Comunicativo, entusiasta e persuasivo</div>
              <div><Tag color="green">S</Tag> <strong>Estabilidade:</strong> Paciente, leal e harmonioso</div>
              <div><Tag color="blue">C</Tag> <strong>Conformidade:</strong> Analítico, preciso e sistemático</div>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={questoes}
            loading={loading}
            rowKey="id"
            expandable={{
              expandedRowRender,
              expandRowByClick: true,
            }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total de ${total} questões`,
            }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
