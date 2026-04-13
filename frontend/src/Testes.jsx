import React, { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Tag, Progress, message, Modal, Alert, Row, Col } from 'antd';
import { FileTextOutlined, PlayCircleOutlined, CheckCircleOutlined, ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TesteMultiplasInteligencias from './TesteMultiplasInteligencias';
import TesteDominancia from './TesteDominancia';
import TesteDISC from './TesteDISC';
import API_BASE_URL from './config/api';

const { Title, Text, Paragraph } = Typography;

function Testes({ user }) {
  const [testes, setTestes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMultiplasInteligencias, setShowMultiplasInteligencias] = useState(false);
  const [showDominancia, setShowDominancia] = useState(false);
  const [showDISC, setShowDISC] = useState(false);
  const [testeInteligenciasCompleto, setTesteInteligenciasCompleto] = useState(false);
  const [testeDominanciaCompleto, setTesteDominanciaCompleto] = useState(false);
  const [testeDISCCompleto, setTesteDISCCompleto] = useState(false);
  const [podeRefazerTeste, setPodeRefazerTeste] = useState(false);
  const [permissoes, setPermissoes] = useState({
    disc: false,
    dominancia: false,
    inteligencias: false
  });
  const navigate = useNavigate();


  useEffect(() => {
    // Primeiro verificar se já fez o teste, depois carregar a lista
    const inicializar = async () => {
      await verificarPermissoes();
      await verificarTesteCompleto();
      await verificarTesteDominancia();
      await verificarTesteDISC();
    };
    inicializar();
  }, []); // Verificação inicial

  // Verificar permissões do usuário
  const verificarPermissoes = async () => {
    try {
      const token = localStorage.getItem('token');
      let usuario = {};
      try {
        usuario = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {}
      
      if (!usuario.id) {
        // Decodificar do token JWT
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const jwtUser = JSON.parse(jsonPayload);
          usuario.id = jwtUser.id || jwtUser.userId || jwtUser.sub || null;
        } catch {}
      }

      if (!usuario.id) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/usuarios/${usuario.id}/permissoes-testes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPermissoes(data);
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
    }
  };

  // Verifica se o teste de Dominância Cerebral já foi feito
  const verificarTesteDominancia = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/testes-dominancia/verificar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTesteDominanciaCompleto(data.jaFez || false);
      } else {
        setTesteDominanciaCompleto(false);
      }
    } catch (error) {
      setTesteDominanciaCompleto(false);
    }
  };

  useEffect(() => {
    // Recarregar lista sempre que o status mudar
    fetchTestes();
  }, [testeInteligenciasCompleto, testeDominanciaCompleto, testeDISCCompleto, permissoes]); // Recarregar quando status do teste ou permissões mudarem

  const verificarTesteDISC = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/testes-disc/verificar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTesteDISCCompleto(data.jaFez || false);
      }
    } catch (error) {
      console.error('Erro ao verificar teste DISC:', error);
      setTesteDISCCompleto(false);
    }
  };

  const verificarTesteCompleto = async () => {
    try {
      console.log('🔍 Verificando se já fez o teste...');
      const token = localStorage.getItem('token');
      // Buscar usuário do localStorage ou decodificar do token JWT
      let usuario = {};
      try {
        usuario = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {}
      if (!usuario.id) {
        // Decodificar do token JWT
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const jwtUser = JSON.parse(jsonPayload);
          usuario.id = jwtUser.id || jwtUser.userId || jwtUser.sub || null;
        } catch {}
      }
      if (!usuario.id) {
        message.error('Não foi possível identificar o usuário. Faça login novamente.');
        setTesteInteligenciasCompleto(false);
        return;
      }
      // Chamada correta com usuario_id
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/testes-inteligencia/verificar?usuario_id=${usuario.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.log('❌ API /verificar não encontrada, tentando buscar todos os testes...');
        // Se não existir, tentar buscar todos os testes do usuário e verificar
        response = await fetch(`${API_BASE_URL}/api/testes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const testes = await response.json();
          console.log('� Todos os testes do usuário:', testes);
          // Verificar se algum teste é de inteligências múltiplas (concluído ou não)
          const testeInteligencias = testes.find(t => 
            t.titulo && t.titulo.includes('Inteligências Múltiplas')
          );
          // Se encontrou um teste de inteligências, assumir que foi concluído
          const jaFez = !!testeInteligencias;
          console.log('✅ Resultado da verificação manual (TEMPORÁRIO):', jaFez ? 'JÁ FEZ' : 'PODE FAZER');
          console.log('📊 Teste encontrado:', testeInteligencias);
          setTesteInteligenciasCompleto(jaFez);
          return;
        }
      }
      console.log('�📡 Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dados recebidos:', data);
        setTesteInteligenciasCompleto(data.jaFez || false);
        console.log('✅ Status do teste definido como:', data.jaFez ? 'JÁ FEZ' : 'PODE FAZER');
      } else {
        console.log('❌ Erro na resposta, assumindo que pode fazer');
        setTesteInteligenciasCompleto(false);
      }
    } catch (error) {
      console.error('💥 Erro ao verificar se já fez o teste:', error);
      setTesteInteligenciasCompleto(false);
    }
  };

  const fetchTestes = async () => {
    try {
      console.log('🔄 Recarregando lista de testes...');
      console.log('📈 Estado testeInteligenciasCompleto:', testeInteligenciasCompleto);
      console.log('🧠 Estado testeDominanciaCompleto:', testeDominanciaCompleto);
      console.log('🎯 Estado testeDISCCompleto:', testeDISCCompleto);
      console.log('🔐 Permissões:', permissoes);
      
      // Lista com os três testes disponíveis
      const mockTestes = [
        {
          id: 1,
          titulo: 'Teste de Múltiplas Inteligências',
          descricao: 'Descubra suas inteligências dominantes e como aplicá-las no trabalho',
          perguntas: 60,
          tempoEstimado: '15-20 min',
          status: testeInteligenciasCompleto ? 'concluido' : (permissoes.inteligencias ? 'disponivel' : 'bloqueado'),
          tipo: 'inteligencias',
          liberado: permissoes.inteligencias,
          imagem: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop'
        },
        {
          id: 2,
          titulo: 'Teste de Dominância Cerebral',
          descricao: 'Identifique seu perfil de dominância cerebral baseado no modelo de Ned Herrmann',
          perguntas: 8,
          tempoEstimado: '10-15 min',
          status: testeDominanciaCompleto ? 'concluido' : (permissoes.dominancia ? 'disponivel' : 'bloqueado'),
          tipo: 'dominancia',
          liberado: permissoes.dominancia,
          imagem: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop'
        },
        {
          id: 3,
          titulo: 'Teste DISC',
          descricao: 'Avalie seu perfil comportamental: Dominância, Influência, Estabilidade e Conformidade',
          perguntas: 24,
          tempoEstimado: '8-10 min',
          status: testeDISCCompleto ? 'concluido' : (permissoes.disc ? 'disponivel' : 'bloqueado'),
          tipo: 'disc',
          liberado: permissoes.disc,
          imagem: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop'
        }
      ];
      
      console.log('📋 Testes criados:', mockTestes);
      setTestes(mockTestes);
      setLoading(false);
    } catch (error) {
      message.error('Erro ao carregar testes');
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'concluido':
        return <Tag color="success">Concluído</Tag>;
      case 'em_andamento':
        return <Tag color="processing">Em Andamento</Tag>;
      case 'bloqueado':
        return <Tag color="red">Bloqueado</Tag>;
      default:
        return <Tag color="default">Disponível</Tag>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'concluido':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'em_andamento':
        return <PlayCircleOutlined style={{ color: '#1890ff' }} />;
      case 'bloqueado':
        return <FileTextOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  const handleStartTest = (teste) => {
    // Verificar se o teste está bloqueado
    if (teste.status === 'bloqueado' || !teste.liberado) {
      Modal.warning({
        title: 'Teste Bloqueado',
        content: 'Este teste não está disponível para você no momento. Entre em contato com seu consultor para liberar o acesso.',
        okText: 'Entendi'
      });
      return;
    }

    if (teste.tipo === 'inteligencias') {
      // Se o teste já foi concluído, redireciona para página de resultados
      if (teste.status === 'concluido') {
        navigate('/resultados-inteligencias');
        return;
      }
      // Se não foi concluído, mostra o teste
      setShowMultiplasInteligencias(true);
    } else if (teste.tipo === 'dominancia') {
      // Mostra o teste de dominância cerebral
      setShowDominancia(true);
    } else if (teste.tipo === 'disc') {
      // Se já foi concluído, redireciona para resultado
      if (teste.status === 'concluido') {
        navigate('/cliente/resultado-disc');
        return;
      }
      // Se não foi concluído, mostra o teste
      setShowDISC(true);
    }
  };

  const voltarParaListaTestes = () => {
    setShowMultiplasInteligencias(false);
    setShowDominancia(false);
    setShowDISC(false);
  };

  const onTesteCompleto = async () => {
    console.log('🎉 Teste concluído! Atualizando status...');
    // Aguardar um pouco para garantir que o backend processou
    setTimeout(async () => {
      console.log('🔄 Re-verificando status após conclusão...');
      await verificarTesteCompleto();
      await verificarTesteDominancia();
      setShowMultiplasInteligencias(false);
      setShowDominancia(false);
      message.success('Teste concluído com sucesso!');
    }, 2000);
  };

  return (
    <div style={{ 
      padding: window.innerWidth < 768 ? '20px 16px' : '40px 48px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {showMultiplasInteligencias ? (
        // Mostra o teste de múltiplas inteligências
        <div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={voltarParaListaTestes}
            style={{ marginBottom: '24px' }}
          >
            Voltar aos Testes
          </Button>
          <TesteMultiplasInteligencias 
            showBackButton={false} 
            onBack={voltarParaListaTestes}
            onTesteCompleto={onTesteCompleto}
          />
        </div>
      ) : showDominancia ? (
        // Mostra o teste de dominância cerebral
        <div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={voltarParaListaTestes}
            style={{ marginBottom: '24px' }}
          >
            Voltar aos Testes
          </Button>
          <TesteDominancia onTesteCompleto={onTesteCompleto} />
        </div>
      ) : showDISC ? (
        // Mostra o teste DISC
        <div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={voltarParaListaTestes}
            style={{ marginBottom: '24px' }}
          >
            Voltar aos Testes
          </Button>
          <TesteDISC />
        </div>
      ) : (
        // Mostra a lista de testes
        <>
          {podeRefazerTeste && (
            <Alert
              message="🎉 Teste Liberado!"
              description="Você foi autorizado a refazer o Teste de Múltiplas Inteligências. Clique em 'Iniciar Teste' abaixo para começar novamente."
              type="success"
              showIcon
              icon={<ReloadOutlined />}
              style={{ marginBottom: '24px' }}
              closable
            />
          )}
          <Title level={2}>Avaliações de perfil e Testes comportamentais</Title>
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
            Acesse e realize os testes disponíveis para você! Este ambiente foi cuidadosamente organizado para facilitar seu acesso aos testes e ferramentas avaliativas do programa de OPC e Mentoria de Carreira, na etapa de AUTOCONHECIMENTO. 
            <br /><br />
            <b>Dicas importantes: </b>
            <br />- Responda cada pergunta com muita atenção; 
            <br />- Seja sincero nas respostas; 
            <br />- Separe um tempo para realizar o teste, para evitar interrupções e ruídos; 
            <br />- Escolha um lugar reservado para iniciar o teste.
          
          </Text>

          <Row gutter={[24, 24]}>
            {testes.map((teste) => (
              <Col xs={24} sm={24} md={12} lg={8} key={teste.id}>
                <Card
                  hoverable={teste.status !== 'bloqueado' && teste.liberado}
                  onClick={() => teste.status !== 'bloqueado' && teste.liberado && handleStartTest(teste)}
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: teste.status === 'bloqueado' ? '0 2px 8px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.08)',
                    opacity: teste.status === 'bloqueado' ? 0.6 : 1,
                    cursor: teste.status === 'bloqueado' || !teste.liberado ? 'not-allowed' : 'pointer',
                    minHeight: '280px'
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <Row>
                    <Col xs={24}>
                      <div style={{
                        height: '180px',
                        backgroundImage: teste.imagem ? `url(${teste.imagem})` : 'none',
                        backgroundColor: teste.imagem ? 'transparent' : '#e8e8e8',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }} />
                    </Col>
                    <Col xs={24}>
                      <div style={{ 
                        padding: '24px',
                        background: teste.status === 'concluido' ? '#1a1d2e' : '#007BFF',
                        minHeight: '180px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <Title level={5} style={{ color: 'white', marginBottom: 0, fontSize: '17px', fontWeight: '600' }}>
                              {teste.titulo}
                            </Title>
                            {getStatusIcon(teste.status)}
                          </div>
                          <Paragraph style={{ 
                            color: 'rgba(255,255,255,0.9)', 
                            fontSize: '13px',
                            marginBottom: '14px',
                            lineHeight: '1.5'
                          }}>
                            {teste.descricao}
                          </Paragraph>
                          {teste.status === 'bloqueado' && (
                            <Alert
                              message="Bloqueado - Contate seu consultor"
                              type="warning"
                              showIcon
                              style={{ marginBottom: '12px', fontSize: '11px' }}
                            />
                          )}
                          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '16px' }}>
                            <span>📝 {teste.perguntas} perguntas</span>
                            <span>⏱️ {teste.tempoEstimado}</span>
                          </div>
                        </div>
                        <Button 
                          type="default"
                          size="large"
                          disabled={teste.status === 'bloqueado' || !teste.liberado}
                          style={{
                            background: 'transparent',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.4)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            width: '100%',
                            height: '44px'
                          }}
                        >
                          {teste.status === 'bloqueado' ? '🔒 Bloqueado' :
                           teste.status === 'concluido' ? 'Ver resultado' :
                           teste.status === 'em_andamento' ? 'Continuar' : 'Fazer teste'}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
}

export default Testes;