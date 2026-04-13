
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Progress, Spin, message, Button, Divider, Collapse } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const { Title, Text, Paragraph } = Typography;

const inteligenciasInfo = {
  linguistica: {
    nome: 'Linguística',
    descricao: 'Facilidade com palavras, leitura, escrita e comunicação verbal.',
    cor: '#52c41a',
    icon: '📝'
  },
  logica: {
    nome: 'Lógico-Matemática',
    descricao: 'Habilidade com números, raciocínio lógico e resolução de problemas.',
    cor: '#1890ff',
    icon: '🔢'
  },
  espacial: {
    nome: 'Espacial',
    descricao: 'Capacidade de visualizar e manipular objetos no espaço.',
    cor: '#722ed1',
    icon: '🎨'
  },
  musical: {
    nome: 'Musical',
    descricao: 'Sensibilidade para sons, ritmos, melodias e música.',
    cor: '#eb2f96',
    icon: '🎵'
  },
  corporalCinestesica: {
    nome: 'Corporal-Cinestésica',
    descricao: 'Habilidade de usar o corpo para expressar ideias e sentimentos.',
    cor: '#fa8c16',
    icon: '🏃'
  },
  interpessoal: {
    nome: 'Interpessoal',
    descricao: 'Capacidade de compreender e interagir efetivamente com outros.',
    cor: '#13c2c2',
    icon: '👥'
  },
  intrapessoal: {
    nome: 'Intrapessoal',
    descricao: 'Conhecimento de si mesmo e capacidade de autorregulação.',
    cor: '#a0d911',
    icon: '🧘'
  },
  naturalista: {
    nome: 'Naturalista',
    descricao: 'Habilidade para reconhecer e classificar elementos da natureza.',
    cor: '#52c41a',
    icon: '🌿'
  }
};




  // Usar o percentual retornado pela API, se existir, senão calcular como fallback
  // Calcula o percentual com base no máximo real de cada categoria
  const getPercentual = (resultado) => {
    const cat = resultado.categoria || {};
    const maximo = cat._count?.perguntas ? cat._count.perguntas * 5 : 35;
    if (typeof resultado.percentual === 'number') {
      return Math.round(resultado.percentual);
    }
    if (typeof resultado.pontuacao === 'number') {
      return Math.round((resultado.pontuacao / maximo) * 100);
    }
    return 0;
  };

  const getInterpretacao = (percentual) => {
    if (percentual >= 80) return { nivel: 'Muito Alto', descricao: 'Esta é uma das suas inteligências dominantes' };
    if (percentual >= 60) return { nivel: 'Alto', descricao: 'Você tem forte aptidão nesta área' };
    if (percentual >= 40) return { nivel: 'Moderado', descricao: 'Habilidade desenvolvida de forma equilibrada' };
    if (percentual >= 20) return { nivel: 'Baixo', descricao: 'Área com potencial para desenvolvimento' };
    return { nivel: 'Muito Baixo', descricao: 'Considere explorar mais esta inteligência' };
  };


function ResultadosInteligencias() {
  const [loading, setLoading] = useState(true);
  const [resultadosOrdenados, setResultadosOrdenados] = useState([]);
  const [inteligenciaDominante, setInteligenciaDominante] = useState(null);
  const navigate = useNavigate();

  // Função para obter a chave de mapeamento da inteligência
  const getChaveInteligencia = (resultado) => {
    if (resultado.tipoInteligencia) return resultado.tipoInteligencia;
    if (typeof resultado.categoria === 'string') return resultado.categoria;
    if (resultado.categoria && resultado.categoria.nome) return resultado.categoria.nome.toLowerCase().replace(/[^a-z]/g, '');
    return '';
  };

  useEffect(() => {
    async function fetchResultados() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/resultados-inteligencias`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Erro ao buscar resultados');
        const data = await response.json();
        // Espera-se que data seja um array de resultados
        if (Array.isArray(data) && data.length > 0) {
          // Ordena por percentual decrescente
          const ordenados = [...data].sort((a, b) => getPercentual(b) - getPercentual(a));
          setResultadosOrdenados(ordenados);
          setInteligenciaDominante(ordenados[0]);
        } else {
          setResultadosOrdenados([]);
          setInteligenciaDominante(null);
        }
      } catch (err) {
        message.error('Erro ao carregar resultados do teste.');
        setResultadosOrdenados([]);
        setInteligenciaDominante(null);
      } finally {
        setLoading(false);
      }
    }
    fetchResultados();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Carregando seus resultados...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/testes')}
        >
          Voltar aos Testes
        </Button>
      </div>
      <Title level={2}>
        <TrophyOutlined style={{ color: '#faad14', marginRight: '8px' }} />
        Resultados do Teste de Múltiplas Inteligências
      </Title>
      <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
        Baseado na Teoria das Inteligências Múltiplas de Howard Gardner, estes são seus resultados:
      </Paragraph>

      {/* Inteligência Dominante */}
      {inteligenciaDominante && (
        <Card
          title={
            <span>
              <TrophyOutlined style={{ color: '#faad14', marginRight: '8px' }} />
              Sua Inteligência Dominante
            </span>
          }
          style={{ marginBottom: '24px' }}
        >
          <Row gutter={[32, 16]} align="middle" style={{ minHeight: 260 }}>
            <Col xs={24} md={7} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {(() => {
                const chave = getChaveInteligencia(inteligenciaDominante);
                const cat = inteligenciaDominante.categoria || {};
                const info = inteligenciasInfo[chave] || {};
                const nome = cat.nome || info.nome || chave;
                const cor = cat.cor || info.cor || '#faad14';
                const percentual = getPercentual(inteligenciaDominante);
                return <>
                  <Title level={2} style={{ color: cor, margin: 0, marginBottom: 8, lineHeight: 1.1 }}>{nome}</Title>
                  <Text strong style={{ color: '#faad14', fontSize: 17, marginBottom: 12 }}>Inteligência Dominante</Text>
                  <div style={{ margin: '18px 0 0 0' }}>
                    <Progress
                      type="circle"
                      percent={percentual}
                      strokeColor={cor}
                      size={110}
                      style={{ marginBottom: 8 }}
                    />
                    <div style={{ fontSize: 18, fontWeight: 500, color: cor, marginTop: 8 }}>{percentual}%</div>
                    <div style={{ color: '#888', fontSize: 15 }}>{inteligenciaDominante.pontuacao}/35 pontos</div>
                  </div>
                </>;
              })()}
            </Col>
            <Col xs={24} md={17}>
              {(() => {
                const chave = getChaveInteligencia(inteligenciaDominante);
                const cat = inteligenciaDominante.categoria || {};
                const info = inteligenciasInfo[chave] || {};
                const descricao = cat.descricao || info.descricao || '';
                let caracteristicas = cat.caracteristicas_inteligente || info.caracteristicas_inteligente || [];
                if (typeof caracteristicas === 'string') {
                  caracteristicas = caracteristicas.split(/\r?\n|<li>|<br\s*\/?>(?:\s*|)/).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
                }
                let carreiras = cat.carreiras_associadas || info.carreiras_associadas || [];
                if (typeof carreiras === 'string') {
                  carreiras = carreiras.split(/\r?\n|<li>|<br\s*\/?>(?:\s*|)/).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
                }
                return <>
                  <Paragraph style={{ fontSize: 17, color: '#444', marginBottom: 18 }}>{descricao}</Paragraph>
                  {caracteristicas.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <Text strong style={{ fontSize: 16 }}>Características de pessoas com essa inteligência:</Text>
                      <ul style={{ margin: '8px 0 0 18px', color: '#555', fontSize: 15, paddingLeft: 0 }}>
                        {caracteristicas.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                  {carreiras.length > 0 && (
                    <div>
                      <Text strong style={{ fontSize: 16 }}>Carreiras associadas:</Text>
                      <ul style={{ margin: '8px 0 0 18px', color: '#555', fontSize: 15, paddingLeft: 0 }}>
                        {carreiras.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </>;
              })()}
            </Col>
          </Row>
        </Card>
      )}

      {/* Resultados Detalhados */}
      <Card 
        title={
          <span>
            <BookOutlined style={{ marginRight: '8px' }} />
            Análise Completa de Todas as Inteligências
          </span>
        }
      >
        <Collapse accordion bordered={false} style={{ background: 'transparent' }}>
          {resultadosOrdenados.map((resultado, idx) => {
            const chave = getChaveInteligencia(resultado);
            const cat = resultado.categoria || {};
            const info = inteligenciasInfo[chave] || {};
            const nome = cat.nome || info.nome || chave;
            const cor = cat.cor || info.cor || '#faad14';
            const icon = cat.icon || info.icon || null;
            const descricao = cat.descricao || info.descricao || '';
            const percentual = getPercentual(resultado);
            const interpretacao = getInterpretacao(percentual);
            const top3 = idx < 3;
            return (
              <Collapse.Panel
                key={resultado.id}
                style={{
                  marginBottom: 16,
                  border: top3 ? `2.5px solid ${cor}` : '1.5px solid #d9d9d9',
                  boxShadow: idx === 0 ? `0 0 16px 0 ${cor}55` : (top3 ? `0 0 8px 0 ${cor}22` : undefined),
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#fff',
                }}
                header={
                  <div style={{ display: 'flex', alignItems: 'center', minHeight: 60 }}>
                    {top3 && (
                      <span style={{
                        background: cor,
                        color: '#fff',
                        borderRadius: 16,
                        padding: '2px 16px',
                        fontWeight: 700,
                        fontSize: 14,
                        letterSpacing: 1,
                        boxShadow: `0 2px 8px ${cor}33`,
                        marginRight: 16,
                        display: 'inline-block',
                      }}>
                        TOP {idx + 1}
                      </span>
                    )}
                    {icon && <span style={{ fontSize: '24px', marginRight: '12px' }}>{icon}</span>}
                    <div style={{ flex: 1 }}>
                      <Title level={5} style={{ margin: 0, color: cor }}>
                        {nome}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {interpretacao.nivel}
                      </Text>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 70 }}>
                      <Text strong style={{ fontSize: '16px' }}>
                        {percentual}%
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {Math.round(resultado.pontuacao)}/
                        {resultado.categoria && resultado.categoria._count && resultado.categoria._count.perguntas
                          ? resultado.categoria._count.perguntas * 5
                          : 35}
                      </Text>
                    </div>
                  </div>
                }
              >
                <Progress
                  percent={percentual}
                  strokeColor={cor}
                  showInfo={false}
                  style={{ marginBottom: '8px' }}
                />

                {/* Descrição */}
                <Paragraph style={{ fontSize: '13px', margin: '8px 0', color: '#666' }}>
                  {descricao}
                </Paragraph>

                {/* Resultado */}
                {cat.resultado && (
                  <Paragraph style={{ fontSize: '14px', margin: '8px 0', color: '#444' }}>
                    <b>Resultado:</b> {cat.resultado}
                  </Paragraph>
                )}

                {/* Características */}
                {cat.caracteristicas_inteligente && (
                  <div style={{ margin: '10px 0' }}>
                    <b>Características da Inteligência:</b>
                    <div style={{ margin: '6px 0 0 0', color: '#555', fontSize: 14 }}>
                      {(() => {
                        let lista = cat.caracteristicas_inteligente;
                        if (typeof lista === 'string') {
                          lista = lista.includes('\n') ? lista.split(/\r?\n/) : lista.split(',');
                        }
                        if (!Array.isArray(lista)) return null;
                        return lista.map((c, i) => (
                          <div key={i} style={{ marginBottom: 6, lineHeight: '1.6' }}>
                            {c.trim()}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Carreiras */}
                {cat.carreiras_associadas && (
                  <div style={{ margin: '10px 0' }}>
                    <b>Carreiras Associadas:</b>
                    <ul style={{ margin: '6px 0 0 18px', color: '#555', fontSize: 14, paddingLeft: 0 }}>
                      {(() => {
                        let lista = cat.carreiras_associadas;
                        if (typeof lista === 'string') {
                          lista = lista.includes('\n') ? lista.split(/\r?\n/) : lista.split(',');
                        }
                        if (!Array.isArray(lista)) return null;
                        return lista.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>);
                      })()}
                    </ul>
                  </div>
                )}
              </Collapse.Panel>
            );
          })}
        </Collapse>

        <Divider />

        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={4}>💡 Sobre o Teste</Title>
          <Paragraph style={{ maxWidth: '800px', margin: '0 auto', color: '#666' }}>
            A Teoria das Inteligências Múltiplas de Howard Gardner propõe que existem diferentes tipos de 
            inteligência, cada uma representando diferentes formas de processar informações. Seus resultados 
            mostram suas tendências naturais e podem ajudar a identificar áreas de força e oportunidades 
            de desenvolvimento.
          </Paragraph>
        </div>
      </Card>
    </div>
  );
}

export default ResultadosInteligencias;