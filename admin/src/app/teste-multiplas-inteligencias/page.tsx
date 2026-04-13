'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Radio, Progress, Row, Col, Typography, Breadcrumb, message, Spin } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import apiService from '../../services/api';

const { Title, Text } = Typography;

interface Pergunta {
  id: number;
  texto: string;
  ordem: number;
  categoria: {
    id: number;
    nome: string;
    cor: string;
  };
}

interface Possibilidade {
  id: number;
  texto: string;
  valor: number;
  descricao?: string;
}

interface Resposta {
  pergunta_id: number;
  possibilidade_id: number;
  valor_resposta: number;
}

export default function TesteMultiplasInteligencias() {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [possibilidades, setPossibilidades] = useState<Possibilidade[]>([]);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testeIniciado, setTesteIniciado] = useState(true); // Ir direto para o teste
  const [testeConcluido, setTesteConcluido] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Remover verificação de token - qualquer um pode fazer o teste
    fetchDados();
  }, []);

  const fetchDados = async () => {
    try {
      setLoading(true);
      
      // Definir possibilidades padrão imediatamente
      const possibilidadesPadrao = [
        { id: 1, texto: 'Discordo Completamente', valor: 1, ordem: 1 },
        { id: 2, texto: 'Discordo um Pouco', valor: 2, ordem: 2 },
        { id: 3, texto: 'Incerto', valor: 3, ordem: 3 },
        { id: 4, texto: 'Concordo um Pouco', valor: 4, ordem: 4 },
        { id: 5, texto: 'Concordo Totalmente', valor: 5, ordem: 5 }
      ];
      setPossibilidades(possibilidadesPadrao);
      
      // Buscar perguntas
      console.log('Buscando perguntas...');
      try {
        const perguntasResponse = await apiService.getPerguntasPublic();
        console.log('Resposta perguntas:', perguntasResponse);
        if (perguntasResponse.success) {
          setPerguntas(perguntasResponse.data);
          console.log('Perguntas carregadas:', perguntasResponse.data.length);
        }
      } catch (perguntasError) {
        console.error('Erro ao carregar perguntas:', perguntasError);
        // Usar perguntas de exemplo se a API falhar
        const perguntasExemplo = [
          {
            id: 1,
            texto: 'Gosto de ler livros, artigos ou histórias com frequência.',
            ordem: 1,
            categoria: { id: 1, nome: 'Linguística', cor: '#1890ff' }
          },
          {
            id: 2,
            texto: 'Prefiro resolver problemas usando números e cálculos.',
            ordem: 2,
            categoria: { id: 2, nome: 'Lógico-Matemática', cor: '#52c41a' }
          }
        ];
        setPerguntas(perguntasExemplo);
      }

      // Tentar buscar possibilidades da API também
      try {
        const possibilidadesResponse = await apiService.getPossibilidades();
        if (possibilidadesResponse.success && possibilidadesResponse.data?.length > 0) {
          setPossibilidades(possibilidadesResponse.data);
          console.log('Possibilidades da API carregadas:', possibilidadesResponse.data);
        }
      } catch {
        console.log('Usando possibilidades padrão');
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      message.error('Erro ao carregar o teste');
    } finally {
      setLoading(false);
    }
  };

  // Função removida - vai direto para o teste

  const proximaPergunta = () => {
    if (perguntaAtual < perguntas.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
    } else {
      finalizarTeste();
    }
  };

  const perguntaAnterior = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(perguntaAtual - 1);
    }
  };

  const selecionarResposta = (possibilidadeId: number, valor: number) => {
    const perguntaId = perguntas[perguntaAtual].id;
    const novasRespostas = respostas.filter(r => r.pergunta_id !== perguntaId);
    novasRespostas.push({
      pergunta_id: perguntaId,
      possibilidade_id: possibilidadeId,
      valor_resposta: valor
    });
    setRespostas(novasRespostas);
  };

  const obterRespostaSelecionada = () => {
    const perguntaId = perguntas[perguntaAtual].id;
    return respostas.find(r => r.pergunta_id === perguntaId)?.possibilidade_id;
  };

  const finalizarTeste = async () => {
    try {
      setLoading(true);
      
      // Preparar dados do teste para envio
      const dadosUsuario = {
        nome: 'Usuário do Teste', // Seria ideal coletar esses dados
        email: 'teste@email.com'  // em um formulário inicial
      };
      
      const testeData = {
        usuario: dadosUsuario,
        respostas: respostas
      };
      
      console.log('Enviando dados do teste:', testeData);
      
      const response = await apiService.finalizarTeste(testeData);
      
      if (response.success) {
        message.success('Teste concluído com sucesso!');
        setTesteConcluido(true);
      } else {
        message.error('Erro ao salvar teste: ' + response.message);
      }
    } catch (error) {
      console.error('Erro ao finalizar teste:', error);
      message.error('Erro ao finalizar teste');
    } finally {
      setLoading(false);
    }
  };

  const voltarParaResultados = () => {
    router.push('/multiplas-inteligencias/resultados');
  };

  const reiniciarTeste = () => {
    setTesteIniciado(false);
    setTesteConcluido(false);
    setRespostas([]);
    setPerguntaAtual(0);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

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
              href: '/multiplas-inteligencias/resultados',
            },
            {
              title: 'Teste',
            },
          ]}
        />

        {/* Removida tela inicial - vai direto para o teste */}

        {testeIniciado && !testeConcluido && perguntas.length > 0 && (
          <Card style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
              <Progress
                percent={Math.round(((perguntaAtual + 1) / perguntas.length) * 100)}
                status="active"
                showInfo={true}
                format={() => `${perguntaAtual + 1}/${perguntas.length}`}
              />
            </div>

            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <Title level={3} style={{ marginBottom: 8, color: '#1890ff' }}>
                Pergunta {perguntaAtual + 1} de {perguntas.length}
              </Title>
              <Text style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: 500 }}>
                {perguntas[perguntaAtual].texto}
              </Text>
              <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                {possibilidades.length} opções de resposta disponíveis
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <Radio.Group
                value={obterRespostaSelecionada()}
                onChange={(e) => {
                  const possibilidade = possibilidades.find(p => p.id === e.target.value);
                  if (possibilidade) {
                    selecionarResposta(possibilidade.id, possibilidade.valor);
                  }
                }}
                style={{ width: '100%' }}
              >
                <Row gutter={[16, 16]} justify="center">
                  {possibilidades.map(possibilidade => (
                    <Col xs={24} sm={12} md={8} lg={4} key={possibilidade.id}>
                      <Card
                        hoverable
                        style={{
                          textAlign: 'center',
                          border: obterRespostaSelecionada() === possibilidade.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                          backgroundColor: obterRespostaSelecionada() === possibilidade.id ? '#f0f8ff' : 'white',
                          cursor: 'pointer',
                          minHeight: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => selecionarResposta(possibilidade.id, possibilidade.valor)}
                        bodyStyle={{ padding: '16px 8px' }}
                      >
                        <Radio
                          value={possibilidade.id}
                          style={{ display: 'none' }}
                        />
                        <Text style={{ 
                          fontSize: '13px', 
                          fontWeight: obterRespostaSelecionada() === possibilidade.id ? 'bold' : 'normal',
                          color: obterRespostaSelecionada() === possibilidade.id ? '#1890ff' : 'inherit',
                          textAlign: 'center',
                          lineHeight: '1.3'
                        }}>
                          {possibilidade.texto}
                        </Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '20px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={perguntaAnterior}
                disabled={perguntaAtual === 0}
                size="large"
              >
                Anterior
              </Button>
              
              <Text style={{ 
                color: !obterRespostaSelecionada() ? '#ff7875' : '#52c41a',
                fontWeight: 'medium',
                fontSize: '14px'
              }}>
                {!obterRespostaSelecionada() ? 'Por favor, selecione uma resposta para continuar' : ''}
              </Text>
              
              <Button
                type="primary"
                size="large"
                icon={perguntaAtual === perguntas.length - 1 ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
                onClick={proximaPergunta}
                disabled={!obterRespostaSelecionada()}
                loading={loading}
              >
                {perguntaAtual === perguntas.length - 1 ? 'Finalizar Teste' : 'Próxima'}
              </Button>
            </div>
          </Card>
        )}

        {testeConcluido && (
          <Card style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: 24 }} />
              <Title level={2}>Teste Concluído!</Title>
              <Text style={{ fontSize: '16px', color: '#666', marginBottom: 32, display: 'block' }}>
                Seu teste foi finalizado com sucesso. Os resultados foram salvos e podem ser visualizados na página de resultados.
              </Text>
              
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <Button onClick={reiniciarTeste}>
                  Fazer Novamente
                </Button>
                <Button type="primary" onClick={voltarParaResultados}>
                  Ver Resultados
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
