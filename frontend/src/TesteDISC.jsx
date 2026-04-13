import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Progress, Typography, message, Alert, Space, Row, Col, Tag } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config/api';
import './TesteDISC.css';

const { Title, Text, Paragraph } = Typography;

const TesteDISC = () => {
  const [questoes, setQuestoes] = useState([]);
  const [testeId, setTesteId] = useState(null);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [testeConcluido, setTesteConcluido] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testeIniciado, setTesteIniciado] = useState(false);
  const [jaFezTeste, setJaFezTeste] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    verificarTeste();
  }, []);

  const verificarTeste = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/testes-disc/verificar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.jaFez && !data.podeRefazer) {
        setJaFezTeste(true);
        buscarResultado();
      }
    } catch (error) {
      console.error('Erro ao verificar teste:', error);
    }
  };

  const buscarResultado = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/testes-disc/meu-resultado`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResultado(data);
        setTesteConcluido(true);
      }
    } catch (error) {
      console.error('Erro ao buscar resultado:', error);
    }
  };

  const carregarQuestoes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/testes-disc/questoes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestoes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      message.error('Erro ao carregar questões');
    }
  };

  const iniciarTeste = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/testes-disc/iniciar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const teste = await response.json();
        setTesteId(teste.id);
        await carregarQuestoes();
        setTesteIniciado(true);
        message.success('Teste DISC iniciado! Boa sorte!');
      }
    } catch (error) {
      console.error('Erro ao iniciar teste:', error);
      message.error('Erro ao iniciar teste');
    } finally {
      setLoading(false);
    }
  };

  const selecionarResposta = (questaoId, opcaoId, tipo) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: {
        ...prev[questaoId],
        [tipo]: opcaoId
      }
    }));
  };

  const salvarResposta = async () => {
    try {
      const questao = questoes[questaoAtual];
      const respostaQuestao = respostas[questao.id];

      if (!respostaQuestao || !respostaQuestao.mais || !respostaQuestao.menos) {
        message.warning('Por favor, selecione uma opção que MAIS descreve você e uma que MENOS descreve você');
        return false;
      }

      if (respostaQuestao.mais === respostaQuestao.menos) {
        message.warning('Você deve selecionar opções diferentes para MAIS e MENOS');
        return false;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/testes-disc/responder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teste_id: testeId,
          questao_id: questao.id,
          opcao_mais_id: respostaQuestao.mais,
          opcao_menos_id: respostaQuestao.menos
        })
      });

      if (response.ok) {
        return true;
      } else {
        message.error('Erro ao salvar resposta');
        return false;
      }
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      message.error('Erro ao salvar resposta');
      return false;
    }
  };

  const proximaQuestao = async () => {
    const salvou = await salvarResposta();
    if (salvou && questaoAtual < questoes.length - 1) {
      setQuestaoAtual(questaoAtual + 1);
    }
  };

  const questaoAnterior = () => {
    if (questaoAtual > 0) {
      setQuestaoAtual(questaoAtual - 1);
    }
  };

  const finalizarTeste = async () => {
    try {
      // Salvar última resposta
      const salvou = await salvarResposta();
      if (!salvou) return;

      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/testes-disc/finalizar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teste_id: testeId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResultado(data.teste);
        setTesteConcluido(true);
        message.success('Teste concluído com sucesso!');
        // Redirecionar para página de resultado
        navigate('/cliente/resultado-disc');
      } else {
        const error = await response.json();
        message.error(error.error || 'Erro ao finalizar teste');
      }
    } catch (error) {
      console.error('Erro ao finalizar teste:', error);
      message.error('Erro ao finalizar teste');
    } finally {
      setLoading(false);
    }
  };

  const getFatorColor = (fator) => {
    const cores = {
      'D': '#ff4d4f',
      'I': '#faad14',
      'S': '#52c41a',
      'C': '#1890ff'
    };
    return cores[fator] || '#999';
  };

  const renderTelaInicial = () => (
    <Card style={{ maxWidth: 800, margin: '20px auto', padding: '16px' }}>
      <div style={{ textAlign: 'center' }}>
        <Title level={2} style={{ fontSize: '24px', marginBottom: 16 }}>Teste de Perfil DISC</Title>
        <Paragraph style={{ fontSize: '15px', marginBottom: 24 }}>
          O DISC é uma ferramenta de avaliação comportamental que identifica seu estilo de trabalho e comunicação.
        </Paragraph>

        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={12} md={12}>
            <Card style={{ backgroundColor: '#fff1f0', border: '1px solid #ff4d4f', padding: '8px' }}>
              <Tag color="red" style={{ marginBottom: 4, fontSize: '12px' }}>D - Dominância</Tag>
              <Text style={{ fontSize: '13px', display: 'block' }}>Focado em resultados, direto e decisivo</Text>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={12}>
            <Card style={{ backgroundColor: '#fffbe6', border: '1px solid #faad14', padding: '8px' }}>
              <Tag color="gold" style={{ marginBottom: 4, fontSize: '12px' }}>I - Influência</Tag>
              <Text style={{ fontSize: '13px', display: 'block' }}>Comunicativo, entusiasta e persuasivo</Text>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={12}>
            <Card style={{ backgroundColor: '#f6ffed', border: '1px solid #52c41a', padding: '8px' }}>
              <Tag color="green" style={{ marginBottom: 4, fontSize: '12px' }}>S - Estabilidade</Tag>
              <Text style={{ fontSize: '13px', display: 'block' }}>Paciente, leal e harmonioso</Text>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={12}>
            <Card style={{ backgroundColor: '#e6f7ff', border: '1px solid #1890ff', padding: '8px' }}>
              <Tag color="blue" style={{ marginBottom: 4, fontSize: '12px' }}>C - Conformidade</Tag>
              <Text style={{ fontSize: '13px', display: 'block' }}>Analítico, preciso e sistemático</Text>
            </Card>
          </Col>
        </Row>

        <Alert
          message="Importante"
          description="O teste contém 24 questões. Para cada questão, você escolherá a palavra que MAIS descreve você e a que MENOS descreve você."
          type="info"
          showIcon
          style={{ marginBottom: 24, textAlign: 'left' }}
        />

        <Button 
          type="primary" 
          size="large"
          onClick={iniciarTeste}
          loading={loading}
        >
          Iniciar Teste DISC
        </Button>
      </div>
    </Card>
  );

  const renderQuestao = () => {
    if (!questoes.length) return null;

    const questao = questoes[questaoAtual];
    const respostaQuestao = respostas[questao.id] || {};
    const progresso = ((questaoAtual + 1) / questoes.length) * 100;

    return (
      <Card style={{ maxWidth: 800, margin: '20px auto', padding: '16px' }}>
        <div style={{ marginBottom: 20 }}>
          <Progress 
            percent={Math.round(progresso)} 
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: '14px' }}>
            Questão {questaoAtual + 1} de {questoes.length}
          </Text>
        </div>

        <Title level={4} style={{ marginBottom: 8, textAlign: 'center', fontSize: '18px' }}>
          {questao.instrucao}
        </Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24, fontSize: '14px' }}>
          Escolha uma palavra de cada coluna
        </Text>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={12}>
            <Card style={{ background: '#f0f9ff', border: '2px solid #1890ff' }}>
              <Title level={5} style={{ textAlign: 'center', color: '#1890ff', marginBottom: 16 }}>
                ✅ MAIS descreve você
              </Title>
              <Radio.Group 
                value={respostaQuestao.mais}
                onChange={(e) => selecionarResposta(questao.id, e.target.value, 'mais')}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {questao.opcoes.map(opcao => (
                    <Radio 
                      key={opcao.id} 
                      value={opcao.id}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px',
                        background: respostaQuestao.mais === opcao.id ? '#e6f7ff' : 'white',
                        border: respostaQuestao.mais === opcao.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: respostaQuestao.mais === opcao.id ? 'bold' : 'normal',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {opcao.texto}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Card>
          </Col>

          <Col xs={24} sm={24} md={12}>
            <Card style={{ background: '#fff1f0', border: '2px solid #ff4d4f' }}>
              <Title level={5} style={{ textAlign: 'center', color: '#ff4d4f', marginBottom: 16 }}>
                ❌ MENOS descreve você
              </Title>
              <Radio.Group 
                value={respostaQuestao.menos}
                onChange={(e) => selecionarResposta(questao.id, e.target.value, 'menos')}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {questao.opcoes.map(opcao => (
                    <Radio 
                      key={opcao.id} 
                      value={opcao.id}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px',
                        background: respostaQuestao.menos === opcao.id ? '#fff1f0' : 'white',
                        border: respostaQuestao.menos === opcao.id ? '2px solid #ff4d4f' : '1px solid #d9d9d9',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: respostaQuestao.menos === opcao.id ? 'bold' : 'normal',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {opcao.texto}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={questaoAnterior}
            disabled={questaoAtual === 0}
            style={{ flex: '1', minWidth: '120px' }}
          >
            Anterior
          </Button>

          {questaoAtual < questoes.length - 1 ? (
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={proximaQuestao}
              iconPosition="end"
              style={{ flex: '1', minWidth: '120px' }}
            >
              Próxima
            </Button>
          ) : (
            <Button
              type="primary"
              style={{ flex: '1', minWidth: '120px' }}
              icon={<CheckCircleOutlined />}
              onClick={finalizarTeste}
              loading={loading}
            >
              Finalizar Teste
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const renderResultado = () => {
    if (!resultado) return null;

    return (
      <Card style={{ maxWidth: 800, margin: '40px auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
          <Title level={2} style={{ marginTop: 16 }}>Teste Concluído!</Title>
          <Text type="secondary">Seu perfil DISC foi calculado com sucesso</Text>
        </div>

        <Alert
          message="Resultado calculado"
          description="Clique no botão abaixo para ver seu perfil completo com gráficos e interpretação detalhada."
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <div style={{ textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/cliente/resultado-disc')}
          >
            Ver Meu Perfil DISC
          </Button>
        </div>
      </Card>
    );
  };

  const renderJaFez = () => (
    <Card style={{ maxWidth: 800, margin: '40px auto', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
        <Title level={2} style={{ marginTop: 16 }}>Você já fez o Teste DISC</Title>
        <Paragraph style={{ fontSize: '16px' }}>
          Você já possui um resultado do teste DISC em nossa plataforma.
        </Paragraph>

        <Button 
          type="primary" 
          size="large"
          onClick={() => navigate('/cliente/resultado-disc')}
          style={{ marginTop: 16 }}
        >
          Ver Meu Resultado
        </Button>
      </div>
    </Card>
  );

  if (jaFezTeste && !testeIniciado) {
    return renderJaFez();
  }

  if (!testeIniciado) {
    return renderTelaInicial();
  }

  if (testeConcluido) {
    return renderResultado();
  }

  return renderQuestao();
};

export default TesteDISC;
