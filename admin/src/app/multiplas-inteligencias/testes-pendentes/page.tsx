'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Button, message, Typography, Breadcrumb, Tag, Space, Modal } from 'antd';
import { CheckOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import apiService from '../../../services/api';

const { Title, Text } = Typography;
const { confirm } = Modal;

interface TestesPendentes {
  id: number;
  nome_usuario: string;
  email_usuario: string;
  concluido: boolean;
  autorizado: boolean;
  created_at: string;
  inteligencia_dominante?: string;
}

export default function TestesPendentes() {
  const [testes, setTestes] = useState<TestesPendentes[]>([]);
  const [loading, setLoading] = useState(true);
  const [autorizando, setAutorizando] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      carregarTestesPendentes();
    }
  }, [router]);

  const carregarTestesPendentes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTestesInteligencia();
      
      if (response.success) {
        // Filtrar apenas testes concluídos mas não autorizados
        const testesPendentes = response.data.filter(
          (teste: TestesPendentes) => teste.concluido && !teste.autorizado
        );
        setTestes(testesPendentes);
      } else {
        message.error('Erro ao carregar testes pendentes');
      }
    } catch (error) {
      console.error('Erro ao carregar testes:', error);
      message.error('Erro ao carregar testes pendentes');
    } finally {
      setLoading(false);
    }
  };

  const autorizarTeste = async (id: number, nomeUsuario: string) => {
    confirm({
      title: 'Autorizar Teste',
      content: `Deseja autorizar o teste de ${nomeUsuario}? O usuário receberá acesso aos resultados.`,
      okText: 'Autorizar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          setAutorizando(id);
          const response = await apiService.autorizarTesteInteligencia(id);
          
          if (response.success) {
            message.success('Teste autorizado com sucesso!');
            carregarTestesPendentes(); // Recarregar lista
          } else {
            message.error(response.message || 'Erro ao autorizar teste');
          }
        } catch (error) {
          console.error('Erro ao autorizar teste:', error);
          message.error('Erro ao autorizar teste');
        } finally {
          setAutorizando(null);
        }
      }
    });
  };

  const visualizarTeste = (id: number) => {
    router.push(`/multiplas-inteligencias/testes-pendentes/${id}`);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Nome do Usuário',
      dataIndex: 'nome_usuario',
      key: 'nome_usuario',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'E-mail',
      dataIndex: 'email_usuario',
      key: 'email_usuario',
    },
    {
      title: 'Data de Conclusão',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => {
        const dataFormatada = new Date(date).toLocaleString('pt-BR');
        return dataFormatada;
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          Aguardando Autorização
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: TestesPendentes) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => visualizarTeste(record.id)}
          >
            Visualizar
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={autorizando === record.id}
            onClick={() => autorizarTeste(record.id, record.nome_usuario)}
          >
            Autorizar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Breadcrumb 
          style={{ marginBottom: 16 }}
          items={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Múltiplas Inteligências', href: '/multiplas-inteligencias' },
            { title: 'Testes Pendentes' }
          ]}
        />

        <Card>
          <div style={{ marginBottom: 24 }}>
            <Title level={3}>Testes Pendentes de Autorização</Title>
            <Text type="secondary">
              Visualize e autorize testes concluídos para liberar os resultados aos usuários.
            </Text>
          </div>

          <Table
            columns={columns}
            dataSource={testes}
            loading={loading}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} testes`,
            }}
            locale={{
              emptyText: 'Nenhum teste pendente de autorização'
            }}
          />

          {testes.length > 0 && (
            <div style={{ 
              marginTop: 16, 
              padding: 16, 
              background: '#f0f8ff', 
              borderRadius: 8,
              border: '1px solid #91d5ff'
            }}>
              <Text>
                <strong>Instrução:</strong> Após autorizar um teste, o usuário receberá um e-mail 
                informando que seus resultados estão disponíveis para visualização.
              </Text>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
