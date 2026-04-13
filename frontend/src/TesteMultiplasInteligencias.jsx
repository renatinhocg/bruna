import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Radio, Progress, Row, Col, Typography, message, Spin } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const TesteMultiplasInteligencias = ({ showBackButton = true, onBack = null }) => {
  const [perguntasOriginais, setPerguntasOriginais] = useState([]);
  const [perguntasParaExibir, setPerguntasParaExibir] = useState([]); // Perguntas já embaralhadas/ordenadas
  const [possibilidades, setPossibilidades] = useState([]);
  const [respostas, setRespostas] = useState([]);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [testeIniciado, setTesteIniciado] = useState(false); // Começar com false para mostrar tela inicial
  const [testeConcluido, setTesteConcluido] = useState(false);
  const [configuracoes, setConfiguracoes] = useState(null);
  const carregouRef = useRef(false); // Evitar carregamento duplo
  const navigate = useNavigate();

  useEffect(() => {
    if (!carregouRef.current) {
      carregouRef.current = true;
      fetchDados();
    }
  }, []);

  const fetchDados = async () => {
  const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8002';
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Sessão expirada. Faça login novamente.');
        setPerguntas([]);
        return;
      }

      // Busca paralela incluindo configurações
      const [perguntasResp, possResp, configResp] = await Promise.allSettled([
        fetch(`${BASE_URL}/api/perguntas`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/possibilidades`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/configuracoes`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Configurações
      let config = null;
      if (configResp.status === 'fulfilled' && configResp.value.ok) {
        const configJson = await configResp.value.json();
        if (configJson.success) {
          config = configJson.data;
          setConfiguracoes(config);
        }
      }

      // Perguntas
      if (perguntasResp.status === 'fulfilled') {
        if (perguntasResp.value.status === 401) {
          message.error('Não autorizado (401). Refaça login.');
        } else if (perguntasResp.value.ok) {
          const json = await perguntasResp.value.json();
            if (json.success && Array.isArray(json.data)) {
              const perguntasOriginaisCarregadas = [...json.data];
              setPerguntasOriginais(perguntasOriginaisCarregadas);
              
              console.log('📊 Total de perguntas:', perguntasOriginaisCarregadas.length);
              console.log('🎲 Randomizar perguntas?', config?.randomizar_perguntas);
              
              let perguntasParaUsar = [...perguntasOriginaisCarregadas];
              
              // Aplicar randomização se configurado
              if (config && config.randomizar_perguntas) {
                // Embaralhar array (Fisher-Yates)
                for (let i = perguntasParaUsar.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [perguntasParaUsar[i], perguntasParaUsar[j]] = [perguntasParaUsar[j], perguntasParaUsar[i]];
                }
                console.log('✅ Perguntas embaralhadas!');
                console.log('Primeiras 5 perguntas:', perguntasParaUsar.slice(0, 5).map(p => `${p.id}: ${p.texto.substring(0, 30)}...`));
              } else {
                // Ordenar pela ordem original
                perguntasParaUsar.sort((a,b)=>a.ordem-b.ordem);
                console.log('📝 Perguntas em ordem original');
              }
              
              setPerguntasParaExibir(perguntasParaUsar);
            } else {
              message.error('Formato inesperado de perguntas.');
            }
        } else {
          message.error(`Falha ao carregar perguntas (HTTP ${perguntasResp.value.status}).`);
        }
      } else {
        message.error('Erro de rede ao buscar perguntas.');
      }

      // Possibilidades
      if (possResp.status === 'fulfilled' && possResp.value.ok) {
        const possJson = await possResp.value.json();
        if (possJson.success && Array.isArray(possJson.data)) {
          let possibilidadesProcessadas = [...possJson.data];
          
          // Aplicar randomização de opções se configurado
          if (config && config.randomizar_opcoes) {
            for (let i = possibilidadesProcessadas.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [possibilidadesProcessadas[i], possibilidadesProcessadas[j]] = [possibilidadesProcessadas[j], possibilidadesProcessadas[i]];
            }
          } else {
            possibilidadesProcessadas.sort((a,b)=>a.ordem-b.ordem);
          }
          
          setPossibilidades(possibilidadesProcessadas);
        }
      }

      // Fallback possibilidades caso API falhe
      if (possResp.status !== 'fulfilled' || !possResp.value.ok) {
        setPossibilidades([
          { id: 1, texto: 'Discordo Completamente', valor: 1, ordem: 1 },
          { id: 2, texto: 'Discordo um Pouco', valor: 2, ordem: 2 },
          { id: 3, texto: 'Incerto', valor: 3, ordem: 3 },
          { id: 4, texto: 'Concordo um Pouco', valor: 4, ordem: 4 },
          { id: 5, texto: 'Concordo Totalmente', valor: 5, ordem: 5 }
        ]);
      }

    } catch (e) {
      console.error(e);
      message.error('Erro inesperado ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  // Função removida - não precisamos mais da tela inicial

  const proximaPergunta = () => {
    if (perguntaAtual < perguntasParaExibir.length - 1) {
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

  const selecionarResposta = (possibilidadeId, valor) => {
    const perguntaId = perguntasParaExibir[perguntaAtual].id;
    const novasRespostas = respostas.filter(r => r.pergunta_id !== perguntaId);
    novasRespostas.push({
      pergunta_id: perguntaId,
      possibilidade_id: possibilidadeId,
      valor_resposta: valor
    });
    setRespostas(novasRespostas);
  };

  const obterRespostaSelecionada = () => {
    if (perguntasParaExibir.length === 0) return null;
    const perguntaId = perguntasParaExibir[perguntaAtual].id;
    return respostas.find(r => r.pergunta_id === perguntaId)?.possibilidade_id;
  };

  const obterTextoRespostaSelecionada = () => {
    const possibilidadeId = obterRespostaSelecionada();
    if (!possibilidadeId) return null;
    const possibilidade = possibilidades.find(p => p.id === possibilidadeId);
    return possibilidade ? possibilidade.texto : null;
  };

  const finalizarTeste = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Sessão expirada. Faça login novamente.');
        return;
      }

      // Buscar dados do usuário (opcional)

      // Buscar usuário do localStorage ou decodificar do token JWT
      let usuario = {};
      try {
        usuario = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {}
      if (!usuario.id || !usuario.email) {
        // Decodificar do token JWT
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const jwtUser = JSON.parse(jsonPayload);
          usuario.id = jwtUser.id || jwtUser.userId || jwtUser.sub || null;
          usuario.email = jwtUser.email || null;
          usuario.nome = jwtUser.name || jwtUser.nome || null;
        } catch {}
      }

      const payload = {
  usuario_id: usuario.id || null,
  nome_usuario: usuario.nome || usuario.name || null,
  email_usuario: usuario.email || null,
        respostas: respostas.map(r => ({
          pergunta_id: r.pergunta_id,
          possibilidade_id: r.possibilidade_id
        }))
      };

      const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8002';
      const resp = await fetch(`${BASE_URL}/api/testes-inteligencia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json.success) {
          message.success('Teste enviado com sucesso! Aguarde a liberação do resultado.');
          setTesteConcluido(true);
        } else {
          message.error(json.message || 'Erro ao salvar teste.');
        }
      } else {
        const erro = await resp.json().catch(() => ({}));
        message.error(erro.message || `Erro ao salvar teste (HTTP ${resp.status})`);
      }
    } catch (error) {
      console.error('Erro ao finalizar teste:', error);
      message.error('Erro ao finalizar teste');
    } finally {
      setLoading(false);
    }
  };

  const voltarParaDashboard = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/admin/dashboard');
    }
  };

  const reiniciarTeste = () => {
    setTesteIniciado(false); // Voltar para tela inicial
    setTesteConcluido(false);
    setRespostas([]);
    setPerguntaAtual(0);
  };

  const iniciarTeste = () => {
    setTesteIniciado(true);
  };

  if (loading) {
    console.log('=== COMPONENTE EM LOADING ===');
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  console.log('=== RENDER DO COMPONENTE ===');
  console.log('testeIniciado:', testeIniciado);
  console.log('testeConcluido:', testeConcluido);
  console.log('perguntasParaExibir.length:', perguntasParaExibir.length);
  console.log('loading:', loading);

  return (
    <div style={{ 
      padding: window.innerWidth < 768 ? '16px' : '24px', 
      maxWidth: '1200px', 
      margin: '0 auto' 
    }} onClick={(e) => e.stopPropagation()}>
      {showBackButton && (
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            voltarParaDashboard();
          }}
          style={{ 
            marginBottom: window.innerWidth < 768 ? '16px' : '24px',
            fontSize: window.innerWidth < 768 ? '14px' : '16px'
          }}
          htmlType="button"
        >
          {onBack ? 'Voltar aos Testes' : 'Voltar ao Dashboard'}
        </Button>
      )}

      {/* Tela Inicial com botão INICIAR */}
      {!testeIniciado && !testeConcluido && perguntasParaExibir.length > 0 && (
        <Card 
          style={{ 
            maxWidth: 600, 
            margin: '0 auto', 
            textAlign: 'center',
            minHeight: window.innerWidth < 768 ? '300px' : '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          bodyStyle={{ 
            width: '100%', 
            padding: window.innerWidth < 768 ? '30px 20px' : '60px 40px' 
          }}
        >
          <div>
            <Title level={window.innerWidth < 768 ? 3 : 2} style={{ 
              color: '#1890ff', 
              marginBottom: window.innerWidth < 768 ? 16 : 24,
              fontSize: window.innerWidth < 768 ? '20px' : '28px'
            }}>
              Teste de Inteligências Múltiplas
            </Title>
            <Text style={{ 
              fontSize: window.innerWidth < 768 ? '14px' : '16px', 
              display: 'block', 
              marginBottom: window.innerWidth < 768 ? 30 : 40, 
              color: '#666',
              lineHeight: window.innerWidth < 768 ? '1.5' : '1.8'
            }}>
              É uma abordagem desenvolvida pelo psicólogo americano Howard Gardner, um renomado professor da Universidade Harvard que realiza pesquisas científicas sobre sensibilidade à inteligência. Sua teoria se tornou um teste ao longo do tempo, identificando tipos distintos de inteligência. 
              <br /><br />
              O teste das inteligências múltiplas de Gardner se dedica a entender esses diversos tipos de inteligência e oferece resultados rápidos e precisos, que permitem que você aproveite seus pontos fortes, a partir da consciência de suas habilidades e tipos de inteligência.
              <br /><br />
              Preste atenção às perguntas e escolha as melhores opções que o descrevem.

            </Text>
            <Button 
              type="primary" 
              size="large"
              onClick={iniciarTeste}
              style={{ 
                height: window.innerWidth < 768 ? '50px' : '60px', 
                fontSize: window.innerWidth < 768 ? '18px' : '20px',
                padding: window.innerWidth < 768 ? '0 40px' : '0 60px',
                fontWeight: 'bold',
                width: window.innerWidth < 768 ? '100%' : 'auto'
              }}
            >
              INICIAR
            </Button>
          </div>
        </Card>
      )}

      {testeIniciado && !testeConcluido && perguntasParaExibir.length > 0 && (
        <Card style={{ 
          maxWidth: 900, 
          margin: '0 auto',
          padding: window.innerWidth < 768 ? '12px' : '24px'
        }}>
          <div style={{ marginBottom: window.innerWidth < 768 ? 16 : 24 }}>
            <Progress
              percent={Math.round(((perguntaAtual + 1) / perguntasParaExibir.length) * 100)}
              status="active"
              showInfo={true}
              format={(percent) => `${perguntaAtual + 1}/${perguntasParaExibir.length}`}
            />
          </div>

          <div style={{ 
            marginBottom: window.innerWidth < 768 ? 24 : 32, 
            textAlign: 'center',
            padding: window.innerWidth < 768 ? '0 8px' : '0'
          }}>
            <Text style={{ 
              fontSize: window.innerWidth < 768 ? '18px' : '24px', 
              lineHeight: '1.6', 
              fontWeight: 500, 
              display: 'block' 
            }}>
              {perguntasParaExibir[perguntaAtual].texto}
            </Text>
          </div>

          <div style={{ marginBottom: window.innerWidth < 768 ? 24 : 32 }}>
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
              <Row gutter={[window.innerWidth < 768 ? 12 : 16, window.innerWidth < 768 ? 12 : 16]} justify="center">
                {possibilidades.map(possibilidade => (
                  <Col xs={24} sm={12} md={8} lg={4} key={possibilidade.id}>
                    <Card
                      hoverable={window.innerWidth >= 768}
                      bordered={window.innerWidth >= 768}
                      style={{
                        textAlign: 'center',
                        border: obterRespostaSelecionada() === possibilidade.id 
                          ? '2px solid #1890ff !important' 
                          : window.innerWidth < 768 
                            ? 'none !important' 
                            : '1px solid #d9d9d9',
                        backgroundColor: obterRespostaSelecionada() === possibilidade.id ? '#f0f8ff' : 'white',
                        cursor: 'pointer',
                        minHeight: window.innerWidth < 768 ? '60px' : '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: window.innerWidth < 768 ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        borderRadius: window.innerWidth < 768 ? '8px' : '2px'
                      }}
                      onClick={() => selecionarResposta(possibilidade.id, possibilidade.valor)}
                      bodyStyle={{ 
                        padding: window.innerWidth < 768 ? '14px 12px' : '16px 8px',
                        width: '100%'
                      }}
                    >
                      <Radio
                        value={possibilidade.id}
                        style={{ display: 'none' }}
                      />
                      <Text style={{ 
                        fontSize: window.innerWidth < 768 ? '15px' : '13px', 
                        fontWeight: obterRespostaSelecionada() === possibilidade.id ? 'bold' : 'normal',
                        color: obterRespostaSelecionada() === possibilidade.id ? '#1890ff' : 'inherit',
                        textAlign: 'center',
                        lineHeight: '1.4',
                        display: 'block'
                      }}>
                        {possibilidade.texto}
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
            
            {/* Mostrar resposta selecionada */}
            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              backgroundColor: obterRespostaSelecionada() ? '#f6ffed' : '#fff2e8',
              border: `1px solid ${obterRespostaSelecionada() ? '#b7eb8f' : '#ffbb96'}`,
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              {obterRespostaSelecionada() ? (
                <div>
                  <Text style={{ color: '#52c41a', fontWeight: 'medium' }}>
                    ✓ Resposta selecionada: 
                  </Text>
                  <Text style={{ 
                    color: '#52c41a', 
                    fontWeight: 'bold', 
                    fontSize: '16px',
                    marginLeft: '8px'
                  }}>
                    {obterTextoRespostaSelecionada()}
                  </Text>
                </div>
              ) : (
                <Text style={{ color: '#fa8c16', fontWeight: 'medium' }}>
                  Por favor, selecione uma resposta para continuar
                </Text>
              )}
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: window.innerWidth < 768 ? '16px' : '20px',
            borderTop: '1px solid #f0f0f0',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            gap: window.innerWidth < 768 ? '16px' : '0'
          }}>
            {window.innerWidth < 768 ? (
              <>
                <Text style={{ 
                  color: !obterRespostaSelecionada() ? '#ff7875' : '#52c41a',
                  fontWeight: 'medium',
                  fontSize: '13px',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  {!obterRespostaSelecionada() ? 'Por favor, selecione uma resposta para continuar' : ''}
                </Text>
                <div style={{ 
                  display: 'flex', 
                  width: '100%', 
                  maxWidth: '400px',
                  margin: '0 auto',
                  gap: '12px',
                  justifyContent: 'center'
                }}>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={perguntaAnterior}
                    disabled={perguntaAtual === 0}
                    size="large"
                    style={{ flex: 1, height: '48px', maxWidth: '180px' }}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={perguntaAtual === perguntasParaExibir.length - 1 ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
                    onClick={proximaPergunta}
                    disabled={!obterRespostaSelecionada()}
                    loading={loading}
                    style={{ flex: 1, height: '48px', maxWidth: '180px' }}
                  >
                    {perguntaAtual === perguntasParaExibir.length - 1 ? 'Finalizar Teste' : 'Próxima'}
                  </Button>
                </div>
              </>
            ) : (
              <>
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
                  icon={perguntaAtual === perguntasParaExibir.length - 1 ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
                  onClick={proximaPergunta}
                  disabled={!obterRespostaSelecionada()}
                  loading={loading}
                >
                  {perguntaAtual === perguntasParaExibir.length - 1 ? 'Finalizar Teste' : 'Próxima'}
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {testeConcluido && (
        <Card 
          style={{ 
            maxWidth: 700, 
            margin: '0 auto',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center'
          }}
          bodyStyle={{ width: '100%' }}
        >
          <div style={{ textAlign: 'center', padding: '60px 40px' }}>
            <CheckCircleOutlined style={{ fontSize: '80px', color: '#52c41a', marginBottom: 32 }} />
            <Title level={2} style={{ marginBottom: 24, color: '#1890ff' }}>
              Teste Concluído com Sucesso!
            </Title>
            <Text style={{ 
              fontSize: '18px', 
              color: '#666', 
              marginBottom: 32, 
              display: 'block',
              lineHeight: '1.8'
            }}>
              Seu teste foi enviado e está aguardando análise.
            </Text>
            <div style={{
              padding: '24px',
              backgroundColor: '#fff7e6',
              border: '2px solid #ffa940',
              borderRadius: '12px',
              marginTop: 32
            }}>
              <Text style={{ 
                fontSize: '20px', 
                color: '#d48806',
                fontWeight: 'bold',
                display: 'block',
                marginBottom: 12
              }}>
                ⏳ Aguarde a validação da Bruna
              </Text>
              <Text style={{ 
                fontSize: '16px', 
                color: '#8c8c8c',
                display: 'block'
              }}>
                Você será notificado quando o resultado estiver disponível.
              </Text>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TesteMultiplasInteligencias;
