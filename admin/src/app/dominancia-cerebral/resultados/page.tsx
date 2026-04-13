'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Button, Statistic, Space, Row, Col, Breadcrumb, message, Progress, Tag } from 'antd';
import { BarChartOutlined, UserOutlined, RedoOutlined, BulbOutlined, FileTextOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import apiService from '../../../services/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  avatar_url?: string;
}

interface TesteDominancia {
  id: number;
  usuario_id: number;
  concluido: boolean;
  autorizado: boolean;
  pontuacao_se: number;
  pontuacao_sd: number;
  pontuacao_ie: number;
  pontuacao_id: number;
  perfil_dominante: string;
  percentual_se: number;
  percentual_sd: number;
  percentual_ie: number;
  percentual_id: number;
  concluido_em: string;
  created_at: string;
  usuario: Usuario;
}

export default function ResultadosDominanciaPage() {
  const [resultados, setResultados] = useState<TesteDominancia[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTestes: 0,
    perfilSE: 0,
    perfilSD: 0,
    perfilIE: 0,
    perfilID: 0
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      fetchResultados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchResultados = async () => {
    try {
      setLoading(true);
      const response = await apiService.getResultadosDominancia();
      
      if (response && Array.isArray(response)) {
        setResultados(response);
        calcularEstatisticas(response);
      } else {
        message.error('Erro ao carregar resultados');
      }
    } catch (error) {
      console.error('Erro ao buscar resultados:', error);
      message.error('Erro ao buscar resultados de dominância cerebral');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (resultados: TesteDominancia[]) => {
    const total = resultados.length;
    const perfisSE = resultados.filter(r => r.perfil_dominante === 'SE').length;
    const perfisSD = resultados.filter(r => r.perfil_dominante === 'SD').length;
    const perfisIE = resultados.filter(r => r.perfil_dominante === 'IE').length;
    const perfisID = resultados.filter(r => r.perfil_dominante === 'ID').length;

    setStats({
      totalTestes: total,
      perfilSE: perfisSE,
      perfilSD: perfisSD,
      perfilIE: perfisIE,
      perfilID: perfisID
    });
  };

  const handlePermitirRefazer = async (usuarioId: number) => {
    try {
      if (window.confirm('Tem certeza que deseja permitir que este usuário refaça o teste? O resultado anterior será mantido no histórico.')) {
        await apiService.permitirRefazerTesteDominancia(usuarioId);
        message.success('Usuário autorizado a refazer o teste');
        fetchResultados();
      }
    } catch (error) {
      console.error('Erro ao permitir refazer:', error);
      message.error('Erro ao permitir refazer teste');
    }
  };

  const getQuadranteTag = (quadrante: string) => {
    const cores: { [key: string]: string } = {
      'SE': 'blue',
      'SD': 'purple',
      'IE': 'green',
      'ID': 'orange'
    };

    const nomes: { [key: string]: string } = {
      'SE': 'Analítico',
      'SD': 'Experimental',
      'IE': 'Organizacional',
      'ID': 'Interpessoal'
    };

    return <Tag color={cores[quadrante]}>{nomes[quadrante]}</Tag>;
  };

  const columns = [
    {
      title: 'Usuário',
      key: 'usuario',
      render: (record: TesteDominancia) => (
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
      title: 'Perfil Dominante',
      dataIndex: 'perfil_dominante',
      key: 'perfil_dominante',
      render: (perfil: string) => getQuadranteTag(perfil),
    },
    {
      title: 'SE (Analítico)',
      key: 'se',
      render: (record: TesteDominancia) => (
        <div>
          <div>{record.pontuacao_se}/32</div>
          <Progress 
            percent={record.percentual_se} 
            size="small" 
            showInfo={false}
            strokeColor="#1890ff"
          />
        </div>
      ),
    },
    {
      title: 'SD (Experimental)',
      key: 'sd',
      render: (record: TesteDominancia) => (
        <div>
          <div>{record.pontuacao_sd}/32</div>
          <Progress 
            percent={record.percentual_sd} 
            size="small" 
            showInfo={false}
            strokeColor="#722ed1"
          />
        </div>
      ),
    },
    {
      title: 'IE (Organizacional)',
      key: 'ie',
      render: (record: TesteDominancia) => (
        <div>
          <div>{record.pontuacao_ie}/32</div>
          <Progress 
            percent={record.percentual_ie} 
            size="small" 
            showInfo={false}
            strokeColor="#52c41a"
          />
        </div>
      ),
    },
    {
      title: 'ID (Interpessoal)',
      key: 'id',
      render: (record: TesteDominancia) => (
        <div>
          <div>{record.pontuacao_id}/32</div>
          <Progress 
            percent={record.percentual_id} 
            size="small" 
            showInfo={false}
            strokeColor="#fa8c16"
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
      key: 'actions',
      render: (record: TesteDominancia) => (
        <Space>
          <Button
            type="default"
            icon={<FileTextOutlined />}
            size="small"
            onClick={() => router.push(`/dominancia-cerebral/relatorio/${record.id}`)}
          >
            Ver Relatório
          </Button>
          <Button
            type="primary"
            icon={<RedoOutlined />}
            size="small"
            onClick={() => handlePermitirRefazer(record.usuario.id)}
          >
            Permitir Refazer
          </Button>
        </Space>
      ),
    },
  ];

  const breadcrumbItems = [
    { title: 'Home' },
    { title: <><BulbOutlined /> Dominância Cerebral</> },
    { title: 'Resultados' }
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Breadcrumb style={{ marginBottom: '24px' }} items={breadcrumbItems} />

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>
            Resultados - Dominância Cerebral
          </h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Visualize os resultados dos testes de dominância cerebral dos usuários
          </p>
        </div>

        {/* Estatísticas */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total de Testes"
                value={stats.totalTestes}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Analítico (SE)"
                value={stats.perfilSE}
                valueStyle={{ color: '#1890ff' }}
                prefix={<BulbOutlined />}
              />
            </Card>
          </Col>
          <Col span={5}>
            <Card>
              <Statistic
                title="Experimental (SD)"
                value={stats.perfilSD}
                valueStyle={{ color: '#722ed1' }}
                prefix={<BulbOutlined />}
              />
            </Card>
          </Col>
          <Col span={5}>
            <Card>
              <Statistic
                title="Organizacional (IE)"
                value={stats.perfilIE}
                valueStyle={{ color: '#52c41a' }}
                prefix={<BulbOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Interpessoal (ID)"
                value={stats.perfilID}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<BulbOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabela de Resultados */}
        <Card>
          <Table
            columns={columns}
            dataSource={resultados}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total de ${total} resultados`,
            }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
