import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Progress, Row, Col, Typography, message, Spin } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const TesteMultiplasInteligencias = ({ showBackButton = true, onBack = null }) => {
  const [perguntas, setPerguntas] = useState([]);
  const [possibilidades, setPossibilidades] = useState([]);
  const [respostas, setRespostas] = useState([]);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [testeIniciado, setTesteIniciado] = useState(false); // Começar como false para mostrar tela inicial
  const [testeConcluido, setTesteConcluido] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    console.log('=== INICIANDO FETCH DE DADOS ===');
    try {
      setLoading(true);
      
      // Definir possibilidades padrão
      const possibilidadesPadrao = [
        { id: 1, texto: 'Discordo Completamente', valor: 1, ordem: 1 },
        { id: 2, texto: 'Discordo um Pouco', valor: 2, ordem: 2 },
        { id: 3, texto: 'Incerto', valor: 3, ordem: 3 },
        { id: 4, texto: 'Concordo um Pouco', valor: 4, ordem: 4 },
        { id: 5, texto: 'Concordo Totalmente', valor: 5, ordem: 5 }
      ];
      setPossibilidades(possibilidadesPadrao);
      console.log('Possibilidades padrão definidas:', possibilidadesPadrao.length);
      
      // Buscar perguntas da API
      try {
        console.log('Buscando perguntas da API...');
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8002/api/perguntas', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Resposta da API:', data);
        
        if (data.success && Array.isArray(data.data)) {
          // Ordenar perguntas por ordem
          const perguntasOrdenadas = data.data.sort((a, b) => a.ordem - b.ordem);
          setPerguntas(perguntasOrdenadas);
          console.log(`${perguntasOrdenadas.length} perguntas carregadas da API`);
        } else {
          throw new Error('Formato de resposta inválido');
        }
        
      } catch (apiError) {
        console.error('Erro ao buscar perguntas da API:', apiError);
        message.warning('Não foi possível carregar as perguntas da API. Usando perguntas de exemplo.');
        
        // Fallback para perguntas de exemplo
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
          },
          {
            id: 3,
            texto: 'Tenho facilidade para visualizar objetos em 3D na minha mente.',
            ordem: 3,
            categoria: { id: 3, nome: 'Espacial', cor: '#fa8c16' }
          },
          {
            id: 4,
            texto: 'Gosto de fazer exercícios físicos e atividades manuais.',
            ordem: 4,
            categoria: { id: 4, nome: 'Corporal-Cinestésica', cor: '#eb2f96' }
          },
          {
            id: 5,
            texto: 'Consigo identificar facilmente diferentes sons e ritmos musicais.',
            ordem: 5,
            categoria: { id: 5, nome: 'Musical', cor: '#722ed1' }
          }
        ];
        setPerguntas(perguntasExemplo);
      }

      // Tentar buscar possibilidades da API também
      try {
        const token = localStorage.getItem('token');
        const possResponse = await fetch('http://localhost:8002/api/possibilidades', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (possResponse.ok) {
          const possData = await possResponse.json();
          if (possData.success && Array.isArray(possData.data)) {
            const possOrdenadas = possData.data.sort((a, b) => a.ordem - b.ordem);
            setPossibilidades(possOrdenadas);
            console.log(`${possOrdenadas.length} possibilidades carregadas da API`);
          }
        }
      } catch (possError) {
        console.log('Usando possibilidades padrão:', possError.message);
      }

    } catch (error) {
      console.error('Erro geral no fetchDados:', error);
      message.error('Erro ao carregar dados do teste');
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

  const iniciarTeste = () => {
    setTesteIniciado(true);
  };

  const reiniciarTeste = () => {
    setTesteIniciado(false); // Voltar para a tela inicial
    setTesteConcluido(false);
    setRespostas([]);
    setPerguntaAtual(0);
  };

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
    const perguntaId = perguntas[perguntaAtual]?.id;
    if (!perguntaId) return null;
    return respostas.find(r => r.pergunta_id === perguntaId)?.possibilidade_id;
  };

  const obterTextoRespostaSelecionada = () => {
    const possibilidadeId = obterRespostaSelecionada();
    const possibilidade = possibilidades.find(p => p.id === possibilidadeId);
    return possibilidade ? possibilidade.texto : null;
  };

  const finalizarTeste = async () => {
    try {
      console.log('🚀 INICIANDO FINALIZAÇÃO DO TESTE');
      setLoading(true);
      
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      const token = localStorage.getItem('token');
      
      console.log('👤 Dados do usuário:', usuario);
      console.log('🔑 Token disponível:', token ? 'SIM' : 'NÃO');
      console.log('📝 Total de respostas coletadas:', respostas.length);
      console.log('📋 Respostas completas:', respostas);
      
      // ETAPA 1: Salvar as respostas do teste
      console.log('');
      console.log('=== ETAPA 1: SALVANDO RESPOSTAS ===');
      
      const payloadRespostas = {
        usuario_id: usuario?.id,
        nome_usuario: usuario?.nome,
        email_usuario: usuario?.email,
        nome: "Teste de Inteligências Múltiplas",
        descricao: "Teste para avaliar as 8 inteligências múltiplas segundo a teoria de Howard Gardner",
        titulo: "Inteligências Múltiplas",
        ativo: true,
        tipo: "inteligencias_multiplas",
        status: "finalizado",
        data_realizacao: new Date().toISOString(),
        respostas: respostas.map(r => ({
          pergunta_id: r.pergunta_id,
          possibilidade_id: r.possibilidade_id
        }))
      };
      
      console.log('📤 Payload para /api/testes:');
      console.log('   - usuario_id:', payloadRespostas.usuario_id);
      console.log('   - nome_usuario:', payloadRespostas.nome_usuario);
      console.log('   - email_usuario:', payloadRespostas.email_usuario);
      console.log('   - total respostas:', payloadRespostas.respostas.length);
      console.log('   - primeiras 3 respostas:', payloadRespostas.respostas.slice(0, 3));
      
      console.log('🌐 Fazendo requisição para:', 'http://localhost:8002/api/testes');
      
      let responseRespostas;
      try {
        responseRespostas = await fetch('http://localhost:8002/api/testes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : undefined
          },
          body: JSON.stringify(payloadRespostas)
        });
        
        console.log('📡 Resposta recebida:');
        console.log('   - Status:', responseRespostas.status);
        console.log('   - Status text:', responseRespostas.statusText);
        console.log('   - Headers:', Object.fromEntries(responseRespostas.headers.entries()));
        
      } catch (fetchError) {
        console.error('❌ Erro na requisição fetch:', fetchError);
        throw new Error(`Erro de rede: ${fetchError.message}`);
      }
      
      if (!responseRespostas.ok) {
        let errorText = 'Erro desconhecido';
        try {
          errorText = await responseRespostas.text();
          console.error('❌ Erro do servidor (texto):', errorText);
        } catch (textError) {
          console.error('❌ Erro ao ler resposta de erro:', textError);
        }
        
        throw new Error(`Erro HTTP ${responseRespostas.status}: ${errorText}`);
      }
      
      let resultadoRespostas;
      try {
        resultadoRespostas = await responseRespostas.json();
        console.log('✅ Resposta JSON das respostas:', resultadoRespostas);
      } catch (jsonError) {
        console.error('❌ Erro ao parsear JSON da resposta:', jsonError);
        const texto = await responseRespostas.text();
        console.log('📄 Texto da resposta:', texto);
        throw new Error('Resposta inválida do servidor');
      }
      
      // Pegar o teste_id retornado pelo backend
      const testeId = resultadoRespostas.data?.id || resultadoRespostas.id || resultadoRespostas.teste_id;
      console.log('🆔 ID do teste obtido:', testeId);
      console.log('🆔 Estrutura completa da resposta:', resultadoRespostas);
      
      if (!testeId) {
        console.warn('⚠️ ATENÇÃO: Nenhum ID de teste retornado pelo backend!');
        console.warn('⚠️ Resposta completa:', JSON.stringify(resultadoRespostas, null, 2));
        throw new Error('Backend não retornou ID do teste. Verifique se o teste foi criado corretamente.');
      }
      
      // ETAPA 2: Calcular e salvar resultados por categoria
      console.log('');
      console.log('=== ETAPA 2: CALCULANDO RESULTADOS POR CATEGORIA ===');
      
      // Calcular pontuação por categoria
      const pontuacaoPorCategoria = {};
      const totalPorCategoria = {};
      
      console.log('📊 Analisando perguntas para cálculo...');
      console.log('   - Total de perguntas disponíveis:', perguntas.length);
      
      // Inicializar contadores para todas as categorias
      perguntas.forEach((pergunta, index) => {
        const categoriaId = pergunta.categoria?.id;
        console.log(`   Pergunta ${index + 1}: categoria_id = ${categoriaId}, categoria_nome = ${pergunta.categoria?.nome}`);
        
        if (categoriaId) {
          if (!pontuacaoPorCategoria[categoriaId]) {
            pontuacaoPorCategoria[categoriaId] = 0;
            totalPorCategoria[categoriaId] = 0;
          }
        }
      });
      
      console.log('🏷️ Categorias encontradas:', Object.keys(pontuacaoPorCategoria));
      
      // Somar pontuações por categoria
      console.log('🧮 Calculando pontuações...');
      respostas.forEach((resposta, index) => {
        const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
        if (pergunta && pergunta.categoria) {
          const categoriaId = pergunta.categoria.id;
          const valor = resposta.valor_resposta || 0;
          pontuacaoPorCategoria[categoriaId] += valor;
          totalPorCategoria[categoriaId] += 1;
          
          console.log(`   Resposta ${index + 1}: pergunta_id=${resposta.pergunta_id}, categoria=${categoriaId}, valor=${valor}`);
        } else {
          console.warn(`   ⚠️ Resposta ${index + 1}: pergunta não encontrada ou sem categoria (pergunta_id=${resposta.pergunta_id})`);
        }
      });
      
      console.log('📈 Pontuação final por categoria:', pontuacaoPorCategoria);
      console.log('📊 Total de perguntas por categoria:', totalPorCategoria);
      
      console.log('');
      console.log('=== SALVANDO RESULTADOS INDIVIDUAIS ===');
      
      // Salvar resultado para cada categoria
      const promises = [];
      const categoriasParaSalvar = Object.entries(pontuacaoPorCategoria);
      console.log(`📋 Salvando ${categoriasParaSalvar.length} categorias...`);
      
      for (const [categoriaId, pontuacao] of categoriasParaSalvar) {
        const totalPerguntas = totalPorCategoria[categoriaId];
        const pontuacaoMaxima = totalPerguntas * 5; // Assumindo escala de 1-5
        const percentual = pontuacaoMaxima > 0 ? Math.round((pontuacao / pontuacaoMaxima) * 100) : 0;
        
        const payloadResultado = {
          teste_id: testeId, // Usar o ID real retornado pelo backend
          categoria_id: parseInt(categoriaId),
          pontuacao: pontuacao,
          percentual: percentual
        };
        
        console.log(`📤 Categoria ${categoriaId}:`, payloadResultado);
        console.log(`   - Pontuação: ${pontuacao}/${pontuacaoMaxima} (${percentual}%)`);
        console.log(`   - Usando teste_id: ${testeId} (retornado pelo backend)`);
        
        const promise = fetch('http://localhost:8002/api/resultados', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : undefined
          },
          body: JSON.stringify(payloadResultado)
        }).then(async (response) => {
          console.log(`📡 Resposta categoria ${categoriaId}: status ${response.status}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Erro categoria ${categoriaId}:`, errorText);
            return { sucesso: false, categoria: categoriaId, erro: errorText };
          }
          
          const resultado = await response.json();
          console.log(`✅ Sucesso categoria ${categoriaId}:`, resultado);
          return { sucesso: true, categoria: categoriaId, dados: resultado };
        }).catch(error => {
          console.error(`❌ Erro de rede categoria ${categoriaId}:`, error);
          return { sucesso: false, categoria: categoriaId, erro: error.message };
        });
        
        promises.push(promise);
      }
      
      // Aguardar todos os resultados serem salvos
      console.log('⏳ Aguardando salvamento de todas as categorias...');
      const resultados = await Promise.all(promises);
      
      // Verificar se todos foram salvos com sucesso
      const sucessos = resultados.filter(r => r.sucesso);
      const erros = resultados.filter(r => !r.sucesso);
      
      console.log(`✅ Sucessos: ${sucessos.length}/${resultados.length}`);
      console.log(`❌ Erros: ${erros.length}/${resultados.length}`);
      
      if (erros.length > 0) {
        console.log('📋 Detalhes dos erros:');
        erros.forEach(erro => {
          console.log(`   - Categoria ${erro.categoria}: ${erro.erro}`);
        });
      }
      
      if (sucessos.length === resultados.length) {
        console.log('🎉 TESTE FINALIZADO COM SUCESSO TOTAL!');
        message.success('Teste concluído com sucesso! Todas as suas respostas e resultados foram salvos.');
        setTesteConcluido(true);
      } else if (sucessos.length > 0) {
        console.log('⚠️ TESTE FINALIZADO COM SUCESSO PARCIAL');
        message.warning(`Teste concluído com ${sucessos.length}/${resultados.length} categorias salvas com sucesso.`);
        setTesteConcluido(true);
      } else {
        throw new Error('Nenhuma categoria foi salva com sucesso');
      }
      
    } catch (error) {
      console.error('💥 ERRO GERAL AO FINALIZAR TESTE:');
      console.error('   - Tipo:', error.constructor.name);
      console.error('   - Mensagem:', error.message);
      console.error('   - Stack:', error.stack);
      message.error(`Erro ao finalizar teste: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

      {/* Tela inicial do teste */}
      {!testeIniciado && !testeConcluido && perguntas.length > 0 && (
        <Card style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ padding: '40px 20px' }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: 24 }}>
              <PlayCircleOutlined style={{ marginRight: 12 }} />
              Teste de Inteligências Múltiplas
            </Title>
            
            <div style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: '16px', lineHeight: '1.8', display: 'block', marginBottom: 16 }}>
                Este teste foi desenvolvido para ajudar você a descobrir quais são suas inteligências predominantes 
                de acordo com a teoria das Inteligências Múltiplas de Howard Gardner.
              </Text>
              
              <Text style={{ fontSize: '16px', lineHeight: '1.8', display: 'block', marginBottom: 16 }}>
                Você responderá a <strong>{perguntas.length} perguntas</strong> que avaliam diferentes aspectos 
                das suas habilidades e preferências. Não existem respostas certas ou erradas - 
                responda de forma honesta e espontânea.
              </Text>
              
              <Text style={{ fontSize: '14px', color: '#666', display: 'block' }}>
                ⏱️ Tempo estimado: 10-15 minutos
              </Text>
            </div>

            <div style={{ 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: 8, 
              padding: 16, 
              marginBottom: 32 
            }}>
              <Text style={{ fontSize: '14px', color: '#52c41a' }}>
                <CheckCircleOutlined style={{ marginRight: 8 }} />
                Dica: Leia cada pergunta com atenção e escolha a opção que melhor representa como você se sente ou age na maioria das situações.
              </Text>
            </div>

            <Button 
              type="primary" 
              size="large" 
              icon={<PlayCircleOutlined />}
              onClick={iniciarTeste}
              style={{ 
                height: 50, 
                fontSize: 16, 
                paddingLeft: 32, 
                paddingRight: 32 
              }}
            >
              Iniciar Teste
            </Button>
          </div>
        </Card>
      )}

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
                  selecionarResposta(e.target.value, possibilidade.valor);
                }
              }}
              style={{ width: '100%' }}
            >
              <Row gutter={[16, 16]}>
                {possibilidades.map((possibilidade) => (
                  <Col span={24} key={possibilidade.id}>
                    <div
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        backgroundColor: obterRespostaSelecionada() === possibilidade.id ? '#e6f7ff' : '#fff',
                        borderColor: obterRespostaSelecionada() === possibilidade.id ? '#1890ff' : '#d9d9d9'
                      }}
                      onClick={() => {
                        selecionarResposta(possibilidade.id, possibilidade.valor);
                      }}
                    >
                      <Radio value={possibilidade.id} style={{ width: '100%' }}>
                        <span style={{ fontSize: '16px', marginLeft: 8 }}>
                          {possibilidade.texto}
                        </span>
                      </Radio>
                    </div>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </div>

          {obterRespostaSelecionada() && (
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#f6ffed', 
              border: '1px solid #b7eb8f',
              borderRadius: '6px',
              marginBottom: 32,
              textAlign: 'center'
            }}>
              <Text style={{ color: '#52c41a' }}>
                ✓ Resposta selecionada: <strong>{obterTextoRespostaSelecionada()}</strong>
              </Text>
            </div>
          )}

          <Row justify="space-between" align="middle">
            <Col>
              <Button 
                onClick={perguntaAnterior} 
                disabled={perguntaAtual === 0}
                icon={<ArrowLeftOutlined />}
              >
                Anterior
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                onClick={proximaPergunta}
                disabled={!obterRespostaSelecionada()}
                icon={perguntaAtual === perguntas.length - 1 ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
              >
                {perguntaAtual === perguntas.length - 1 ? 'Finalizar Teste' : 'Próxima'}
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {testeConcluido && (
        <Card style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ padding: '40px 20px' }}>
            <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: 24 }} />
            <Title level={2} style={{ color: '#52c41a', marginBottom: 16 }}>
              Teste Concluído!
            </Title>
            <Text style={{ fontSize: '16px', marginBottom: 32, display: 'block' }}>
              Obrigado por completar o teste de inteligências múltiplas. Seus resultados foram salvos e 
              em breve você poderá visualizar seu perfil detalhado das 8 inteligências.
            </Text>
            
            <div style={{ marginTop: 32 }}>
              <Button onClick={reiniciarTeste} style={{ marginRight: 16 }}>
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