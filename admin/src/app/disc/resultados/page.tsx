'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Statistic, Space, Row, Col, Breadcrumb, message, Progress, Tag } from 'antd';
import { BarChartOutlined, UserOutlined, RedoOutlined, HomeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import apiService from '../../../services/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface TesteDISC {
  id: number;
  usuario_id: number;
  concluido: boolean;
  autorizado: boolean;
  pontuacao_d: number;
  pontuacao_i: number;
  pontuacao_s: number;
  pontuacao_c: number;
  percentual_d: number;
  percentual_i: number;
  percentual_s: number;
  percentual_c: number;
  perfil_primario: string;
  perfil_secundario: string;
  estilo_combinado: string;
  concluido_em: string;
  created_at: string;
  usuario: Usuario;
}

export default function ResultadosDISCPage() {
  const [resultados, setResultados] = useState<TesteDISC[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTestes: 0,
    perfilD: 0,
    perfilI: 0,
    perfilS: 0,
    perfilC: 0
  });
  const router = useRouter();

  const fetchResultados = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getResultadosDISC();
      
      if (response && Array.isArray(response)) {
        setResultados(response);
        calcularEstatisticas(response);
      } else {
        message.error('Erro ao carregar resultados');
      }
    } catch (error) {
      console.error('Erro ao buscar resultados:', error);
      message.error('Erro ao buscar resultados do teste DISC');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      fetchResultados();
    }
  }, [router, fetchResultados]);

  const calcularEstatisticas = (resultados: TesteDISC[]) => {
    const total = resultados.filter(r => r.concluido).length;
    const perfisD = resultados.filter(r => r.perfil_primario === 'D').length;
    const perfisI = resultados.filter(r => r.perfil_primario === 'I').length;
    const perfisS = resultados.filter(r => r.perfil_primario === 'S').length;
    const perfisC = resultados.filter(r => r.perfil_primario === 'C').length;

    setStats({
      totalTestes: total,
      perfilD: perfisD,
      perfilI: perfisI,
      perfilS: perfisS,
      perfilC: perfisC
    });
  };

  const getPerfilTag = (perfil: string) => {
    const cores: { [key: string]: string } = {
      'D': 'red',
      'I': 'gold',
      'S': 'green',
      'C': 'blue'
    };

    const nomes: { [key: string]: string } = {
      'D': 'Dominância',
      'I': 'Influência',
      'S': 'Estabilidade',
      'C': 'Conformidade'
    };

    return <Tag color={cores[perfil]}>{perfil} - {nomes[perfil]}</Tag>;
  };

  const columns = [
    {
      title: 'Usuário',
      key: 'usuario',
      render: (record: TesteDISC) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{record.usuario?.nome || 'N/A'}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>{record.usuario?.email || ''}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Perfil Primário',
      dataIndex: 'perfil_primario',
      key: 'perfil_primario',
      render: (perfil: string) => getPerfilTag(perfil),
    },
    {
      title: 'Estilo',
      dataIndex: 'estilo_combinado',
      key: 'estilo_combinado',
      render: (estilo: string) => <Tag color="purple">{estilo}</Tag>,
    },
    {
      title: 'D (Dominância)',
      key: 'd',
      render: (record: TesteDISC) => (
        <div style={{ width: 120 }}>
          <div style={{ fontSize: '12px', marginBottom: 4 }}>
            {record.pontuacao_d} pts ({record.percentual_d.toFixed(0)}%)
          </div>
          <Progress 
            percent={record.percentual_d} 
            strokeColor="#ff4d4f"
            showInfo={false}
            size="small"
          />
        </div>
      ),
    },
    {
      title: 'I (Influência)',
      key: 'i',
      render: (record: TesteDISC) => (
        <div style={{ width: 120 }}>
          <div style={{ fontSize: '12px', marginBottom: 4 }}>
            {record.pontuacao_i} pts ({record.percentual_i.toFixed(0)}%)
          </div>
          <Progress 
            percent={record.percentual_i} 
            strokeColor="#faad14"
            showInfo={false}
            size="small"
          />
        </div>
      ),
    },
    {
      title: 'S (Estabilidade)',
      key: 's',
      render: (record: TesteDISC) => (
        <div style={{ width: 120 }}>
          <div style={{ fontSize: '12px', marginBottom: 4 }}>
            {record.pontuacao_s} pts ({record.percentual_s.toFixed(0)}%)
          </div>
          <Progress 
            percent={record.percentual_s} 
            strokeColor="#52c41a"
            showInfo={false}
            size="small"
          />
        </div>
      ),
    },
    {
      title: 'C (Conformidade)',
      key: 'c',
      render: (record: TesteDISC) => (
        <div style={{ width: 120 }}>
          <div style={{ fontSize: '12px', marginBottom: 4 }}>
            {record.pontuacao_c} pts ({record.percentual_c.toFixed(0)}%)
          </div>
          <Progress 
            percent={record.percentual_c} 
            strokeColor="#1890ff"
            showInfo={false}
            size="small"
          />
        </div>
      ),
    },
    {
      title: 'Data',
      dataIndex: 'concluido_em',
      key: 'concluido_em',
      render: (data: string) => new Date(data).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (record: TesteDISC) => (
        <Button 
          type="link" 
          onClick={() => router.push(`/disc/resultados/${record.id}`)}
        >
          Ver Detalhes
        </Button>
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
          <Breadcrumb.Item>Resultados</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Resultados - Teste DISC</h1>
          <Space>
            <Button 
              type="default" 
              icon={<RedoOutlined />}
              onClick={fetchResultados}
            >
              Atualizar
            </Button>
            <Button 
              type="primary"
              onClick={() => router.push('/disc')}
            >
              Gerenciar Questões
            </Button>
          </Space>
        </div>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total de Testes"
                value={stats.totalTestes}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={4.5}>
            <Card>
              <Statistic
                title="Perfil D"
                value={stats.perfilD}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={4.5}>
            <Card>
              <Statistic
                title="Perfil I"
                value={stats.perfilI}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={4.5}>
            <Card>
              <Statistic
                title="Perfil S"
                value={stats.perfilS}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4.5}>
            <Card>
              <Statistic
                title="Perfil C"
                value={stats.perfilC}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <Card>
          <Table
            columns={columns}
            dataSource={resultados}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total de ${total} resultados`,
            }}
            scroll={{ x: 1400 }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
