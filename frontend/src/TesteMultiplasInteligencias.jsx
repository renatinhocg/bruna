import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Progress, Row, Col, Typography, message, Spin } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const TesteMultiplasInteligencias = ({ showBackButton = true, onBack = null }) => {
  const [perguntas, setPerguntas] = useState([]);
  const [possibilidades, setPossibilidades] = useState([]);
  const [respostas, setRespostas] = useState([]);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [loading, setLoading] = useState(true); // Começar como true
  const [testeIniciado, setTesteIniciado] = useState(true); // Começar como true (ir direto para o teste)
  const [testeConcluido, setTesteConcluido] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDados();
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

      // Busca paralela
      const [perguntasResp, possResp] = await Promise.allSettled([
        fetch(`${BASE_URL}/api/perguntas`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/possibilidades`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Perguntas
      if (perguntasResp.status === 'fulfilled') {
        if (perguntasResp.value.status === 401) {
          message.error('Não autorizado (401). Refaça login.');
        } else if (perguntasResp.value.ok) {
          const json = await perguntasResp.value.json();
            if (json.success && Array.isArray(json.data)) {
              const ordenadas = [...json.data].sort((a,b)=>a.ordem-b.ordem);
              setPerguntas(ordenadas);
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
          const ord = [...possJson.data].sort((a,b)=>a.ordem-b.ordem);
          setPossibilidades(ord);
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

  const selecionarResposta = (possibilidadeId, valor) => {
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
    if (perguntas.length === 0) return null;
    const perguntaId = perguntas[perguntaAtual].id;
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
    setTesteIniciado(true); // Manter como true para ir direto ao teste
    setTesteConcluido(false);
    setRespostas([]);
    setPerguntaAtual(0);
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
  console.log('perguntas.length:', perguntas.length);
  console.log('loading:', loading);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }} onClick={(e) => e.stopPropagation()}>
      {showBackButton && (
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            voltarParaDashboard();
          }}
          style={{ marginBottom: '24px' }}
          htmlType="button"
        >
          {onBack ? 'Voltar aos Testes' : 'Voltar ao Dashboard'}
        </Button>
      )}

      {/* Removida a tela inicial - vai direto para o teste */}

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
              Seu teste foi finalizado com sucesso! Obrigado pela participação.
            </Text>
            
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Button onClick={reiniciarTeste}>
                Fazer Novamente
              </Button>
              <Button type="primary" onClick={voltarParaDashboard}>
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TesteMultiplasInteligencias;
