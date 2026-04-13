import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, Button, Calendar, Badge } from 'antd';
import { FileTextOutlined, CalendarOutlined, CheckCircleOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import DailyMeet from './components/DailyMeet';

dayjs.locale('pt-br');

const { Title, Text } = Typography;

function Dashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState({
    testesRealizados: 0,
    agendamentos: 0,
    testesInteligencia: 0,
    testesDominancia: 0,
    testesDISC: 0
  });
  const [tarefasCasa, setTarefasCasa] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [testesRealizados, setTestesRealizados] = useState([]);
  const [dailyVisible, setDailyVisible] = useState(false);
  const [dailyRoomName, setDailyRoomName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    buscarDadosDashboard();
  }, []);

  const handleJoinVideo = (agendamento) => {
    console.log('=== INICIANDO VIDEOCHAMADA ===');
    console.log('Agendamento:', agendamento);
    const roomName = `agendamento_${agendamento.id}`;
    console.log('Room Name:', roomName);
    setDailyRoomName(roomName);
    setDailyVisible(true);
    console.log('Daily Visible:', true);
  };

  const buscarDadosDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/dashboard/estatisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEstatisticas(data.estatisticas);
        
        // Buscar agendamentos
        const agendamentosResponse = await fetch(`${API_BASE_URL}/agendamentos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (agendamentosResponse.ok) {
          const agendamentosData = await agendamentosResponse.json();
          setAgendamentos(agendamentosData);
        }

        // Buscar testes realizados
        const testesResponse = await fetch(`${API_BASE_URL}/resultados`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (testesResponse.ok) {
          const testesData = await testesResponse.json();
          setTestesRealizados(testesData.map(t => t.tipo_teste));
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getListData = (value) => {
    const listData = [];
    const dateStr = value.format('YYYY-MM-DD');
    
    agendamentos.forEach(agendamento => {
      if (dayjs(agendamento.data_hora).format('YYYY-MM-DD') === dateStr) {
        listData.push({
          type: 'success',
          content: dayjs(agendamento.data_hora).format('HH:mm'),
        });
      }
    });
    
    return listData || [];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const testes = [
    {
      titulo: 'Teste de Múltiplas Inteligências',
      descricao: 'Descubra seus tipos de inteligência predominantes',
      tipo: 'inteligencia',
      rota: '/cliente/teste-inteligencias',
      realizado: testesRealizados.includes('inteligencia')
    },
    {
      titulo: 'Teste de Dominância Cerebral',
      descricao: 'Identifique seu estilo de pensamento',
      tipo: 'dominancia',
      rota: '/cliente/teste-dominancia',
      realizado: testesRealizados.includes('dominancia')
    },
    {
      titulo: 'Teste DISC',
      descricao: 'Conheça seu perfil comportamental',
      tipo: 'disc',
      rota: '/cliente/teste-disc',
      realizado: testesRealizados.includes('disc')
    }
  ];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header com Logo IMPULSO */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={1} style={{ 
          fontSize: '42px', 
          fontWeight: '800', 
          margin: 0,
          background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '2px'
        }}>
          IMPULSO
        </Title>
        <Text style={{ fontSize: '16px', color: '#666', marginTop: '8px', display: 'block' }}>
          Bem-vindo, {user?.nome || 'Usuário'}!
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Coluna Principal */}
        <Col xs={24} lg={17}>
          {/* Cards de Tarefas de Casa */}
          {tarefasCasa.length > 0 && (
            <Card 
              title={
                <span>
                  <BookOutlined style={{ marginRight: '8px' }} />
                  Tarefas de Casa
                </span>
              }
              style={{ marginBottom: '24px', borderRadius: '12px' }}
              headStyle={{ background: '#4FD1C5', color: 'white', borderRadius: '12px 12px 0 0' }}
            >
              {tarefasCasa.map((tarefa, index) => (
                <div key={index} style={{ 
                  padding: '12px',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  marginBottom: index < tarefasCasa.length - 1 ? '12px' : 0
                }}>
                  <Text strong>{tarefa.titulo}</Text>
                  <br />
                  <Text type="secondary">{tarefa.descricao}</Text>
                </div>
              ))}
            </Card>
          )}

          {/* Cards de Testes */}
          <Title level={3} style={{ marginBottom: '16px' }}>Seus Testes</Title>
          <Row gutter={[16, 16]}>
            {testes.map((teste, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  hoverable
                  onClick={() => !teste.realizado && navigate('/cliente/testes')}
                  style={{
                    height: '100%',
                    borderRadius: '12px',
                    background: teste.realizado ? '#1a1d2e' : '#007BFF',
                    color: 'white',
                    border: 'none',
                    cursor: teste.realizado ? 'default' : 'pointer',
                    opacity: teste.realizado ? 0.85 : 1
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <FileTextOutlined style={{ fontSize: '32px', color: 'white' }} />
                  </div>
                  <Title level={4} style={{ color: 'white', marginBottom: '8px' }}>
                    {teste.titulo}
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px' }}>
                    {teste.descricao}
                  </Text>
                  {teste.realizado && (
                    <div style={{ marginTop: '16px' }}>
                      <CheckCircleOutlined style={{ marginRight: '8px', color: '#4FD1C5' }} />
                      <Text style={{ color: '#4FD1C5', fontWeight: '500' }}>Concluído</Text>
                    </div>
                  )}
                  {!teste.realizado && (
                    <Button 
                      type="default" 
                      style={{ 
                        marginTop: '16px',
                        background: 'white',
                        color: '#007BFF',
                        border: 'none',
                        fontWeight: '600'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/cliente/testes');
                      }}
                    >
                      Iniciar Teste
                    </Button>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Coluna do Calendário */}
        <Col xs={24} lg={7}>
          <Card 
            style={{ borderRadius: '12px', position: 'sticky', top: '20px' }}
            title={
              <span>
                <CalendarOutlined style={{ marginRight: '8px' }} />
                Calendário
              </span>
            }
          >
            {agendamentos.filter(a => dayjs(a.data_hora).isSame(dayjs(), 'day')).length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #4FD1C5 0%, #3DBFB3 100%)',
                padding: '20px',
                borderRadius: '10px',
                color: 'white',
                marginBottom: '20px',
              }}>
                <div style={{ fontSize: '12px', marginBottom: '8px', opacity: 0.9 }}>Hoje</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 700 }}>
                      {dayjs(agendamentos.filter(a => dayjs(a.data_hora).isSame(dayjs(), 'day'))[0].data_hora).format('HH:mm')}
                    </div>
                    <div style={{ fontSize: '14px', marginTop: '4px' }}>
                      {agendamentos.filter(a => dayjs(a.data_hora).isSame(dayjs(), 'day'))[0].titulo || 'Próximo agendamento'}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>
                      {agendamentos.filter(a => dayjs(a.data_hora).isSame(dayjs(), 'day'))[0].descricao || 'sessão'}
                    </div>
                  </div>
                  <Button 
                    type="default"
                    size="small"
                    onClick={() => handleJoinVideo(agendamentos.filter(a => dayjs(a.data_hora).isSame(dayjs(), 'day'))[0])}
                    style={{ 
                      background: 'white',
                      color: '#1a1d2e',
                      border: 'none',
                      fontWeight: 600
                    }}
                  >
                  teste
                  </Button>
                </div>
              </div>
            )}

            <Calendar 
              fullscreen={false} 
              cellRender={dateCellRender}
              style={{ borderRadius: '8px' }}
            />
            
            {agendamentos.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <Title level={5}>Próximas Sessões</Title>
                {agendamentos
                  .filter(a => !dayjs(a.data_hora).isSame(dayjs(), 'day') && dayjs(a.data_hora).isAfter(dayjs()))
                  .slice(0, 3)
                  .map((agendamento, index) => (
                    <div key={index} style={{ 
                      padding: '12px',
                      background: '#f0f8ff',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      borderLeft: '4px solid #007BFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                          {agendamento.titulo || 'Próximo agendamento'}
                        </Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: '13px' }}>
                          {dayjs(agendamento.data_hora).format('DD/MM/YYYY')} às {dayjs(agendamento.data_hora).format('HH:mm')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {agendamento.descricao || 'sessão'}
                        </Text>
                      </div>
                    </div>
                  ))
                }
                <Button 
                  type="link" 
                  onClick={() => navigate('/cliente/agendamentos')}
                  style={{ padding: 0, marginTop: '8px' }}
                >
                  Ver todos os agendamentos
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <DailyMeet
        visible={dailyVisible}
        roomName={dailyRoomName}
        displayName={user?.nome || 'Usuário'}
        onClose={() => setDailyVisible(false)}
      />
    </div>
  );
}

export default Dashboard;