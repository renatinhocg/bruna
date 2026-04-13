'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Progress, message, Form, Input, Typography, Breadcrumb, Modal } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, UserOutlined, BulbOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import apiService from '../../../services/api';

const { Title, Text } = Typography;

interface Pergunta {
  id: number;
  texto: string;
  categoria_id: number;
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
  descricao: string;
}

interface Resultado {
  categoria: {
    id: number;
    nome: string;
    descricao: string;
    resultado: string;
    cor: string;
    caracteristicas_inteligente: string;
    carreiras_associadas: string;
  };
  pontuacao: number;
  percentual: number;
}

interface ResultadoTeste {
  id: number;
  nome_usuario?: string;
  email_usuario?: string;
  inteligencia_dominante?: string;
  pontuacao_total?: number;
  concluido: boolean;
  autorizado: boolean;
  created_at: string;
  resultados?: Resultado[];
}

interface DadosUsuario {
  nome: string;
  email: string;
}

export default function TestePage() {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [perguntasEmbaralhadas, setPerguntasEmbaralhadas] = useState<Pergunta[]>([]);
  const [possibilidades, setPossibilidades] = useState<Possibilidade[]>([]);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [testeIniciado, setTesteIniciado] = useState(false);
  const [resultado, setResultado] = useState<ResultadoTeste | null>(null);
  const [modalResultado, setModalResultado] = useState(false);
  const [dadosUsuario, setDadosUsuario] = useState<DadosUsuario>({ nome: '', email: '' });
  const [form] = Form.useForm();
  const router = useRouter();

  // Adicionar estilos CSS simples
  const addCustomStyles = () => {
    if (typeof document !== 'undefined' && !document.getElementById('teste-styles')) {
      const style = document.createElement('style');
      style.id = 'teste-styles';
      style.textContent = `
        .response-card {
          transition: all 0.3s ease;
        }
        .response-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 8px 20px rgba(24, 144, 255, 0.25);
          border-color: #40a9ff !important;
        }
        .response-card:hover .card-emoji {
          transform: scale(1.2);
        }
        .response-card:hover .card-number {
          background: #40a9ff !important;
          color: white !important;
        }
        .response-card:hover .card-text {
          color: #1890ff !important;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Função para embaralhar array
  const embaralharArray = <T,>(array: T[]): T[] => {
    const novoArray = [...array];
    for (let i = novoArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [novoArray[i], novoArray[j]] = [novoArray[j], novoArray[i]];
    }
    return novoArray;
  };

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      
      const [perguntasResponse, possibilidadesResponse, configResponse] = await Promise.all([
        apiService.getPerguntas(),
        apiService.getPossibilidades(),
        apiService.getConfiguracoes()
      ]);

      if (perguntasResponse.success && possibilidadesResponse.success) {
        const perguntasOriginais = perguntasResponse.data || [];
        const possibilidadesOriginais = possibilidadesResponse.data || [];
        
        // Aplicar configurações se disponíveis
        if (configResponse.success) {
          // Embaralhar perguntas se configurado
          const perguntasParaUsar = configResponse.data.randomizar_perguntas 
            ? embaralharArray([...perguntasOriginais])
            : perguntasOriginais;
            
          setPerguntasEmbaralhadas(perguntasParaUsar);
        } else {
          setPerguntasEmbaralhadas(perguntasOriginais);
        }
        
        setPerguntas(perguntasOriginais);
        setPossibilidades(possibilidadesOriginais);
      } else {
        message.error('Erro ao carregar dados do teste');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      message.error('Erro ao carregar teste');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    addCustomStyles();
    carregarDados();
  }, [carregarDados]);

  const iniciarTeste = async (values: DadosUsuario) => {
    setDadosUsuario(values);
    setTesteIniciado(true);
  };

  const responderPergunta = (perguntaId: number, possibilidadeId: number) => {
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: possibilidadeId
    }));
  };

  const proximaPergunta = () => {
    if (perguntaAtual < perguntas.length - 1) {
      setPerguntaAtual(prev => prev + 1);
    }
  };

  const perguntaAnterior = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(prev => prev - 1);
    }
  };

  const finalizarTeste = async () => {
    try {
      setEnviando(true);

      // Usar perguntas embaralhadas se disponíveis, senão usar originais
      const perguntasParaVerificar = perguntasEmbaralhadas.length > 0 ? perguntasEmbaralhadas : perguntas;

      // Verificar se todas as perguntas foram respondidas
      const perguntasNaoRespondidas = perguntasParaVerificar.filter(p => !respostas[p.id]);
      if (perguntasNaoRespondidas.length > 0) {
        message.warning('Por favor, responda todas as perguntas antes de finalizar');
        return;
      }

      // Preparar dados para envio usando as perguntas que foram realmente exibidas
      const perguntasUsadas = perguntasEmbaralhadas.length > 0 ? perguntasEmbaralhadas : perguntas;
      const dadosTeste = {
        nome_usuario: dadosUsuario.nome,
        email_usuario: dadosUsuario.email,
        respostas: perguntasUsadas.map(pergunta => ({
          pergunta_id: pergunta.id,
          possibilidade_id: respostas[pergunta.id]
        })).filter(resposta => resposta.possibilidade_id) // Filtrar apenas respostas válidas
      };

      const response = await apiService.criarTesteInteligencia(dadosTeste);

      if (response.success) {
        setResultado(response.data);
        setModalResultado(true);
        message.success(response.message || 'Teste enviado com sucesso!');
      } else {
        message.error(response.message || 'Erro ao processar teste');
      }
    } catch (error) {
      console.error('Erro ao finalizar teste:', error);
      message.error('Erro ao processar teste');
    } finally {
      setEnviando(false);
    }
  };

  const reiniciarTeste = () => {
    setTesteIniciado(false);
    setPerguntaAtual(0);
    setRespostas({});
    setResultado(null);
    setModalResultado(false);
    form.resetFields();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Title level={3}>Carregando teste...</Title>
        </div>
      </AdminLayout>
    );
  }

  if (!testeIniciado) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px' }}>
          <Breadcrumb 
            style={{ marginBottom: 16 }}
            items={[
              { title: 'Dashboard', href: '/dashboard' },
              { title: 'Múltiplas Inteligências', href: '/multiplas-inteligencias' },
              { title: 'Fazer Teste' }
            ]}
          />

          <Card style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <BulbOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: 16 }} />
              <Title level={2}>Teste de Múltiplas Inteligências</Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Descubra seus pontos fortes e características únicas através da Teoria das Múltiplas Inteligências de Howard Gardner.
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={iniciarTeste}
            >
              <Form.Item
                name="nome"
                label="Seu Nome"
                rules={[{ required: true, message: 'Por favor, digite seu nome' }]}
              >
                <Input size="large" prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="email"
                label="Seu Email"
                rules={[
                  { required: true, message: 'Por favor, digite seu email' },
                  { type: 'email', message: 'Digite um email válido' }
                ]}
              >
                <Input size="large" type="email" />
              </Form.Item>

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  style={{ minWidth: 200 }}
                >
                  Iniciar Teste
                </Button>
              </div>
            </Form>

            <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
              <Title level={5}>Informações do Teste:</Title>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Total de perguntas: {perguntas.length}</li>
                <li>Tempo estimado: 10-15 minutos</li>
                <li>Responda com sinceridade para obter o melhor resultado</li>
                <li>Não existem respostas certas ou erradas</li>
              </ul>
            </div>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const perguntaCorrente = (perguntasEmbaralhadas.length > 0 ? perguntasEmbaralhadas : perguntas)[perguntaAtual];
  const perguntasParaUsar = perguntasEmbaralhadas.length > 0 ? perguntasEmbaralhadas : perguntas;
  const progressPercent = ((perguntaAtual + 1) / perguntasParaUsar.length) * 100;
  const todasRespondidas = perguntasParaUsar.every(p => respostas[p.id]);

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Breadcrumb 
          style={{ marginBottom: 16 }}
          items={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Múltiplas Inteligências', href: '/multiplas-inteligencias' },
            { title: 'Fazendo Teste' }
          ]}
        />

        <Card style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Cabeçalho com progresso */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text strong>Pergunta {perguntaAtual + 1} de {perguntasParaUsar.length}</Text>
              <Text type="secondary">{Math.round(progressPercent)}% completo</Text>
            </div>
            <Progress percent={progressPercent} showInfo={false} />
          </div>

          {/* Pergunta atual */}
          {perguntaCorrente && (
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 24 }}>
                {perguntaCorrente.texto}
              </Title>

              <div style={{ marginBottom: 32 }}>
                {/* Cards de seleção */}
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginBottom: 32
                }}>
                  {possibilidades.map((poss) => {
                    const isSelected = respostas[perguntaCorrente.id] === poss.valor;
                    
                    // Emojis correspondentes aos valores 1-5 (triste para feliz)
                    const emojis = {
                      1: '😞',
                      2: '😕', 
                      3: '😐',
                      4: '🙂',
                      5: '😊'
                    };
                    
                    return (
                      <Card
                        key={poss.valor}
                        hoverable
                        className="response-card"
                        style={{
                          width: 140,
                          textAlign: 'center',
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                          background: isSelected ? '#f0f8ff' : '#ffffff',
                          boxShadow: isSelected ? '0 4px 12px rgba(24, 144, 255, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transform: isSelected ? 'translateY(-2px)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                        bodyStyle={{ padding: '16px 12px' }}
                        onClick={() => responderPergunta(perguntaCorrente.id, poss.valor)}
                      >
                        <div style={{ marginBottom: 8 }}>
                          {/* Emoji */}
                          <div 
                            className="card-emoji"
                            style={{
                              fontSize: '32px',
                              marginBottom: '8px',
                              transition: 'transform 0.3s ease',
                              transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                            }}
                          >
                            {emojis[poss.valor as keyof typeof emojis]}
                          </div>
                          
                          {/* Número */}
                          <div 
                            className="card-number"
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              background: isSelected ? '#1890ff' : '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 12px',
                              color: isSelected ? '#fff' : '#8c8c8c',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {poss.valor}
                          </div>
                          
                          {/* Texto */}
                          <Text 
                            className="card-text"
                            style={{ 
                              fontSize: '11px', 
                              fontWeight: '500',
                              color: isSelected ? '#1890ff' : '#262626',
                            display: 'block',
                            lineHeight: '1.3'
                          }}>
                            {poss.texto}
                          </Text>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Resposta selecionada */}
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px 24px',
                  background: '#fafafa',
                  borderRadius: '12px',
                  border: '1px solid #e8e8e8'
                }}>
                  <Text style={{ 
                    fontSize: '16px', 
                    fontWeight: '500',
                    color: '#1890ff',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    Sua resposta:
                  </Text>
                  <Text style={{ 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: '#262626'
                  }}>
                    {possibilidades.find(p => p.valor === (respostas[perguntaCorrente.id] || 3))?.descricao || 'Nenhuma resposta selecionada'}
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Botões de navegação */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={perguntaAnterior}
              disabled={perguntaAtual === 0}
            >
              Anterior
            </Button>

            {/* Removemos a exibição da categoria para não dar dicas */}
            <div></div>

            {perguntaAtual === perguntasParaUsar.length - 1 ? (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={finalizarTeste}
                disabled={!todasRespondidas}
                loading={enviando}
              >
                Finalizar Teste
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={proximaPergunta}
                disabled={!respostas[perguntaCorrente?.id]}
              >
                Próxima
              </Button>
            )}
          </div>
        </Card>

        {/* Modal de Resultado */}
        <Modal
          title={resultado?.autorizado ? "Resultado do Teste de Múltiplas Inteligências" : "Teste Concluído"}
          open={modalResultado}
          onCancel={() => setModalResultado(false)}
          footer={[
            <Button key="novo" onClick={reiniciarTeste}>
              Fazer Novo Teste
            </Button>,
            <Button key="voltar" type="primary" onClick={() => router.push('/multiplas-inteligencias')}>
              Voltar ao Dashboard
            </Button>
          ]}
          width={800}
        >
          {resultado && (
            <div>
              {resultado.autorizado ? (
                // Resultado autorizado - mostrar resultados completos
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3}>Parabéns, {dadosUsuario.nome}!</Title>
                    <Text>Sua inteligência dominante é: <strong>{resultado.inteligencia_dominante}</strong></Text>
                  </div>

                  {resultado.resultados?.map((item: Resultado, index: number) => (
                    <Card 
                      key={item.categoria.id}
                      size="small" 
                      style={{ 
                        marginBottom: 16,
                        border: index === 0 ? `2px solid ${item.categoria.cor}` : '1px solid #d9d9d9'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Title level={5} style={{ margin: 0, color: item.categoria.cor }}>
                            {item.categoria.nome}
                          </Title>
                          <Text type="secondary">{item.categoria.descricao}</Text>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Title level={4} style={{ margin: 0, color: item.categoria.cor }}>
                            {item.percentual.toFixed(1)}%
                          </Title>
                          <Text type="secondary">{item.pontuacao} pontos</Text>
                        </div>
                      </div>
                      
                      <Progress 
                        percent={item.percentual} 
                        strokeColor={item.categoria.cor}
                        style={{ marginTop: 8 }}
                      />

                      {index === 0 && (
                        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6f6f6', borderRadius: 4 }}>
                          <Text strong>Características:</Text>
                          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                            {item.categoria.resultado}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                // Teste não autorizado - mostrar mensagem de aguardo
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '24px' }}>
                    ⏳
                  </div>
                  <Title level={3} style={{ color: '#1890ff', marginBottom: '16px' }}>
                    Teste Enviado com Sucesso!
                  </Title>
                  <Text style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
                    Olá, <strong>{dadosUsuario.nome}</strong>! Seu teste foi concluído e está sendo analisado.
                  </Text>
                  <div style={{ 
                    background: '#f0f8ff', 
                    border: '1px solid #91d5ff',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '24px'
                  }}>
                    <Text style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      📧 <strong>Próximos passos:</strong><br/>
                      Você receberá um e-mail no endereço <strong>{dadosUsuario.email}</strong> assim que 
                      seus resultados estiverem prontos e autorizados para visualização.
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ID do Teste: #{resultado.id}
                  </Text>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
