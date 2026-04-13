'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Button, Statistic, Space, Row, Col, Breadcrumb, message } from 'antd';
import { BarChartOutlined, EyeOutlined, DownloadOutlined, UserOutlined, PlayCircleOutlined, RedoOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import apiService from '../../../services/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  avatar_url?: string;
}

interface Categoria {
  id: number;
  nome: string;
  cor?: string;
  caracteristicas_inteligente?: string[];
  carreiras_associadas?: string[];
}

interface Resultado {
  id: number;
  usuario: Usuario;
  categoria: Categoria;
  pontuacao: number;
  percentual?: number;
  nivel?: string;
  status: string;
  observacoes?: string;
  data_teste: string;
  created_at: string;
  _count?: {
    respostas: number;
  };
}


interface UsuarioComResultados {
  usuario: Usuario;
  resultados: Resultado[];
}

interface ResultadoRecente {
  id: number;
  usuario: string;
  categoria: string;
  data: string;
}

export default function ResultadosPage() {
  const [usuariosComResultados, setUsuariosComResultados] = useState<UsuarioComResultados[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    mediaPontuacao: 0,
    mediaPercentual: 0,
    inteligenciasPredominantes: [] as string[],
    recentes: [] as ResultadoRecente[]
  });
  const router = useRouter();


  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      fetchResultadosAdmin();
    }
  }, [router]);

  // Busca todos os testes concluídos (admin)
  const fetchResultadosAdmin = async () => {
    try {
      setLoading(true);
  const response = await apiService.getTestesInteligenciaAdmin();
      if (response.success) {
        const testes = response.data || [];
        // Agrupar por usuário
        const agrupado: { [usuarioId: number]: UsuarioComResultados } = {};
        type Usuario = { id: number; nome: string; email: string; avatar_url?: string };
        type Categoria = { id: number; nome: string; cor?: string; caracteristicas_inteligente?: string[]; carreiras_associadas?: string[] };
        type ResultadoDominante = { categoria: Categoria; pontuacao: number; percentual: number };
        type Teste = { id: number; usuario: Usuario; resultados: ResultadoDominante[]; autorizado: boolean; created_at: string };
        (testes as Teste[]).forEach((teste) => {
          if (!teste.usuario) return;
          if (!agrupado[teste.usuario.id]) {
            agrupado[teste.usuario.id] = {
              usuario: teste.usuario,
              resultados: [],
            };
          }
          if (Array.isArray(teste.resultados) && teste.resultados.length > 0) {
            const r = teste.resultados[0];
            agrupado[teste.usuario.id].resultados.push({
              id: teste.id,
              usuario: teste.usuario,
              categoria: r.categoria,
              pontuacao: r.pontuacao,
              percentual: r.percentual,
              status: teste.autorizado ? 'Autorizado' : 'Pendente',
              data_teste: teste.created_at,
              created_at: teste.created_at,
              _count: undefined,
            });
          }
        });
        const usuariosAgrupados = Object.values(agrupado);
        setUsuariosComResultados(usuariosAgrupados);
        // Calcular estatísticas
        const resultados = usuariosAgrupados.flatMap(u => u.resultados);
        if (resultados.length > 0) {
          const mediaPontuacao = resultados.reduce((acc, r) => acc + (r.pontuacao || 0), 0) / resultados.length;
          const mediaPercentual = resultados.reduce((acc, r) => acc + (r.percentual || 0), 0) / resultados.length;
          const inteligenciasOrdenadas = resultados
            .sort((a, b) => (b.percentual || 0) - (a.percentual || 0))
            .slice(0, 3)
            .map(r => r.categoria?.nome || '');
          setStats({
            totalUsuarios: usuariosAgrupados.length,
            mediaPontuacao: Math.round(mediaPontuacao * 10) / 10,
            mediaPercentual: Math.round(mediaPercentual * 10) / 10,
            inteligenciasPredominantes: inteligenciasOrdenadas,
            recentes: []
          });
        }
      } else {
        message.error('Erro ao carregar resultados');
      }
    } catch (error) {
      console.error('Erro ao buscar resultados:', error);
      message.error('Erro ao carregar resultados');
    } finally {
      setLoading(false);
    }
  };

  // Redirecionar para página de detalhes do usuário
  const handleViewResultadosUsuario = (usuario: UsuarioComResultados) => {
    router.push(`/multiplas-inteligencias/resultados/${usuario.usuario.id}`);
  };

  const handleTestarTeste = () => {
    // Redirecionar para a página de teste das múltiplas inteligências
    router.push('/teste-multiplas-inteligencias');
  };

  const handlePermitirRefazer = async (usuario: UsuarioComResultados) => {
    console.log('handlePermitirRefazer chamado', { usuario });
    
    if (!window.confirm(`Tem certeza que deseja permitir que ${usuario.usuario.nome} refaça o teste? O histórico anterior será mantido.`)) {
      console.log('Usuário cancelou a confirmação');
      return;
    }

    try {
      console.log('Iniciando requisição para permitir refazer teste...');
      setLoading(true);
      
      const response = await apiService.permitirRefazerTeste(usuario.usuario.id);
      console.log('Resposta recebida:', response);
      
      if (response.success) {
        message.success('Usuário liberado para refazer o teste!');
  await fetchResultadosAdmin(); // Recarregar a lista
      } else {
        message.error('Erro ao liberar usuário');
      }
    } catch (error) {
      console.error('Erro ao liberar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      message.error('Erro ao liberar usuário: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Usuário',
      key: 'usuario',
      render: (_text: string, record: UsuarioComResultados) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ fontSize: '20px', color: '#1890ff', marginRight: 12 }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.usuario.nome}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {record.usuario.email}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Qtd. Testes',
      key: 'qtd',
      render: (_text: string, record: UsuarioComResultados) => record.resultados.length
    },
    {
      title: 'Último Teste',
      key: 'ultimo',
      render: (_text: string, record: UsuarioComResultados) => {
        const ult = record.resultados.reduce((a: Resultado, b: Resultado) => new Date(a.data_teste) > new Date(b.data_teste) ? a : b);
        return new Date(ult.data_teste).toLocaleDateString('pt-BR');
      }
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_text: string, record: UsuarioComResultados) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewResultadosUsuario(record)}
          >
            Visualizar Resultados
          </Button>
          <Button
            type="default"
            icon={<RedoOutlined />}
            size="small"
            onClick={() => handlePermitirRefazer(record)}
          >
            Permitir Refazer
          </Button>
          {/* Botão de Aprovar/Autorizar para cada teste não autorizado */}
          {record.resultados.map((resultado) =>
            resultado.status !== 'Autorizado' ? (
              <Button
                key={resultado.id}
                type="primary"
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                size="small"
                onClick={async () => {
                  try {
                    const resp = await apiService.autorizarTesteInteligencia(resultado.id);
                    if (resp.success) {
                      message.success('Teste autorizado com sucesso!');
                      await fetchResultadosAdmin();
                    } else {
                      message.error(resp.message || 'Erro ao autorizar teste');
                    }
                  } catch {
                    message.error('Erro ao autorizar teste');
                  }
                }}
              >
                Aprovar
              </Button>
            ) : null
          )}
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Breadcrumb 
          style={{ marginBottom: 16 }}
          items={[
            {
              title: 'Dashboard',
              href: '/dashboard',
            },
            {
              title: 'Múltiplas Inteligências',
              href: '/multiplas-inteligencias',
            },
            {
              title: 'Resultados',
            },
          ]}
        />

        {/* Estatísticas Gerais */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={stats.totalUsuarios === 1 ? "Teste Realizado" : "Testes Realizados"}
                value={stats.totalUsuarios}
                prefix={<BarChartOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Média de Pontuação"
                value={stats.mediaPontuacao}
                precision={1}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Média Percentual"
                value={stats.mediaPercentual}
                precision={1}
                suffix="%"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Inteligência Predominante"
                value={stats.inteligenciasPredominantes.length > 0 ? stats.inteligenciasPredominantes[0] : 'N/A'}
                valueStyle={{ 
                  color: '#1890ff',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
                prefix={<UserOutlined />}
              />
            </Col>
          </Row>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <BarChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                Resultados dos Testes
              </h2>
              <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                Visualize e gerencie os resultados dos testes de múltiplas inteligências
              </p>
            </div>
            <Space>
              <Button
                type="default"
                icon={<PlayCircleOutlined />}
                size="large"
                onClick={handleTestarTeste}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
              >
                Testar o Teste
              </Button>
              <Button
                icon={<DownloadOutlined />}
                size="large"
                onClick={() => message.info('Funcionalidade em desenvolvimento')}
              >
                Exportar Resultados
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={usuariosComResultados}
            rowKey={record => record.usuario.id}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} de ${total} usuários`,
            }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
