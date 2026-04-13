import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Table, Tag, Spin } from 'antd';
import { DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import API_BASE_URL from '../config/api';

const { Title, Text } = Typography;

const RelatorioDominancia = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token não encontrado');
        setLoading(false);
        return;
      }
      
      // Buscar resultado do teste
      const responseResultado = await fetch(`${API_BASE_URL}/api/testes-dominancia/resultado`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!responseResultado.ok) {
        throw new Error('Erro ao buscar resultado');
      }
      
      const resultado = await responseResultado.json();
      
      // Buscar todas as questões
      const responseQuestoes = await fetch(`${API_BASE_URL}/api/testes-dominancia/questoes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!responseQuestoes.ok) {
        throw new Error('Erro ao buscar questões');
      }
      
      const questoes = await responseQuestoes.json();
      
      // Buscar respostas do usuário - usar o ID do resultado retornado
      const responseRespostas = await fetch(`${API_BASE_URL}/api/testes-dominancia/minhas-respostas/${resultado.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!responseRespostas.ok) {
        throw new Error('Erro ao buscar respostas');
      }
      
      const respostas = await responseRespostas.json();
      
      setDados({ resultado, questoes, respostas });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const gerarQuadroRespostas = () => {
    if (!dados) return [];

    const quadro = [];
    
    dados.questoes.forEach((questao, qIndex) => {
      const respostasQuestao = dados.respostas.filter(r => r.questao_id === questao.id);
      
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

  const calcularPontuacoesPorQuestao = () => {
    if (!dados) return [];

    const pontuacoes = [];
    
    dados.questoes.forEach(questao => {
      const respostasQuestao = dados.respostas.filter(r => r.questao_id === questao.id);
      
      const contagem = { SE: 0, SD: 0, IE: 0, ID: 0 };
      
      respostasQuestao.forEach(resposta => {
        const opcao = questao.opcoes.find(o => o.id === resposta.opcao_id);
        if (opcao) {
          contagem[opcao.quadrante]++;
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

  const desenharGraficoEstrela = () => {
    if (!dados) return null;

    const { pontuacao_se, pontuacao_sd, pontuacao_ie, pontuacao_id } = dados.resultado;
    const maxPontuacao = Math.max(pontuacao_se, pontuacao_sd, pontuacao_ie, pontuacao_id);
    const escala = 150 / Math.max(maxPontuacao, 16); // 150px de raio máximo

    // Coordenadas dos quadrantes (em graus: SE=90°, SD=0°, IE=180°, ID=270°)
    const calcularPonto = (angulo, distancia) => {
      const rad = (angulo * Math.PI) / 180;
      return {
        x: 200 + distancia * Math.cos(rad),
        y: 200 - distancia * Math.sin(rad)
      };
    };

    const pontos = {
      SE: calcularPonto(90, pontuacao_se * escala),
      SD: calcularPonto(0, pontuacao_sd * escala),
      IE: calcularPonto(180, pontuacao_ie * escala),
      ID: calcularPonto(270, pontuacao_id * escala)
    };

    const caminho = `M ${pontos.SE.x},${pontos.SE.y} L ${pontos.SD.x},${pontos.SD.y} L ${pontos.ID.x},${pontos.ID.y} L ${pontos.IE.x},${pontos.IE.y} Z`;

    return (
      <svg width="400" height="400" style={{ margin: '0 auto', display: 'block' }}>
        {/* Grade de fundo */}
        {[1, 2, 3, 4].map(nivel => {
          const r = nivel * 37.5;
          const p1 = calcularPonto(90, r);
          const p2 = calcularPonto(0, r);
          const p3 = calcularPonto(270, r);
          const p4 = calcularPonto(180, r);
          return (
            <path
              key={nivel}
              d={`M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} L ${p4.x},${p4.y} Z`}
              fill="none"
              stroke="#ddd"
              strokeWidth="1"
            />
          );
        })}

        {/* Linhas dos eixos */}
        <line x1="200" y1="50" x2="200" y2="350" stroke="#888" strokeWidth="2" />
        <line x1="50" y1="200" x2="350" y2="200" stroke="#888" strokeWidth="2" />

        {/* Forma do resultado */}
        <path
          d={caminho}
          fill="rgba(24, 144, 255, 0.3)"
          stroke="#1890ff"
          strokeWidth="3"
        />

        {/* Pontos nos vértices */}
        <circle cx={pontos.SE.x} cy={pontos.SE.y} r="6" fill="#1890ff" />
        <circle cx={pontos.SD.x} cy={pontos.SD.y} r="6" fill="#722ed1" />
        <circle cx={pontos.IE.x} cy={pontos.IE.y} r="6" fill="#52c41a" />
        <circle cx={pontos.ID.x} cy={pontos.ID.y} r="6" fill="#fa8c16" />

        {/* Labels dos quadrantes */}
        <text x="200" y="35" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1890ff">
          SE
        </text>
        <text x="200" y="380" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#52c41a">
          IE
        </text>
        <text x="30" y="205" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#fa8c16">
          ID
        </text>
        <text x="370" y="205" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#722ed1">
          SD
        </text>

        {/* Valores */}
        <text x={pontos.SE.x} y={pontos.SE.y - 12} textAnchor="middle" fontSize="14" fontWeight="bold">
          {pontuacao_se}
        </text>
        <text x={pontos.SD.x + 15} y={pontos.SD.y + 5} textAnchor="start" fontSize="14" fontWeight="bold">
          {pontuacao_sd}
        </text>
        <text x={pontos.IE.x - 15} y={pontos.IE.y + 5} textAnchor="end" fontSize="14" fontWeight="bold">
          {pontuacao_ie}
        </text>
        <text x={pontos.ID.x} y={pontos.ID.y + 20} textAnchor="middle" fontSize="14" fontWeight="bold">
          {pontuacao_id}
        </text>
      </svg>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 20 }}>Carregando relatório...</p>
      </div>
    );
  }

  const colunasPontuacao = [
    {
      title: 'Questão',
      dataIndex: 'questao',
      key: 'questao',
      width: 100,
      align: 'center'
    },
    {
      title: 'SE',
      dataIndex: 'SE',
      key: 'SE',
      width: 80,
      align: 'center',
      render: (val) => <Tag color="blue">{val}</Tag>
    },
    {
      title: 'SD',
      dataIndex: 'SD',
      key: 'SD',
      width: 80,
      align: 'center',
      render: (val) => <Tag color="purple">{val}</Tag>
    },
    {
      title: 'IE',
      dataIndex: 'IE',
      key: 'IE',
      width: 80,
      align: 'center',
      render: (val) => <Tag color="green">{val}</Tag>
    },
    {
      title: 'ID',
      dataIndex: 'ID',
      key: 'ID',
      width: 80,
      align: 'center',
      render: (val) => <Tag color="orange">{val}</Tag>
    }
  ];

  const colunasQuadro = [
    {
      title: 'Q',
      dataIndex: 'questao',
      key: 'questao',
      width: 80,
      align: 'center'
    },
    {
      title: 'Quadrante',
      dataIndex: 'quadrante',
      key: 'quadrante',
      width: 100,
      align: 'center',
      render: (quad) => {
        const cores = { SE: 'blue', SD: 'purple', IE: 'green', ID: 'orange' };
        return <Tag color={cores[quad]}>{quad}</Tag>;
      }
    },
    {
      title: 'Selecionada',
      dataIndex: 'selecionada',
      key: 'selecionada',
      width: 100,
      align: 'center',
      render: (val) => val === 1 ? '✓' : '-'
    }
  ];

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      overflow: 'auto',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          maxWidth: 1200, 
          margin: '0 auto',
          marginTop: window.innerWidth < 768 ? '20px' : '40px',
          marginBottom: '40px'
        }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Relatório de Dominância Cerebral</Title>
            <Button icon={<CloseOutlined />} onClick={onClose}>Fechar</Button>
          </div>
        }
      >
        {/* Gráfico Estrela */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
            Gráfico de Dominância - Autopercepção
          </Title>
          {desenharGraficoEstrela()}
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(4, 1fr)',
            gap: '16px',
            marginTop: 24
          }}>
            <Card size="small" style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}>
              <Text strong style={{ color: '#1890ff' }}>SE - Analítico</Text>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {dados.resultado.pontuacao_se}
              </div>
            </Card>
            <Card size="small" style={{ backgroundColor: '#f9f0ff', borderColor: '#722ed1' }}>
              <Text strong style={{ color: '#722ed1' }}>SD - Experimental</Text>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                {dados.resultado.pontuacao_sd}
              </div>
            </Card>
            <Card size="small" style={{ backgroundColor: '#f6ffed', borderColor: '#52c41a' }}>
              <Text strong style={{ color: '#52c41a' }}>IE - Organizacional</Text>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {dados.resultado.pontuacao_ie}
              </div>
            </Card>
            <Card size="small" style={{ backgroundColor: '#fff7e6', borderColor: '#fa8c16' }}>
              <Text strong style={{ color: '#fa8c16' }}>ID - Interpessoal</Text>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                {dados.resultado.pontuacao_id}
              </div>
            </Card>
          </div>
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

        {/* Botão Imprimir */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            size="large"
            onClick={() => window.print()}
          >
            Imprimir Relatório
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RelatorioDominancia;
