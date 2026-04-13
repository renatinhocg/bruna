'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, DatePicker, Select, Space, Progress, Tag } from 'antd';
import { ArrowLeftOutlined, BarChartOutlined, DownloadOutlined, PieChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

const { RangePicker } = DatePicker;

interface EstatisticaGeral {
  totalTestes: number;
  mediaPontuacao: number;
  taxaConclusao: number;
  tempoMedio: number;
}

interface InteligenciaRanking {
  nome: string;
  cor: string;
  quantidade: number;
  percentual: number;
}

export default function RelatoriosPage() {
  const [estatisticas, setEstatisticas] = useState<EstatisticaGeral>({
    totalTestes: 0,
    mediaPontuacao: 0,
    taxaConclusao: 0,
    tempoMedio: 0
  });
  const [rankingInteligencias, setRankingInteligencias] = useState<InteligenciaRanking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      carregarRelatorios();
    }
  }, [router]);

  const carregarRelatorios = async () => {
    try {
      setIsLoading(true);
      // TODO: Implementar API para buscar relatórios
      
      // Dados de exemplo
      setEstatisticas({
        totalTestes: 347,
        mediaPontuacao: 78.5,
        taxaConclusao: 89.3,
        tempoMedio: 18.7
      });

      setRankingInteligencias([
        { nome: 'Inteligência Linguística', cor: '#1890ff', quantidade: 89, percentual: 25.6 },
        { nome: 'Inteligência Lógico-Matemática', cor: '#52c41a', quantidade: 76, percentual: 21.9 },
        { nome: 'Inteligência Espacial', cor: '#fa8c16', quantidade: 64, percentual: 18.4 },
        { nome: 'Inteligência Musical', cor: '#eb2f96', quantidade: 52, percentual: 15.0 },
        { nome: 'Inteligência Corporal-Cinestésica', cor: '#722ed1', quantidade: 45, percentual: 13.0 },
        { nome: 'Inteligência Interpessoal', cor: '#13c2c2', quantidade: 21, percentual: 6.1 }
      ]);
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  const exportarRelatorio = (tipo: string) => {
    // TODO: Implementar exportação de relatórios
    console.log(`Exportando relatório: ${tipo}`);
  };

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <Card style={{ marginBottom: 24 }} loading={isLoading}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/multiplas-inteligencias')}
                style={{ marginRight: 16 }}
              >
                Voltar
              </Button>
              <div>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                  <BarChartOutlined style={{ marginRight: 8, color: '#13c2c2' }} />
                  Relatórios e Análises
                </h2>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                  Visualize estatísticas detalhadas dos testes de múltiplas inteligências
                </p>
              </div>
            </div>
            
            <Space>
              <RangePicker placeholder={['Data inicial', 'Data final']} />
              <Select defaultValue="todos" style={{ width: 120 }}>
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="30">30 dias</Select.Option>
                <Select.Option value="90">90 dias</Select.Option>
              </Select>
            </Space>
          </div>
        </Card>

        {/* Estatísticas Gerais */}
        <Card title="Estatísticas Gerais" style={{ marginBottom: 24 }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Total de Testes"
                value={estatisticas.totalTestes}
                prefix={<BarChartOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Média de Pontuação"
                value={estatisticas.mediaPontuacao}
                precision={1}
                suffix="/100"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Taxa de Conclusão"
                value={estatisticas.taxaConclusao}
                precision={1}
                suffix="%"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Tempo Médio"
                value={estatisticas.tempoMedio}
                precision={1}
                suffix="min"
              />
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Ranking de Inteligências */}
          <Col xs={24} lg={12}>
            <Card 
              title="Inteligências Mais Comuns" 
              extra={
                <Button 
                  icon={<DownloadOutlined />} 
                  size="small"
                  onClick={() => exportarRelatorio('ranking')}
                >
                  Exportar
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {rankingInteligencias.map((item, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: item.cor,
                            borderRadius: '50%',
                            marginRight: 8
                          }}
                        />
                        <span>{item.nome}</span>
                      </div>
                      <Tag color={item.cor}>
                        {item.quantidade} ({item.percentual}%)
                      </Tag>
                    </div>
                    <Progress 
                      percent={item.percentual} 
                      strokeColor={item.cor}
                      trailColor="#f0f0f0"
                      showInfo={false}
                    />
                  </div>
                ))}
              </Space>
            </Card>
          </Col>

          {/* Relatórios Rápidos */}
          <Col xs={24} lg={12}>
            <Card title="Relatórios Rápidos">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Button 
                  type="default" 
                  icon={<PieChartOutlined />} 
                  block 
                  size="large"
                  onClick={() => exportarRelatorio('distribuicao')}
                >
                  Distribuição por Inteligência
                </Button>
                
                <Button 
                  type="default" 
                  icon={<LineChartOutlined />} 
                  block 
                  size="large"
                  onClick={() => exportarRelatorio('evolucao')}
                >
                  Evolução Temporal
                </Button>
                
                <Button 
                  type="default" 
                  icon={<BarChartOutlined />} 
                  block 
                  size="large"
                  onClick={() => exportarRelatorio('comparativo')}
                >
                  Comparativo de Pontuações
                </Button>
                
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  block 
                  size="large"
                  onClick={() => exportarRelatorio('completo')}
                >
                  Relatório Completo (PDF)
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Insights */}
        <Card title="Insights e Observações" style={{ marginTop: 24 }}>
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <div style={{ padding: '16px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
                <h4 style={{ color: '#52c41a', margin: '0 0 8px 0' }}>✅ Pontos Positivos</h4>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  <li>Taxa de conclusão acima de 85% indica boa usabilidade do teste</li>
                  <li>Tempo médio de 18.7 minutos está dentro do esperado</li>
                  <li>Distribuição equilibrada entre diferentes tipos de inteligência</li>
                </ul>
              </div>
            </Col>
            <Col span={24}>
              <div style={{ padding: '16px', backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: '6px' }}>
                <h4 style={{ color: '#fa8c16', margin: '0 0 8px 0' }}>⚠️ Pontos de Atenção</h4>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  <li>Inteligência Interpessoal com baixa representação (6.1%)</li>
                  <li>Verificar se as perguntas estão bem distribuídas entre categorias</li>
                  <li>Considerar revisar perguntas com alta taxa de abandono</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </AdminLayout>
  );
}
