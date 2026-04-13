'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Statistic, Switch, message } from 'antd';
import { 
  BarChartOutlined, 
  QuestionCircleOutlined, 
  SettingOutlined, 
  TagsOutlined,
  PlayCircleOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import apiService from '../../services/api.js';

export default function MultiplasInteligencias() {
  const [testeAtivo, setTesteAtivo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResultados: 0,
    totalPerguntas: 0,
    totalCategorias: 0,
    totalPossibilidades: 0,
    testesHoje: 0,
    taxaConclusao: 0
  });
  const router = useRouter();

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      // Carregar estatísticas e status do teste
      fetchStats();
      fetchTesteStatus();
    }
  }, [router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas reais do backend
      console.log('🔍 Buscando estatísticas do dashboard...');
      const response = await apiService.getDashboardStats();
      console.log('📊 Resposta recebida:', response);

      if (response.success) {
        console.log('✅ Dados das estatísticas:', response.data);
        setStats({
          totalCategorias: response.data.totalCategorias,
          totalPerguntas: response.data.totalPerguntas,
          totalPossibilidades: response.data.totalPossibilidades,
          totalResultados: response.data.totalResultados,
          testesHoje: response.data.testesHoje,
          taxaConclusao: response.data.taxaConclusao
        });
      } else {
        console.error('❌ Resposta sem sucesso:', response);
        throw new Error('Erro ao carregar estatísticas');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      message.error('Erro ao carregar estatísticas');
      
      // Fallback para valores zerados em caso de erro
      setStats({
        totalCategorias: 0,
        totalPerguntas: 0,
        totalPossibilidades: 0,
        totalResultados: 0,
        testesHoje: 0,
        taxaConclusao: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTesteStatus = async () => {
    try {
      // TODO: Implementar busca do status do teste
      setTesteAtivo(false);
    } catch (error) {
      console.error('Erro ao carregar status do teste:', error);
    }
  };

  const handleToggleTeste = async (checked: boolean) => {
    try {
      // TODO: Implementar ativação/desativação do teste
      setTesteAtivo(checked);
      message.success(checked ? 'Teste ativado com sucesso!' : 'Teste desativado com sucesso!');
    } catch {
      message.error('Erro ao alterar status do teste');
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const cardStyle = {
    cursor: 'pointer',
    height: '100%',
    transition: 'all 0.3s ease',
  };

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Card
          title="Múltiplas Inteligências - Painel de Controle"
          extra={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlayCircleOutlined style={{ color: testeAtivo ? '#52c41a' : '#d9d9d9' }} />
              <span>Teste {testeAtivo ? 'Ativo' : 'Inativo'}</span>
              <Switch
                checked={testeAtivo}
                onChange={handleToggleTeste}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </div>
          }
          style={{ marginBottom: '24px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={4}>
              <Statistic
                title="Categorias"
                value={stats.totalCategorias}
                prefix={<TagsOutlined />}
                loading={loading}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Statistic
                title="Perguntas"
                value={stats.totalPerguntas}
                prefix={<QuestionCircleOutlined />}
                loading={loading}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Statistic
                title="Opções de Resposta"
                value={stats.totalPossibilidades}
                prefix={<SettingOutlined />}
                loading={loading}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Statistic
                title="Testes Realizados"
                value={stats.totalResultados}
                prefix={<BarChartOutlined />}
                loading={loading}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Statistic
                title="Hoje"
                value={stats.testesHoje}
                suffix="testes"
                loading={loading}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Statistic
                title="Taxa de Conclusão"
                value={stats.taxaConclusao}
                precision={1}
                suffix="%"
                loading={loading}
              />
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Card 1: Cadastro de Categorias */}
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={cardStyle}
              onClick={() => navigateTo('/multiplas-inteligencias/categorias')}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <TagsOutlined style={{ fontSize: '48px', color: '#eb2f96', marginBottom: '16px' }} />
                <h3>Cadastro de Categorias</h3>
                <p style={{ color: '#666', minHeight: '40px' }}>
                  Defina os tipos de inteligências múltiplas e suas características
                </p>
                <Button type="primary" block>
                  Gerenciar Categorias
                </Button>
              </div>
            </Card>
          </Col>

          {/* Card 2: Cadastro de Perguntas */}
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={cardStyle}
              onClick={() => navigateTo('/multiplas-inteligencias/perguntas')}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <QuestionCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <h3>Cadastro de Perguntas</h3>
                <p style={{ color: '#666', minHeight: '40px' }}>
                  Crie e gerencie as perguntas do teste de múltiplas inteligências
                </p>
                <Button type="primary" block>
                  Gerenciar Perguntas
                </Button>
              </div>
            </Card>
          </Col>

          {/* Card 3: Cadastro de Possibilidades */}
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={cardStyle}
              onClick={() => navigateTo('/multiplas-inteligencias/possibilidades')}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <SettingOutlined style={{ fontSize: '48px', color: '#fa8c16', marginBottom: '16px' }} />
                <h3>Opções de Resposta</h3>
                <p style={{ color: '#666', minHeight: '40px' }}>
                  Configure as possibilidades de resposta (Nunca, Às vezes, Sempre, etc.)
                </p>
                <Button type="primary" block>
                  Gerenciar Respostas
                </Button>
              </div>
            </Card>
          </Col>

          {/* Card 4: Lista de Resultados */}
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={cardStyle}
              onClick={() => navigateTo('/multiplas-inteligencias/resultados')}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <BarChartOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <h3>Resultados dos Testes</h3>
                <p style={{ color: '#666', minHeight: '40px' }}>
                  Visualize e analise os resultados de quem realizou o teste
                </p>
                <Button type="primary" block>
                  Ver Resultados
                </Button>
              </div>
            </Card>
          </Col>

          {/* Card 5: Configurações do Teste */}
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={cardStyle}
              onClick={() => navigateTo('/multiplas-inteligencias/configuracoes')}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <SettingOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
                <h3>Configurações</h3>
                <p style={{ color: '#666', minHeight: '40px' }}>
                  Configure parâmetros do teste, tempo limite e validações
                </p>
                <Button type="primary" block>
                  Configurar Teste
                </Button>
              </div>
            </Card>
          </Col>

          {/* Card 6: Relatórios */}
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={cardStyle}
              onClick={() => navigateTo('/multiplas-inteligencias/relatorios')}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <BarChartOutlined style={{ fontSize: '48px', color: '#13c2c2', marginBottom: '16px' }} />
                <h3>Relatórios</h3>
                <p style={{ color: '#666', minHeight: '40px' }}>
                  Gere relatórios estatísticos e análises dos resultados
                </p>
                <Button type="primary" block>
                  Ver Relatórios
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
