import React, { useState, useEffect } from 'react';
import { Card, Button, Checkbox, Radio, Progress, Typography, message, Alert, Tag, Modal } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import API_BASE_URL from './config/api';

const { Title, Text } = Typography;

const TesteDominancia = () => {
  const [questoes, setQuestoes] = useState([]);
  const [testeId, setTesteId] = useState(null);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostasSelecionadas, setRespostasSelecionadas] = useState({});
  const [testeConcluido, setTesteConcluido] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testeIniciado, setTesteIniciado] = useState(false);
  const [jaFezTeste, setJaFezTeste] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [quadranteSelecionado, setQuadranteSelecionado] = useState(null);

  useEffect(() => {
    verificarTeste();
  }, []);

  const verificarTeste = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/testes-dominancia/verificar`, {
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
      const response = await fetch(`${API_BASE_URL}/api/testes-dominancia/resultado`, {
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
      const response = await fetch(`${API_BASE_URL}/api/testes-dominancia/questoes`, {
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
      
      const response = await fetch(`${API_BASE_URL}/api/testes-dominancia/iniciar`, {
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
        message.success('Teste iniciado! Boa sorte!');
      }
    } catch (error) {
      console.error('Erro ao iniciar teste:', error);
      message.error('Erro ao iniciar teste');
    } finally {
      setLoading(false);
    }
  };

  const selecionarOpcao = (questaoId, opcaoId, grupo = null) => {
    const key = questaoId;
    const opcoesSelecionadas = respostasSelecionadas[key] || [];
    
    // Se a questão tem grupos, lógica diferente
    if (grupo !== null) {
      // Para questões com grupos, substituir a seleção do grupo
      const novasOpcoes = opcoesSelecionadas.filter(id => {
        const questao = questoes[questaoAtual];
        const opcao = questao.opcoes.find(o => o.id === id);
        return opcao && opcao.grupo !== grupo;
      });
      novasOpcoes.push(opcaoId);
      
      setRespostasSelecionadas({
        ...respostasSelecionadas,
        [key]: novasOpcoes
      });
    } else {
      // Lógica original para questões sem grupos
      if (opcoesSelecionadas.includes(opcaoId)) {
        // Remover se já estava selecionada
        setRespostasSelecionadas({
          ...respostasSelecionadas,
          [key]: opcoesSelecionadas.filter(id => id !== opcaoId)
        });
      } else {
        // Adicionar se não ultrapassar 4 opções
        if (opcoesSelecionadas.length < 4) {
          setRespostasSelecionadas({
            ...respostasSelecionadas,
            [key]: [...opcoesSelecionadas, opcaoId]
          });
        } else {
          message.warning('Você só pode selecionar 4 opções por questão');
        }
      }
    }
  };

  const obterRespostasSelecionadas = () => {
    const questao = questoes[questaoAtual];
    return respostasSelecionadas[questao?.id] || [];
  };

  const proximaQuestao = async () => {
    const questao = questoes[questaoAtual];
    const opcoesSelecionadas = respostasSelecionadas[questao.id] || [];

    if (opcoesSelecionadas.length !== 4) {
      message.warning('Por favor, selecione exatamente 4 opções');
      return;
    }

    // Salvar respostas no backend
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await fetch(`${API_BASE_URL}/api/testes-dominancia/responder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teste_id: testeId,
          questao_id: questao.id,
          opcoes_ids: opcoesSelecionadas
        })
      });

      if (questaoAtual === questoes.length - 1) {
        // Última questão - finalizar teste
        await finalizarTeste();
      } else {
        setQuestaoAtual(questaoAtual + 1);
      }
    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      message.error('Erro ao salvar respostas');
    } finally {
      setLoading(false);
    }
  };

  const questaoAnterior = () => {
    if (questaoAtual > 0) {
      setQuestaoAtual(questaoAtual - 1);
    }
  };

  const finalizarTeste = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/testes-dominancia/finalizar`, {
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
      }
    } catch (error) {
      console.error('Erro ao finalizar teste:', error);
      message.error('Erro ao finalizar teste');
    } finally {
      setLoading(false);
    }
  };

  if (testeConcluido && resultado) {
    const quadrantes = [
      { key: 'SE', cor: '#1890ff', nome: 'Superior Esquerdo - Analítico' },
      { key: 'SD', cor: '#722ed1', nome: 'Superior Direito - Experimental' },
      { key: 'IE', cor: '#52c41a', nome: 'Inferior Esquerdo - Organizacional' },
      { key: 'ID', cor: '#fa8c16', nome: 'Inferior Direito - Interpessoal' }
    ];
    
    const maxPontuacao = Math.max(
      resultado.pontuacao_se, 
      resultado.pontuacao_sd, 
      resultado.pontuacao_ie, 
      resultado.pontuacao_id
    );

    // Funções para controlar os modais
    const abrirModal = (quadrante) => {
      setQuadranteSelecionado(quadrante);
      setModalAberto(true);
    };

    const fecharModal = () => {
      setModalAberto(false);
      setQuadranteSelecionado(null);
    };

    // Função para obter descrição detalhada de cada quadrante
    const obterDescricaoQuadrante = (quadrante) => {
      const descricoes = {
        SE: {
          nome: 'Superior Esquerdo - Pensadores Analíticos',
          titulo: 'Pensadores ANALÍTICOS',
          cor: '#00BCD4',
          descricao: 'São pessoas com pensamentos baseados em dados e fatos, precisam de objetividade e lógica, tendem a abordar problemas com uma mentalidade racional.',
          comunicacao: 'Para se comunicar eficazmente com pessoas que preferem o pensamento analítico, considere as seguintes estratégias:',
          estrategias: [
            'Concentre-se em apresentar evidências claras e argumentos racionais',
            'Use dados e números para apoiar suas ideias',
            'Esteja preparado para responder a perguntas detalhadas ou fornecer informações adicionais, se solicitado',
            'Evite linguagem excessivamente emocional ou subjetiva',
            'Fornecer informações estruturadas e organizadas de forma clara e concisa',
            'Destaque os benefícios lógicos e práticos de suas ideias'
          ],
          caracteristicas: [
            'Pensamento lógico e analítico',
            'Abordagem baseada em fatos e dados',
            'Preferência por análise quantitativa',
            'Capacidade crítica e questionadora',
            'Foco em resultados concretos',
            'Orientação para resolução técnica de problemas'
          ],
          perfil: 'Indivíduos com forte presença do quadrante SE são frequentemente descritos como práticos, objetivos e orientados para resultados. Eles destacam-se em situações que requerem análise rigorosa, tomada de decisões baseadas em evidências e pensamento crítico. Tendem a ser céticos em relação a abordagens puramente intuitivas ou emocionais, preferindo confiar em métodos comprovados e mensuráveis.',
          profissoes: 'Engenheiros, cientistas, analistas financeiros, programadores, matemáticos, contadores, pesquisadores, planejadores estratégicos, profissionais de TI, consultores técnicos.',
          aplicacao: 'No ambiente profissional, pessoas com dominância SE são valiosas em funções que exigem análise de dados, planejamento estratégico baseado em métricas e desenvolvimento de soluções técnicas. Elas devem ser incentivadas a colaborar com colegas de outros quadrantes para equilibrar a abordagem analítica com criatividade, organização e sensibilidade interpessoal.'
        },
        SD: {
          nome: 'Superior Direito - Pensadores Experimentais',
          titulo: 'Pensadores EXPERIMENTAIS',
          cor: '#FFC107',
          descricao: 'Pensadores experimentais são criativos e de mente aberta, frequentemente apresentando ideias e soluções inovadoras.',
          comunicacao: 'Para se comunicar eficazmente com pessoas que preferem o pensamento experimental, considere as seguintes estratégias:',
          estrategias: [
            'Incentive o brainstorming e o pensamento inovador',
            'Use linguagem e imagens criativas',
            'Esteja disposto a correr riscos e tentar novas abordagens',
            'Use metáforas e simbolismos para ilustrar seus pontos',
            'Enfatize o impacto ou significado potencial de suas ideias',
            'Esteja aberto a mudanças e disposto a se adaptar'
          ],
          caracteristicas: [
            'Pensamento holístico e integrador',
            'Abordagem intuitiva e criativa',
            'Capacidade de síntese e visão sistêmica',
            'Preferência por inovação e experimentação',
            'Facilidade com conceitos abstratos',
            'Orientação para o futuro e possibilidades'
          ],
          perfil: 'Indivíduos com forte presença do quadrante SD são frequentemente visionários, criativos e capazes de conectar ideias aparentemente desconexas. Eles prosperam em ambientes que valorizam a inovação, a exploração de novas abordagens e a liberdade para experimentar. Tendem a ser menos interessados em detalhes operacionais e mais focados em estratégias amplas e conceitos transformadores.',
          profissoes: 'Designers, artistas, estrategistas de negócios, empreendedores, consultores de inovação, arquitetos, publicitários, futuristas, criadores de conteúdo, pesquisadores em áreas interdisciplinares.',
          aplicacao: 'No contexto profissional, pessoas com dominância SD são essenciais para impulsionar a inovação, desenvolver estratégias criativas e imaginar novas possibilidades. Elas se beneficiam de parcerias com perfis mais analíticos (SE) e organizacionais (IE) para transformar suas ideias visionárias em soluções práticas e implementáveis.'
        },
        IE: {
          nome: 'Inferior Esquerdo - Pensadores Práticos',
          titulo: 'Pensadores PRÁTICOS',
          cor: '#4CAF50',
          descricao: 'Indivíduos que preferem o pensamento prático concentram-se em detalhes, planejamento e organização.',
          comunicacao: 'Para se comunicar eficazmente com eles, considere as seguintes estratégias:',
          estrategias: [
            'Destaque os benefícios práticos de suas ideias, como aumento de eficiência ou produtividade',
            'Forneça diretrizes e expectativas claras para tarefas ou projetos',
            'Use exemplos concretos e específicos para ilustrar seus pontos',
            'Evite discussões abstratas ou teóricas',
            'Forneça muitos detalhes e esteja preparado para responder a perguntas específicas',
            'Forneça prazos e cronogramas claros'
          ],
          caracteristicas: [
            'Pensamento sequencial e organizado',
            'Atenção meticulosa aos detalhes',
            'Preferência por processos e procedimentos',
            'Capacidade de planejamento e administração',
            'Foco em segurança e previsibilidade',
            'Orientação para controle e disciplina'
          ],
          perfil: 'Indivíduos com forte presença do quadrante IE são frequentemente descritos como confiáveis, organizados e metódicos. Eles se destacam em garantir que projetos sejam executados conforme planejado, que prazos sejam cumpridos e que procedimentos sejam seguidos. Tendem a ser cautelosos com mudanças abruptas, preferindo abordagens testadas e comprovadas.',
          profissoes: 'Gerentes de projetos, administradores, auditores, controladores financeiros, especialistas em processos, assistentes administrativos, profissionais de logística, gerentes de qualidade, operadores de sistemas críticos.',
          aplicacao: 'No ambiente de trabalho, pessoas com dominância IE são fundamentais para manter a ordem, garantir a consistência operacional e assegurar que os detalhes não sejam negligenciados. Elas devem ser encorajadas a equilibrar sua necessidade de estrutura com a flexibilidade necessária para inovação e adaptação a mudanças.'
        },
        ID: {
          nome: 'Inferior Direito - Pensadores Relacionais',
          titulo: 'Pensadores RELACIONAIS',
          cor: '#F44336',
          descricao: 'Os indivíduos com preferência pelo pensamento relacional valorizam conexões emocionais e relacionamentos interpessoais.',
          comunicacao: 'Para se comunicar eficazmente com eles, considere as seguintes estratégias:',
          estrategias: [
            'Reserve um tempo para estabelecer uma conexão pessoal',
            'Use uma linguagem emocional e apele à empatia deles',
            'Esteja preparado para fornecer apoio emocional e validação',
            'Use histórias e anedotas para ilustrar seus pontos',
            'Esteja atento aos sinais não verbais e à linguagem corporal',
            'Ouça ativamente e construa conexões interpessoais'
          ],
          caracteristicas: [
            'Pensamento empático e sensível',
            'Foco em relacionamentos interpessoais',
            'Comunicação expressiva e emocional',
            'Capacidade de leitura emocional',
            'Preferência por trabalho colaborativo',
            'Orientação para valores humanos e bem-estar'
          ],
          perfil: 'Indivíduos com forte presença do quadrante ID são frequentemente descritos como calorosos, compreensivos e intuitivos em relação às emoções dos outros. Eles se destacam em ambientes que valorizam o trabalho em equipe, a comunicação aberta e o cuidado com o bem-estar das pessoas. Tendem a priorizar a harmonia interpessoal e podem ser sensíveis a conflitos ou ambientes frios e impessoais.',
          profissoes: 'Psicólogos, assistentes sociais, professores, profissionais de recursos humanos, coaches, terapeutas, enfermeiros, conselheiros, profissionais de atendimento ao cliente, mediadores de conflitos.',
          aplicacao: 'No contexto profissional, pessoas com dominância ID são essenciais para construir equipes coesas, facilitar a comunicação e garantir que as necessidades emocionais e sociais sejam atendidas. Elas se beneficiam de ambientes que valorizam a colaboração e devem ser apoiadas a desenvolver habilidades complementares em análise lógica e organização estrutural.'
        }
      };

      return descricoes[quadrante] || null;
    };

    // Função para desenhar o gráfico cerebro
    const desenharGraficoCerebro = () => {
      const { pontuacao_se, pontuacao_sd, pontuacao_ie, pontuacao_id } = resultado;
      const isMobile = window.innerWidth < 768;

      return (
        <div style={{ maxWidth: isMobile ? '100%' : 900, margin: '0 auto', position: 'relative' }}>
          {/* Layout tipo grade 2x2 com cérebro no centro */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: 0,
            minHeight: isMobile ? '400px' : '560px',
            height: isMobile ? 'auto' : '560px',
            position: 'relative'
          }}>
            {/* Quadrante SE - Superior Esquerdo (Azul Ciano) */}
            <div 
              onClick={() => abrirModal('SE')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0097A7';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#00BCD4';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{
              backgroundColor: '#00BCD4',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: isMobile ? '20px 15px' : '40px 30px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: isMobile ? 16 : 24, fontWeight: 'bold', marginBottom: isMobile ? 8 : 16 }}>
                Superior Esquerdo
              </div>
              <div style={{ fontSize: isMobile ? 48 : 80, fontWeight: 'bold', marginBottom: isMobile ? 8 : 16, lineHeight: 1 }}>
                {pontuacao_se}
              </div>
              <div style={{ fontSize: isMobile ? 11 : 14, lineHeight: 1.8, fontWeight: 500 }}>
                Prático<br/>
                Analítico<br/>
                Baseado em fatos<br/>
                Concreto<br/>
                Crítico
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12, marginTop: isMobile ? 8 : 16, opacity: 0.9 }}>
                Clique para saber mais
              </div>
            </div>

            {/* Quadrante SD - Superior Direito (Amarelo) */}
            <div 
              onClick={() => abrirModal('SD')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFA000';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFC107';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{
              backgroundColor: '#FFC107',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: isMobile ? '20px 15px' : '40px 30px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: isMobile ? 16 : 24, fontWeight: 'bold', marginBottom: isMobile ? 8 : 16 }}>
                Superior Direito
              </div>
              <div style={{ fontSize: isMobile ? 48 : 80, fontWeight: 'bold', marginBottom: isMobile ? 8 : 16, lineHeight: 1 }}>
                {pontuacao_sd}
              </div>
              <div style={{ fontSize: isMobile ? 11 : 14, lineHeight: 1.8, fontWeight: 500 }}>
                Holístico<br/>
                Intuitivo<br/>
                Integrador<br/>
                Sintetizador<br/>
                Criativo
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12, marginTop: isMobile ? 8 : 16, opacity: 0.9 }}>
                Clique para saber mais
              </div>
            </div>

            {/* Quadrante IE - Inferior Esquerdo (Verde) */}
            <div 
              onClick={() => abrirModal('IE')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#388E3C';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4CAF50';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{
              backgroundColor: '#4CAF50',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: isMobile ? '20px 15px' : '40px 30px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: isMobile ? 16 : 24, fontWeight: 'bold', marginBottom: isMobile ? 8 : 16 }}>
                Inferior Esquerdo
              </div>
              <div style={{ fontSize: isMobile ? 48 : 80, fontWeight: 'bold', marginBottom: isMobile ? 8 : 16, lineHeight: 1 }}>
                {pontuacao_ie}
              </div>
              <div style={{ fontSize: isMobile ? 11 : 14, lineHeight: 1.8, fontWeight: 500 }}>
                Administrador<br/>
                Sequencial<br/>
                Detalhista<br/>
                Cuidadoso<br/>
                Organizador
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12, marginTop: isMobile ? 8 : 16, opacity: 0.9 }}>
                Clique para saber mais
              </div>
            </div>

            {/* Quadrante ID - Inferior Direito (Vermelho) */}
            <div 
              onClick={() => abrirModal('ID')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D32F2F';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F44336';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{
              backgroundColor: '#F44336',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: isMobile ? '20px 15px' : '40px 30px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: isMobile ? 16 : 24, fontWeight: 'bold', marginBottom: isMobile ? 8 : 16 }}>
                Inferior Direito
              </div>
              <div style={{ fontSize: isMobile ? 48 : 80, fontWeight: 'bold', marginBottom: isMobile ? 8 : 16, lineHeight: 1 }}>
                {pontuacao_id}
              </div>
              <div style={{ fontSize: isMobile ? 11 : 14, lineHeight: 1.8, fontWeight: 500 }}>
                Interpessoal<br/>
                Cinestésico<br/>
                Emocional<br/>
                Expressivo<br/>
                Sensível
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12, marginTop: isMobile ? 8 : 16, opacity: 0.9 }}>
                Clique para saber mais
              </div>
            </div>
          </div>

          {/* Cérebro Central Sobreposto */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <svg viewBox="0 0 800 500" style={{ width: isMobile ? '250px' : '480px', height: 'auto', display: 'block' }}>
              {/* Contorno do cérebro */}
              <ellipse cx="400" cy="250" rx="280" ry="200" fill="none" stroke="#333" strokeWidth="3" />
              
              {/* Linha divisória vertical (hemisfério esquerdo/direito) */}
              <line x1="400" y1="50" x2="400" y2="450" stroke="#333" strokeWidth="3" />
              
              {/* Linha divisória horizontal (cerebral/límbico) */}
              <line x1="120" y1="250" x2="680" y2="250" stroke="#333" strokeWidth="3" />
              
              {/* Quadrante SE - Esquerdo Cortical (Azul) - Superior Esquerdo */}
              <path
                d="M 400 250 L 400 50 A 280 200 0 0 0 120 250 Z"
                fill="#1890ff"
                opacity="0.8"
                stroke="#333"
                strokeWidth="2"
              />
              
              {/* Quadrante SD - Direito Cortical (Amarelo) - Superior Direito */}
              <path
                d="M 400 250 L 680 250 A 280 200 0 0 0 400 50 Z"
                fill="#fadb14"
                opacity="0.8"
                stroke="#333"
                strokeWidth="2"
              />
              
              {/* Quadrante IE - Esquerdo Límbico (Verde) - Inferior Esquerdo */}
              <path
                d="M 400 250 L 120 250 A 280 200 0 0 0 400 450 Z"
                fill="#52c41a"
                opacity="0.8"
                stroke="#333"
                strokeWidth="2"
              />
              
              {/* Quadrante ID - Direito Límbico (Vermelho) - Inferior Direito */}
              <path
                d="M 400 250 L 400 450 A 280 200 0 0 0 680 250 Z"
                fill="#ff4d4f"
                opacity="0.8"
                stroke="#333"
                strokeWidth="2"
              />
              
              {/* Textos das Características Principais dentro dos quadrantes */}
              {/* SE - Analítica */}
              <text 
                x="260" 
                y="160" 
                textAnchor="middle" 
                fontSize="28" 
                fontWeight="bold" 
                fill="white"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
              >
                Analítica
              </text>
              
              {/* SD - Experimental */}
              <text 
                x="540" 
                y="160" 
                textAnchor="middle" 
                fontSize="28" 
                fontWeight="bold" 
                fill="white"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
              >
                Experimental
              </text>
              
              {/* IE - Controlador */}
              <text 
                x="260" 
                y="350" 
                textAnchor="middle" 
                fontSize="28" 
                fontWeight="bold" 
                fill="white"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
              >
                Controlador
              </text>
              
              {/* ID - Relacional */}
              <text 
                x="540" 
                y="350" 
                textAnchor="middle" 
                fontSize="28" 
                fontWeight="bold" 
                fill="white"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
              >
                Relacional
              </text>
            </svg>
          </div>
        </div>
      );
    };

    return (
      <Card style={{ 
        maxWidth: 900, 
        margin: '0 auto', 
        minHeight: '500px',
        padding: window.innerWidth < 768 ? '16px' : '24px'
      }}>
        <div style={{ textAlign: 'center', padding: window.innerWidth < 768 ? '20px 10px' : '40px 20px' }}>
          <CheckCircleOutlined style={{ fontSize: '80px', color: '#52c41a', marginBottom: 24 }} />
          <Title level={2} style={{ marginBottom: 24, color: '#1890ff' }}>
            Resultado do Teste de Dominância Cerebral
          </Title>

          {/* Gráfico Cérebro */}
          <div style={{ marginTop: 32, marginBottom: 32 }}>
            <Title level={4}>Gráfico de Dominância - Autopercepção</Title>
            {desenharGraficoCerebro()}
          </div>

          {/* Acordeões dos Perfis */}
          <div style={{ marginTop: 40, textAlign: 'left' }}>
            <Title level={4} style={{ marginBottom: 24 }}>Seus Perfis de Dominância:</Title>
            
            {quadrantes.map(quadrante => {
              const pontuacao = resultado[`pontuacao_${quadrante.key.toLowerCase()}`];
              const descricao = obterDescricaoQuadrante(quadrante.key);
              const isDominante = pontuacao === maxPontuacao;

              return (
                <Card
                  key={quadrante.key}
                  style={{
                    marginBottom: 16,
                    border: isDominante ? `3px solid ${quadrante.cor}` : `1px solid #d9d9d9`,
                    backgroundColor: isDominante ? `${quadrante.cor}10` : 'white',
                    boxShadow: isDominante ? `0 4px 12px ${quadrante.cor}40` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: quadrante.cor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 16
                      }}>
                        {quadrante.key}
                      </div>
                      <div>
                        <Text strong style={{ fontSize: 16, color: quadrante.cor }}>
                          {descricao.nome}
                        </Text>
                        {isDominante && (
                          <div>
                            <Tag color="gold" style={{ marginTop: 4 }}>⭐ Perfil Dominante</Tag>
                          </div>
                        )}
                      </div>
                    </div>
                    <Text strong style={{ fontSize: 24, color: quadrante.cor }}>
                      {pontuacao}
                    </Text>
                  </div>

                  <div style={{ 
                    marginTop: 16,
                    padding: 20,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    border: `1px solid ${quadrante.cor}30`
                  }}>
                    <Text strong style={{ 
                      color: quadrante.cor, 
                      display: 'block', 
                      marginBottom: 12, 
                      fontSize: 17,
                      textTransform: 'uppercase'
                    }}>
                      {descricao.titulo}
                    </Text>
                    
                    <Text style={{ 
                      display: 'block', 
                      marginBottom: 16, 
                      fontSize: 14, 
                      lineHeight: 1.6,
                      color: '#595959'
                    }}>
                      {descricao.descricao}
                    </Text>

                    <Text strong style={{ 
                      color: quadrante.cor, 
                      display: 'block', 
                      marginTop: 20,
                      marginBottom: 12, 
                      fontSize: 15
                    }}>
                      {descricao.comunicacao}
                    </Text>
                    
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {descricao.estrategias.map((estrategia, idx) => (
                        <li key={idx} style={{ marginBottom: 10 }}>
                          <Text style={{ fontSize: 14, lineHeight: 1.5 }}>{estrategia}</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button 
            type="primary" 
            size="large" 
            onClick={() => window.location.href = '/testes'}
            style={{ marginTop: 32 }}
          >
            Voltar aos Testes
          </Button>
        </div>

        {/* Modal com informações detalhadas do quadrante */}
        <Modal
          open={modalAberto}
          onCancel={fecharModal}
          footer={null}
          width={700}
          centered
        >
          {quadranteSelecionado && (() => {
            const info = obterDescricaoQuadrante(quadranteSelecionado);
            return (
              <div>
                <Title level={3} style={{ color: info.cor, marginBottom: 16 }}>
                  {info.titulo}
                </Title>
                
                <Text style={{ display: 'block', marginBottom: 24, fontSize: 15, lineHeight: 1.6 }}>
                  {info.descricao}
                </Text>

                <div style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: 16, 
                  borderRadius: 8,
                  borderLeft: `4px solid ${info.cor}`,
                  marginBottom: 24 
                }}>
                  <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 16 }}>
                    Características Principais:
                  </Text>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {info.caracteristicas.map((carac, idx) => (
                      <li key={idx} style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: 14 }}>{carac}</Text>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 16, color: info.cor }}>
                    Perfil Comportamental:
                  </Text>
                  <Text style={{ display: 'block', fontSize: 14, lineHeight: 1.6 }}>
                    {info.perfil}
                  </Text>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 16, color: info.cor }}>
                    Profissões Típicas:
                  </Text>
                  <Text style={{ display: 'block', fontSize: 14, lineHeight: 1.6 }}>
                    {info.profissoes}
                  </Text>
                </div>

                <div>
                  <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 16, color: info.cor }}>
                    Aplicação Prática:
                  </Text>
                  <Text style={{ display: 'block', fontSize: 14, lineHeight: 1.6 }}>
                    {info.aplicacao}
                  </Text>
                </div>
              </div>
            );
          })()}
        </Modal>
      </Card>
    );
  }

  if (!testeIniciado) {
    return (
      <Card style={{ maxWidth: 700, margin: '0 auto', minHeight: '500px' }}>
        <div style={{ textAlign: 'center', padding: '60px 40px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 24 }}>
            Teste de Dominância Cerebral
          </Title>
          
          <Text style={{ fontSize: 16, color: '#595959', display: 'block', marginBottom: 32, lineHeight: 1.8 }}>
            Este teste avalia sua dominância cerebral baseada no modelo de Ned Herrmann. 
            O cérebro é dividido em 4 quadrantes, cada um com características distintas.
          </Text>

          <div style={{ textAlign: 'left', marginBottom: 40, background: '#f0f8ff', padding: 24, borderRadius: 8 }}>
            <Title level={4} style={{ marginBottom: 16 }}>Como funciona:</Title>
            <ul style={{ fontSize: 15, lineHeight: 2 }}>
              <li>O teste possui <strong>8 questões</strong></li>
              <li>Cada questão tem <strong>16 opções</strong></li>
              <li>Você deve selecionar <strong>exatamente 4 opções</strong> por questão</li>
              <li>Escolha as opções que mais se identificam com você</li>
              <li>Não há respostas certas ou erradas</li>
              <li>Duração aproximada: <strong>10-15 minutos</strong></li>
            </ul>
          </div>

          {jaFezTeste && (
            <Alert
              message="Você já realizou este teste"
              description="Você pode visualizar seu resultado anterior ou aguardar liberação para refazer"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Button 
            type="primary" 
            size="large" 
            onClick={iniciarTeste}
            loading={loading}
            disabled={jaFezTeste}
            style={{ 
              height: 50,
              fontSize: 16,
              padding: '0 48px'
            }}
          >
            Iniciar Teste
          </Button>
        </div>
      </Card>
    );
  }

  if (questoes.length === 0) {
    return <div>Carregando questões...</div>;
  }

  const questao = questoes[questaoAtual];
  const opcoesSelecionadas = obterRespostasSelecionadas();
  const progresso = ((questaoAtual + 1) / questoes.length) * 100;

  return (
    <Card style={{ 
      maxWidth: window.innerWidth < 768 ? '100%' : 900, 
      margin: '0 auto',
      padding: window.innerWidth < 768 ? '16px' : '24px'
    }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text strong style={{ fontSize: window.innerWidth < 768 ? 14 : 16 }}>
            Questão {questaoAtual + 1} de {questoes.length}
          </Text>
          <Text strong style={{ fontSize: window.innerWidth < 768 ? 14 : 16 }}>
            {opcoesSelecionadas.length}/4 selecionadas
          </Text>
        </div>
        <Progress 
          percent={progresso} 
          showInfo={false}
          strokeColor="#1890ff"
        />
      </div>

      <Title level={3} style={{ 
        marginBottom: 16, 
        color: '#1890ff',
        fontSize: window.innerWidth < 768 ? 18 : 24
      }}>
        {questao.titulo}
      </Title>

      <Text style={{ 
        display: 'block', 
        marginBottom: 24, 
        fontSize: window.innerWidth < 768 ? 14 : 16,
        color: '#8c8c8c'
      }}>
        {questao.instrucao}
      </Text>

      <div style={{ marginBottom: 24 }}>
        {(() => {
          // Verificar se a questão tem grupos
          const temGrupos = questao.opcoes.some(o => o.grupo !== null);
          
          if (temGrupos) {
            // Renderizar questão com grupos (questões 6 e 7)
            const grupos = {};
            questao.opcoes.forEach(opcao => {
              if (!grupos[opcao.grupo]) {
                grupos[opcao.grupo] = [];
              }
              grupos[opcao.grupo].push(opcao);
            });

            const gruposOrdenados = Object.keys(grupos).sort((a, b) => Number(a) - Number(b));
            const titulosGrupos = {
              1: questao.numero === 6 ? 'Eu trabalho melhor quando:' : 'Quando pedem minha aprovação:',
              2: questao.numero === 6 ? 'Falta-me ânimo quando:' : 'Quando as pessoas resistem às minhas ideias:',
              3: questao.numero === 6 ? 'Eu me entusiasmo quando:' : 'Quando não entendo o que alguém diz:',
              4: questao.numero === 6 ? 'Eu me aborreço quando:' : 'Quando não entendem o que digo:'
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {gruposOrdenados.map(grupoNum => {
                  const opcoesGrupo = grupos[grupoNum];
                  const opcaoSelecionadaGrupo = opcoesGrupo.find(o => opcoesSelecionadas.includes(o.id));
                  
                  return (
                    <Card 
                      key={grupoNum}
                      style={{
                        border: window.innerWidth < 768 ? 'none' : '1px solid #d9d9d9',
                        boxShadow: window.innerWidth < 768 ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        borderRadius: window.innerWidth < 768 ? '8px' : '2px'
                      }}
                    >
                      <Title level={5} style={{ 
                        marginBottom: 16, 
                        color: '#1890ff',
                        fontSize: window.innerWidth < 768 ? 14 : 16
                      }}>
                        {titulosGrupos[grupoNum]}
                      </Title>
                      <Radio.Group 
                        value={opcaoSelecionadaGrupo?.id}
                        style={{ width: '100%' }}
                      >
                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                          gap: window.innerWidth < 768 ? '12px' : '16px'
                        }}>
                          {opcoesGrupo.map((opcao) => (
                            <Card
                              key={opcao.id}
                              hoverable={window.innerWidth >= 768}
                              bordered={window.innerWidth >= 768}
                              style={{
                                border: opcoesSelecionadas.includes(opcao.id) 
                                  ? '2px solid #1890ff !important' 
                                  : window.innerWidth < 768 
                                    ? 'none !important' 
                                    : '1px solid #d9d9d9',
                                backgroundColor: opcoesSelecionadas.includes(opcao.id) ? '#f0f8ff' : 'white',
                                cursor: 'pointer',
                                minHeight: window.innerWidth < 768 ? '50px' : '60px',
                                transition: 'all 0.3s ease',
                                boxShadow: window.innerWidth < 768 ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                                borderRadius: window.innerWidth < 768 ? '8px' : '2px'
                              }}
                              onClick={() => selecionarOpcao(questao.id, opcao.id, opcao.grupo)}
                              bodyStyle={{ 
                                padding: window.innerWidth < 768 ? '12px 16px' : '16px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <Radio 
                                value={opcao.id}
                                checked={opcoesSelecionadas.includes(opcao.id)}
                                style={{ marginRight: 12 }}
                              />
                              <Text style={{ 
                                fontSize: window.innerWidth < 768 ? 14 : 15,
                                fontWeight: opcoesSelecionadas.includes(opcao.id) ? 'bold' : 'normal',
                                color: opcoesSelecionadas.includes(opcao.id) ? '#1890ff' : 'inherit'
                              }}>
                                {opcao.texto}
                              </Text>
                            </Card>
                          ))}
                        </div>
                      </Radio.Group>
                    </Card>
                  );
                })}
              </div>
            );
          } else {
            // Renderizar questão normal (checkbox múltiplo)
            return (
              <Checkbox.Group 
                value={opcoesSelecionadas}
                style={{ width: '100%' }}
              >
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                  gap: window.innerWidth < 768 ? '12px' : '16px'
                }}>
                  {questao.opcoes.map((opcao) => (
                    <Card
                      key={opcao.id}
                      hoverable={window.innerWidth >= 768}
                      bordered={window.innerWidth >= 768}
                      style={{
                        border: opcoesSelecionadas.includes(opcao.id) 
                          ? '2px solid #1890ff !important' 
                          : window.innerWidth < 768 
                            ? 'none !important' 
                            : '1px solid #d9d9d9',
                        backgroundColor: opcoesSelecionadas.includes(opcao.id) ? '#f0f8ff' : 'white',
                        cursor: 'pointer',
                        minHeight: window.innerWidth < 768 ? '50px' : '60px',
                        transition: 'all 0.3s ease',
                        boxShadow: window.innerWidth < 768 ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        borderRadius: window.innerWidth < 768 ? '8px' : '2px'
                      }}
                      onClick={() => selecionarOpcao(questao.id, opcao.id)}
                      bodyStyle={{ 
                        padding: window.innerWidth < 768 ? '12px 16px' : '16px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Checkbox 
                        value={opcao.id}
                        checked={opcoesSelecionadas.includes(opcao.id)}
                        style={{ marginRight: 12 }}
                      />
                      <Text style={{ 
                        fontSize: window.innerWidth < 768 ? 14 : 15,
                        fontWeight: opcoesSelecionadas.includes(opcao.id) ? 'bold' : 'normal',
                        color: opcoesSelecionadas.includes(opcao.id) ? '#1890ff' : 'inherit'
                      }}>
                        {opcao.texto}
                      </Text>
                    </Card>
                  ))}
                </div>
              </Checkbox.Group>
            );
          }
        })()}
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
              color: opcoesSelecionadas.length !== 4 ? '#ff7875' : '#52c41a',
              fontWeight: 'medium',
              fontSize: '13px',
              textAlign: 'center',
              width: '100%'
            }}>
              {opcoesSelecionadas.length !== 4 ? 'Selecione exatamente 4 opções para continuar' : '✓ Pronto para avançar'}
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
                onClick={questaoAnterior}
                disabled={questaoAtual === 0}
                size="large"
                style={{ flex: 1, height: '48px', maxWidth: '180px' }}
              >
                Anterior
              </Button>
              <Button
                type="primary"
                size="large"
                icon={questaoAtual === questoes.length - 1 ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
                onClick={proximaQuestao}
                disabled={opcoesSelecionadas.length !== 4}
                loading={loading}
                style={{ flex: 1, height: '48px', maxWidth: '180px' }}
              >
                {questaoAtual === questoes.length - 1 ? 'Finalizar' : 'Próxima'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={questaoAnterior}
              disabled={questaoAtual === 0}
              size="large"
            >
              Anterior
            </Button>
            
            <Text style={{ 
              color: opcoesSelecionadas.length !== 4 ? '#ff7875' : '#52c41a',
              fontWeight: 'medium',
              fontSize: '14px'
            }}>
              {opcoesSelecionadas.length !== 4 ? 'Selecione exatamente 4 opções' : '✓ Pronto para avançar'}
            </Text>
            
            <Button
              type="primary"
              size="large"
              icon={questaoAtual === questoes.length - 1 ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
              onClick={proximaQuestao}
              disabled={opcoesSelecionadas.length !== 4}
              loading={loading}
            >
              {questaoAtual === questoes.length - 1 ? 'Finalizar Teste' : 'Próxima'}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default TesteDominancia;
