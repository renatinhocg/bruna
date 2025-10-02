import React, { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Tag, Progress, message, Modal } from 'antd';
import { FileTextOutlined, PlayCircleOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TesteMultiplasInteligencias from './TesteMultiplasInteligencias';

const { Title, Text } = Typography;

function Testes({ user }) {
  const [testes, setTestes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMultiplasInteligencias, setShowMultiplasInteligencias] = useState(false);
  const [testeInteligenciasCompleto, setTesteInteligenciasCompleto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Primeiro verificar se já fez o teste, depois carregar a lista
    const inicializar = async () => {
      await verificarTesteCompleto();
    };
    inicializar();
  }, []); // Verificação inicial

  useEffect(() => {
    // Recarregar lista sempre que o status mudar
    fetchTestes();
  }, [testeInteligenciasCompleto]); // Recarregar quando status do teste mudar

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
        response = await fetch(`http://localhost:8002/api/testes-inteligencia/verificar?usuario_id=${usuario.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.log('❌ API /verificar não encontrada, tentando buscar todos os testes...');
        // Se não existir, tentar buscar todos os testes do usuário e verificar
        response = await fetch('http://localhost:8002/api/testes', {
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
      
      // Apenas o teste de múltiplas inteligências que realmente existe
      const mockTestes = [
        {
          id: 1,
          titulo: 'Teste de Múltiplas Inteligências',
          descricao: 'Descubra suas inteligências dominantes e como aplicá-las no trabalho',
          perguntas: 60,
          tempoEstimado: '15-20 min',
          status: testeInteligenciasCompleto ? 'concluido' : 'disponivel'
        }
      ];
      
      console.log('📋 Teste criado com status:', mockTestes[0].status);
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
      default:
        return <FileTextOutlined />;
    }
  };

  const handleStartTest = (teste) => {
    // Se o teste já foi concluído, redireciona para página de resultados
    if (teste.status === 'concluido') {
      navigate('/resultados-inteligencias');
      return;
    }
    // Se não foi concluído, mostra o teste
    setShowMultiplasInteligencias(true);
  };

  const voltarParaListaTestes = () => {
    setShowMultiplasInteligencias(false);
  };

  const onTesteCompleto = async () => {
    console.log('🎉 Teste concluído! Atualizando status...');
    
    // Aguardar um pouco para garantir que o backend processou
    setTimeout(async () => {
      console.log('🔄 Re-verificando status após conclusão...');
      await verificarTesteCompleto();
      setShowMultiplasInteligencias(false);
      message.success('Teste concluído com sucesso!');
    }, 2000);
  };

  return (
    <div>
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
      ) : (
        // Mostra a lista de testes
        <>
          <Title level={2}>Testes de Carreira</Title>
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
            Realize avaliações profissionais para entender melhor seu perfil e objetivos de carreira.
          </Text>

          <List
            loading={loading}
            dataSource={testes}
            renderItem={(teste) => (
              <List.Item style={{ marginBottom: '16px' }}>
                <Card
                  style={{ width: '100%' }}
                  actions={[
                    <Button
                      type={teste.status === 'concluido' ? 'default' : 'primary'}
                      icon={teste.status === 'concluido' ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={() => handleStartTest(teste)}
                      disabled={false} // Sempre habilitado, mas com função diferente
                    >
                      {teste.status === 'concluido' ? 'Visualizar Resultado' :
                       teste.status === 'em_andamento' ? 'Continuar' : 'Iniciar Teste'}
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={getStatusIcon(teste.status)}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{teste.titulo}</span>
                        {getStatusTag(teste.status)}
                      </div>
                    }
                    description={
                      <div>
                        <p style={{ marginBottom: '8px' }}>{teste.descricao}</p>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                          <span>📝 {teste.perguntas} perguntas</span>
                          <span>⏱️ {teste.tempoEstimado}</span>
                        </div>
                        {teste.status === 'em_andamento' && (
                          <div style={{ marginTop: '12px' }}>
                            <Text>Progresso: </Text>
                            <Progress percent={65} size="small" />
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        </>
      )}
    </div>
  );
}

export default Testes;