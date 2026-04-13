'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Table, Tag, Spin, Button, Typography, Modal } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import AdminLayout from '@/components/AdminLayout';
import apiService from '@/services/api';

const { Title, Text } = Typography;

interface Opcao {
  id: number;
  numero: number;
  texto: string;
  quadrante: string;
  grupo: number | null;
}

interface Questao {
  id: number;
  numero: number;
  titulo: string;
  opcoes: Opcao[];
}

interface Resposta {
  id: number;
  questao_id: number;
  opcao_id: number;
  opcao: {
    numero: number;
    texto: string;
    quadrante: string;
    grupo: number | null;
    questao: {
      numero: number;
    };
  };
}

interface Resultado {
  id: number;
  pontuacao_se: number;
  pontuacao_sd: number;
  pontuacao_ie: number;
  pontuacao_id: number;
  percentual_se: number;
  percentual_sd: number;
  percentual_ie: number;
  percentual_id: number;
  usuario: {
    nome: string;
    email: string;
  };
}

export default function RelatorioDetalhado() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [quadranteSelecionado, setQuadranteSelecionado] = useState<'SE' | 'SD' | 'IE' | 'ID' | null>(null);

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    console.log('Estados atualizados:', {
      resultado: resultado?.id,
      questoes: questoes.length,
      respostas: respostas.length
    });
  }, [resultado, questoes, respostas]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar resultado específico
      const resultados = await apiService.getResultadosDominancia();
      const resultadoEspecifico = resultados.find((r: Resultado) => r.id === parseInt(params.id as string));
      
      if (resultadoEspecifico) {
        console.log('Resultado encontrado:', resultadoEspecifico);
        setResultado(resultadoEspecifico);
        
        // Buscar questões
        const token = localStorage.getItem('adminToken');
        console.log('Token admin:', token ? 'existe' : 'não existe');
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
        console.log('API_URL:', API_URL);
        
        const response = await fetch(`${API_URL}/api/testes-dominancia/questoes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.error('Erro ao buscar questões:', response.status);
          return;
        }
        
        const questoesData = await response.json();
        console.log('Questões carregadas:', questoesData.length, questoesData);
        setQuestoes(questoesData);
        
        // Buscar respostas - precisa usar uma rota diferente no admin
        const responseRespostas = await fetch(
          `${API_URL}/api/testes-dominancia/respostas/${resultadoEspecifico.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!responseRespostas.ok) {
          console.error('Erro ao buscar respostas:', responseRespostas.status);
          return;
        }
        
        const respostasData = await responseRespostas.json();
        console.log('Respostas carregadas:', respostasData.length, respostasData);
        setRespostas(respostasData);
        
        console.log('Estados atualizados - aguardando render');
      } else {
        console.error('Resultado não encontrado para ID:', params.id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularPontuacoesPorQuestao = () => {
    console.log('Calculando pontuações - Questões:', questoes.length, 'Respostas:', respostas.length);
    
    if (!questoes.length || !respostas.length) {
      console.log('Retornando vazio - sem dados');
      return [];
    }

    const pontuacoes: Array<{ key: number; questao: number; SE: number; SD: number; IE: number; ID: number }> = [];
    
    questoes.forEach(questao => {
      const respostasQuestao = respostas.filter(r => r.questao_id === questao.id);
      console.log(`Questão ${questao.numero}: ${respostasQuestao.length} respostas`);
      
      const contagem = { SE: 0, SD: 0, IE: 0, ID: 0 };
      
      respostasQuestao.forEach(resposta => {
        const opcao = questao.opcoes.find(o => o.id === resposta.opcao_id);
        if (opcao) {
          contagem[opcao.quadrante as keyof typeof contagem]++;
        }
      });
      
      pontuacoes.push({
        key: questao.numero,
        questao: questao.numero,
        SE: contagem.SE,
        SD: contagem.SD,
        IE: contagem.IE,
        ID: contagem.ID
      });
    });

    return pontuacoes;
  };

  const gerarQuadroRespostas = () => {
    if (!questoes.length || !respostas.length) return [];

    const quadro: Array<{ key: string; questao: string; quadrante: string; selecionada: number; grupo: number | null }> = [];
    
    questoes.forEach((questao, qIndex) => {
      const respostasQuestao = respostas.filter(r => r.questao_id === questao.id);
      
      questao.opcoes.forEach((opcao, oIndex) => {
        const foiSelecionada = respostasQuestao.some(r => r.opcao_id === opcao.id);
        
        quadro.push({
          key: `${qIndex}-${oIndex}`,
          questao: `${questao.numero}.${opcao.numero}`,
          quadrante: opcao.quadrante,
          selecionada: foiSelecionada ? 1 : 0,
          grupo: opcao.grupo
        });
      });
    });

    return quadro;
  };

  const abrirModal = (quadrante: 'SE' | 'SD' | 'IE' | 'ID') => {
    setQuadranteSelecionado(quadrante);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setQuadranteSelecionado(null);
  };

  const obterDescricaoQuadrante = (quadrante: 'SE' | 'SD' | 'IE' | 'ID') => {
    const descricoes = {
      SE: {
        titulo: 'SE - Superior Esquerdo (Analítica)',
        cor: '#00BCD4',
        descricao: 'O Quadrante SE é caracterizado por sua especialização em processos de pensamento lógico, analítico, quantitativo e baseado em fatos. Indivíduos com preferência pelo pensamento analítico se destacam em tarefas de resolução de problemas e tomada de decisões. São chamados de especialistas, por conta do perfil lógico e mais técnico.',
        caracteristicas: [
          '🎯 Pensamento lógico e racional',
          '📊 Resolução de problemas complexos',
          '🔬 Análise baseada em fatos e dados',
          '📈 Quantitativo e matemático',
          '⚙️ Técnico e estratégico',
          '🧠 Competitivo e inteligente'
        ],
        perfil: 'Pessoas analíticas costumam ser mais competitivas e individualistas, além de inteligentes, irônicas e com um grande senso de humor. Ao aproveitar seus pontos fortes no pensamento lógico e analítico, conseguem resolver problemas complexos e tomar decisões acertadas com facilidade.',
        profissoes: 'Matemáticos, Físicos, Engenheiros, Químicos, Pesquisadores, Analistas de Dados',
        aplicacao: 'Profissionais que analisam dados complexos ou pesquisadores que buscam rigorosamente soluções baseadas em evidências prosperam no Quadrante SE.'
      },
      SD: {
        titulo: 'SD - Superior Direito (Experimental)',
        cor: '#FFC107',
        descricao: 'O Quadrante SD é onde sintetizar e integrar informações assume uma abordagem holística e intuitiva. Este estilo de pensamento é conhecido por sua capacidade de gerar ideias únicas e soluções criativas para problemas. São visuais, espontâneos e altamente criativos.',
        caracteristicas: [
          '🎨 Criativo e inovador',
          '🌟 Holístico e integrador',
          '💡 Intuitivo e visionário',
          '🔮 Síntese e conexões únicas',
          '🚀 Experimental e ousado',
          '✨ Quebra de paradigmas'
        ],
        perfil: 'Indivíduos com preferência pelo pensamento experimental prosperam estabelecendo conexões entre conceitos aparentemente não relacionados para criar soluções inovadoras. Gostam de experimentar e inovar, ainda que isso tenha algum risco associado. Sempre olham para o amanhã, mas tentam aprender com o presente para poder chegar mais longe dia após dia.',
        profissoes: 'Arquitetos, Escritores, Músicos, Pintores, Desenhistas, Consultores de Inovação',
        aplicacao: 'Sua criatividade e abordagens pouco convencionais para a resolução de problemas ajudam a quebrar barreiras e abrir espaço para o progresso. São mestres da síntese e da inovação.'
      },
      IE: {
        titulo: 'IE - Inferior Esquerdo (Controlador)',
        cor: '#4CAF50',
        descricao: 'O Quadrante IE é onde a atenção aos detalhes, o planejamento, a organização e o sequenciamento das informações estão em primeiro plano. Este estilo de pensamento permite contribuir com abordagens estruturadas e organizadas para diferentes aspectos da vida.',
        caracteristicas: [
          '📋 Planejamento meticuloso',
          '⏰ Organização e estrutura',
          '✅ Atenção aos detalhes',
          '📊 Sequenciamento de informações',
          '🗂️ Previsível e conservador',
          '⚖️ Controle e ordem'
        ],
        perfil: 'Pessoas deste perfil não realizam nenhuma ação sem ter planejado antes, gostam de tudo aquilo que seja previsível, conservador, e que fique sob o seu controle. Ao planejar e organizar informações meticulosamente, os indivíduos conseguem trazer estrutura e clareza a situações complexas.',
        profissoes: 'Diretores de Empresas, Gerentes, Contadores, Auditores, Administradores',
        aplicacao: 'Seja planejando o cronograma e os aspectos práticos de uma tarefa de trabalho complexa ou criando uma rotina diária, o estilo de pensamento prático do Quadrante IE ajuda os indivíduos a dividirem as tarefas em componentes gerenciáveis.'
      },
      ID: {
        titulo: 'ID - Inferior Direito (Relacional)',
        cor: '#F44336',
        descricao: 'O Quadrante ID é onde os sentimentos e os relacionamentos interpessoais ganham destaque. Este estilo de pensamento prioriza emoções e elementos cinestésicos, tornando-se uma opção natural para pessoas com preferência pelo pensamento relacional.',
        caracteristicas: [
          '❤️ Inteligência emocional',
          '🤝 Relacionamentos harmoniosos',
          '😊 Comunicação empática',
          '🎵 Consciência cinestésica',
          '👥 Mediação e aconselhamento',
          '💬 Conexões significativas'
        ],
        perfil: 'Pessoas deste perfil sabem se comunicar e tendem a lidar com empatia nos relacionamentos ou em atendimentos aos clientes no âmbito profissional, mesmo diante de uma reclamação. Geralmente, são bons mediadores e procurados como conselheiros, e na maioria dos casos se destacam pela facilidade de criar conexões significativas com outras pessoas.',
        profissoes: 'Jornalistas, Enfermeiros, Assistentes Sociais, Advogados, Psicólogos, Professores',
        aplicacao: 'Ao aproveitar seus pontos fortes em inteligência emocional e consciência cinestésica, indivíduos com preferência por esse estilo de pensamento conseguem navegar por dinâmicas sociais complexas com facilidade. São espontâneos e extrovertidos.'
      }
    };
    
    return descricoes[quadrante];
  };

  const desenharGraficoCerebro = () => {
    if (!resultado) return null;

    const { pontuacao_se, pontuacao_sd, pontuacao_ie, pontuacao_id, percentual_se, percentual_sd, percentual_ie, percentual_id } = resultado;

    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
        {/* Layout tipo grade 2x2 com cérebro no centro */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 0,
          minHeight: '600px',
          position: 'relative'
        }}>
          {/* Quadrante SE - Superior Esquerdo (Azul Ciano) */}
          <div 
            onClick={() => abrirModal('SE')}
            style={{
              backgroundColor: '#00BCD4',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 30px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00ACC1';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#00BCD4';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
              Superior Esquerdo
            </div>
            <div style={{ fontSize: 90, fontWeight: 'bold', marginBottom: 8, lineHeight: 1 }}>
              {percentual_se}%
            </div>
            <div style={{ fontSize: 18, marginBottom: 16, opacity: 0.9 }}>
              ({pontuacao_se} pontos)
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, fontWeight: 500 }}>
              Prático<br/>
              Analítico<br/>
              Baseado em fatos<br/>
              Concreto<br/>
              Crítico
            </div>
            <div style={{ 
              marginTop: 16, 
              fontSize: 12, 
              opacity: 0.8,
              fontStyle: 'italic' 
            }}>
              Clique para saber mais
            </div>
          </div>

          {/* Quadrante SD - Superior Direito (Amarelo) */}
          <div 
            onClick={() => abrirModal('SD')}
            style={{
              backgroundColor: '#FFC107',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 30px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFB300';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFC107';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
              Superior Direito
            </div>
            <div style={{ fontSize: 90, fontWeight: 'bold', marginBottom: 8, lineHeight: 1 }}>
              {percentual_sd}%
            </div>
            <div style={{ fontSize: 18, marginBottom: 16, opacity: 0.9 }}>
              ({pontuacao_sd} pontos)
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, fontWeight: 500 }}>
              Holístico<br/>
              Intuitivo<br/>
              Integrador<br/>
              Sintetizador<br/>
              Criativo
            </div>
            <div style={{ 
              marginTop: 16, 
              fontSize: 12, 
              opacity: 0.8,
              fontStyle: 'italic' 
            }}>
              Clique para saber mais
            </div>
          </div>

          {/* Quadrante IE - Inferior Esquerdo (Verde) */}
          <div 
            onClick={() => abrirModal('IE')}
            style={{
              backgroundColor: '#4CAF50',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 30px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#43A047';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4CAF50';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
              Inferior Esquerdo
            </div>
            <div style={{ fontSize: 90, fontWeight: 'bold', marginBottom: 8, lineHeight: 1 }}>
              {percentual_ie}%
            </div>
            <div style={{ fontSize: 18, marginBottom: 16, opacity: 0.9 }}>
              ({pontuacao_ie} pontos)
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, fontWeight: 500 }}>
              Administrador<br/>
              Sequencial<br/>
              Detalhista<br/>
              Cuidadoso<br/>
              Organizador
            </div>
            <div style={{ 
              marginTop: 16, 
              fontSize: 12, 
              opacity: 0.8,
              fontStyle: 'italic' 
            }}>
              Clique para saber mais
            </div>
          </div>

          {/* Quadrante ID - Inferior Direito (Vermelho) */}
          <div 
            onClick={() => abrirModal('ID')}
            style={{
              backgroundColor: '#F44336',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 30px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E53935';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F44336';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
              Inferior Direito
            </div>
            <div style={{ fontSize: 90, fontWeight: 'bold', marginBottom: 8, lineHeight: 1 }}>
              {percentual_id}%
            </div>
            <div style={{ fontSize: 18, marginBottom: 16, opacity: 0.9 }}>
              ({pontuacao_id} pontos)
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, fontWeight: 500 }}>
              Interpessoal<br/>
              Cinestésico<br/>
              Emocional<br/>
              Expressivo<br/>
              Sensível
            </div>
            <div style={{ 
              marginTop: 16, 
              fontSize: 12, 
              opacity: 0.8,
              fontStyle: 'italic' 
            }}>
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
          zIndex: 10
        }}>
          <svg viewBox="0 0 800 500" style={{ width: '400px', height: 'auto', display: 'block' }}>
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
            Analítico
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

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 20 }}>Carregando relatório...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!resultado) {
    return (
      <AdminLayout>
        <Card>
          <Text>Resultado não encontrado</Text>
          <Button onClick={() => router.back()} style={{ marginTop: 16 }}>
            Voltar
          </Button>
        </Card>
      </AdminLayout>
    );
  }

  const colunasPontuacao = [
    {
      title: 'Questão',
      dataIndex: 'questao',
      key: 'questao',
      width: 100,
      align: 'center' as const
    },
    {
      title: 'SE',
      dataIndex: 'SE',
      key: 'SE',
      width: 80,
      align: 'center' as const,
      render: (val: number) => <Tag color="blue">{val}</Tag>
    },
    {
      title: 'SD',
      dataIndex: 'SD',
      key: 'SD',
      width: 80,
      align: 'center' as const,
      render: (val: number) => <Tag color="purple">{val}</Tag>
    },
    {
      title: 'IE',
      dataIndex: 'IE',
      key: 'IE',
      width: 80,
      align: 'center' as const,
      render: (val: number) => <Tag color="green">{val}</Tag>
    },
    {
      title: 'ID',
      dataIndex: 'ID',
      key: 'ID',
      width: 80,
      align: 'center' as const,
      render: (val: number) => <Tag color="orange">{val}</Tag>
    }
  ];

  const colunasQuadro = [
    {
      title: 'Q',
      dataIndex: 'questao',
      key: 'questao',
      width: 80,
      align: 'center' as const
    },
    {
      title: 'Quadrante',
      dataIndex: 'quadrante',
      key: 'quadrante',
      width: 100,
      align: 'center' as const,
      render: (quad: string) => {
        const cores: Record<string, string> = { SE: 'blue', SD: 'purple', IE: 'green', ID: 'orange' };
        return <Tag color={cores[quad]}>{quad}</Tag>;
      }
    },
    {
      title: 'Selecionada',
      dataIndex: 'selecionada',
      key: 'selecionada',
      width: 100,
      align: 'center' as const,
      render: (val: number) => val === 1 ? '✓' : '-'
    }
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Voltar
        </Button>
        <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
          Imprimir
        </Button>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>Relatório de Dominância Cerebral</Title>
        <Text strong>Usuário: </Text>
        <Text>{resultado.usuario.nome} ({resultado.usuario.email})</Text>
      </Card>

      {/* Gráfico do Cérebro */}
      <Card style={{ marginBottom: 24, padding: '24px' }}>
        <Title level={4} style={{ textAlign: 'center', marginBottom: 32 }}>
          Mapa de Dominância Cerebral - Modelo Herrmann
        </Title>
        {desenharGraficoCerebro()}

      </Card>

      {/* Tabela de Pontuações por Questão */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 16 }}>Pontuações por Questão</Title>
        <Table
          dataSource={calcularPontuacoesPorQuestao()}
          columns={colunasPontuacao}
          pagination={false}
          size="small"
          bordered
          summary={(pageData) => {
            const totalSE = pageData.reduce((sum, item) => sum + item.SE, 0);
            const totalSD = pageData.reduce((sum, item) => sum + item.SD, 0);
            const totalIE = pageData.reduce((sum, item) => sum + item.IE, 0);
            const totalID = pageData.reduce((sum, item) => sum + item.ID, 0);

            return (
              <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                <Table.Summary.Cell index={0} align="center">TOTAL</Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="center">
                  <Tag color="blue">{totalSE}</Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="center">
                  <Tag color="purple">{totalSD}</Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="center">
                  <Tag color="green">{totalIE}</Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">
                  <Tag color="orange">{totalID}</Tag>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      {/* Quadro Detalhado de Respostas */}
      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>Quadro Detalhado de Respostas</Title>
        <div style={{ overflowX: 'auto' }}>
          <Table
            dataSource={gerarQuadroRespostas()}
            columns={colunasQuadro}
            pagination={{ pageSize: 20 }}
            size="small"
            bordered
            scroll={{ x: 400 }}
          />
        </div>
      </Card>

      {/* Modal com Descrição do Quadrante */}
      <Modal
        open={modalAberto}
        onCancel={fecharModal}
        footer={[
          <Button key="fechar" type="primary" onClick={fecharModal}>
            Fechar
          </Button>
        ]}
        width={700}
        centered
      >
        {quadranteSelecionado && (() => {
          const info = obterDescricaoQuadrante(quadranteSelecionado);
          return (
            <div>
              <Title level={3} style={{ color: info.cor, marginBottom: 24 }}>
                {info.titulo}
              </Title>
              
              <div style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, lineHeight: 1.8 }}>
                  {info.descricao}
                </Text>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 12 }}>✨ Características Principais:</Title>
                <div style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '16px', 
                  borderRadius: '8px',
                  borderLeft: `4px solid ${info.cor}`
                }}>
                  {info.caracteristicas.map((car, idx) => (
                    <div key={idx} style={{ marginBottom: 8, fontSize: 14 }}>
                      {car}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 12 }}>� Perfil Comportamental:</Title>
                <Text style={{ fontSize: 14, lineHeight: 1.8 }}>
                  {info.perfil}
                </Text>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 12 }}>�💼 Profissões Típicas:</Title>
                <Text style={{ fontSize: 14 }}>
                  {info.profissoes}
                </Text>
              </div>

              <div>
                <Title level={5} style={{ marginBottom: 12 }}>🎯 Aplicação Prática:</Title>
                <Text style={{ fontSize: 14, lineHeight: 1.8 }}>
                  {info.aplicacao}
                </Text>
              </div>
            </div>
          );
        })()}
      </Modal>
    </AdminLayout>
  );
}
