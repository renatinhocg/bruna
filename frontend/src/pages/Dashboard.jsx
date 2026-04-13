import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Spin, Button, Badge, List, Avatar } from 'antd';
import { 
  CalendarOutlined, 
  CheckCircleOutlined,
  FileTextOutlined,
  BookOutlined,
  BellOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useNavigate, useOutletContext } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import DailyMeet from '../components/DailyMeet';

dayjs.locale('pt-br');

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const { user } = useOutletContext();
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
  const [testesDisponiveis, setTestesDisponiveis] = useState([]);
  const [atividadesRecentes, setAtividadesRecentes] = useState([]);
  const [dailyVisible, setDailyVisible] = useState(false);
  const [dailyRoomName, setDailyRoomName] = useState('');
  const navigate = useNavigate();

  const handleJoinVideo = (agendamento) => {
    console.log('=== INICIANDO VIDEOCHAMADA ===');
    console.log('Agendamento:', agendamento);
    const roomName = `agendamento_${agendamento.id}`;
    console.log('Room Name:', roomName);
    setDailyRoomName(roomName);
    setDailyVisible(true);
    console.log('Daily Visible:', true);
  };

  const marcarTarefaConcluida = async (sessaoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tarefas/sessao/${sessaoId}/concluir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove a tarefa da lista com animação suave
        setTarefasCasa(prevTarefas => prevTarefas.filter(t => t.sessaoId !== sessaoId));
        console.log('✅ Tarefa marcada como concluída');
      } else {
        console.error('❌ Erro ao marcar tarefa:', await response.text());
      }
    } catch (error) {
      console.error('❌ Erro ao marcar tarefa:', error);
    }
  };

  useEffect(() => {
    buscarDadosDashboard();
  }, []);

  const buscarDadosDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const usuarioStr = localStorage.getItem('usuario');
      const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
      
      console.log('🔍 Buscando dados do dashboard...');
      console.log('🔑 Token:', token ? 'Existe' : 'Não existe');
      console.log('👤 Usuário completo:', usuario);
      console.log('👤 ID do usuário:', usuario?.id);
      console.log('🌐 API URL:', API_BASE_URL);
      
      if (!usuario || !usuario.id) {
        console.error('❌ Usuário não encontrado ou sem ID');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/dashboard/estatisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEstatisticas(data.estatisticas);
        console.log('✅ Estatísticas:', data.estatisticas);
        
        // Buscar tarefas de casa das sessões
        console.log('🔍 Buscando tarefas para usuário ID:', usuario.id);
        const sessoesResponse = await fetch(`${API_BASE_URL}/api/sessoes?usuario_id=${usuario.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('📋 Sessões Response Status:', sessoesResponse.status);
        if (sessoesResponse.ok) {
          const sessoesData = await sessoesResponse.json();
          console.log('✅ Sessões recebidas:', sessoesData);
          
          // Buscar tarefas concluídas
          const concluidasResponse = await fetch(`${API_BASE_URL}/api/tarefas/concluidas`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          let tarefasConcluidas = [];
          if (concluidasResponse.ok) {
            const concluidasData = await concluidasResponse.json();
            tarefasConcluidas = concluidasData.map(t => t.sessao_id);
            console.log('✅ Tarefas concluídas:', tarefasConcluidas);
          }
          
          // Extrair tarefas de casa das sessões, filtrando as concluídas
          const tarefasDasSessoes = sessoesData
            .filter(s => s.tarefa_casa && s.tarefa_casa.trim() !== '' && !tarefasConcluidas.includes(s.id))
            .map(s => ({
              id: s.id,
              sessaoId: s.id,
              titulo: s.tarefa_casa,
              data: s.criado_em,
              concluida: false
            }));
          
          console.log('✅ Tarefas extraídas das sessões:', tarefasDasSessoes);
          setTarefasCasa(tarefasDasSessoes);
        } else {
          console.error('❌ Erro ao buscar sessões:', await sessoesResponse.text());
        }
        
        // Buscar agendamentos
        console.log('🔍 Buscando agendamentos...');
        const agendamentosResponse = await fetch(`${API_BASE_URL}/api/agendamentos?usuario_id=${usuario.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('📅 Agendamentos Response Status:', agendamentosResponse.status);
        let agendamentosData = [];
        if (agendamentosResponse.ok) {
          agendamentosData = await agendamentosResponse.json();
          console.log('✅ Agendamentos recebidos:', agendamentosData);
          setAgendamentos(agendamentosData);
        } else {
          console.error('❌ Erro ao buscar agendamentos:', await agendamentosResponse.text());
        }

        // Buscar testes realizados
        console.log('🔍 Buscando testes realizados...');
        const testesResponse = await fetch(`${API_BASE_URL}/api/resultados`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('📝 Testes Response Status:', testesResponse.status);
        if (testesResponse.ok) {
          const testesResult = await testesResponse.json();
          console.log('✅ Testes recebidos:', testesResult);
          
          // A API pode retornar { success: true, data: [...] } ou array direto
          const testesData = Array.isArray(testesResult) ? testesResult : (testesResult.data || []);
          console.log('📋 Array de testes:', testesData);
          
          const tiposTestes = testesData.map(t => t.tipo_teste);
          console.log('📊 Tipos de testes:', tiposTestes);
          setTestesRealizados(tiposTestes);
          
          // Criar atividades recentes baseado nos testes realizados
          const atividadesTestes = testesData.map((teste) => {
            const tipoNomes = {
              'disc': 'DISC',
              'inteligencias': 'Múltiplas Inteligências',
              'dominancia': 'Dominância Cerebral'
            };
            
            const tipoNome = tipoNomes[teste.tipo_teste] || teste.tipo_teste;
            const dataTeste = teste.created_at || teste.iniciado_em;
            
            return {
              tipo: 'teste',
              titulo: `Teste ${tipoNome}`,
              descricao: `Completado dia ${dayjs(dataTeste).format('DD/MM/YY [às] HH:mm')}`,
              data: dataTeste,
              timestamp: dayjs(dataTeste).valueOf()
            };
          });
          
          // Adicionar agendamentos concluídos às atividades
          console.log('📅 Total de agendamentos:', agendamentosData.length);
          console.log('📅 Agendamentos:', agendamentosData);
          
          const atividadesAgendamentos = agendamentosData
            .filter(ag => {
              console.log(`📅 Agendamento ${ag.id}: status=${ag.status}, concluido?`, ag.status === 'concluido');
              return ag.status === 'concluido';
            })
            .map((agendamento) => ({
              tipo: 'sessao',
              titulo: agendamento.titulo || 'Sessão',
              descricao: `Realizada dia ${dayjs(agendamento.data_hora).format('DD/MM/YY [às] HH:mm')}`,
              data: agendamento.data_hora,
              timestamp: dayjs(agendamento.data_hora).valueOf()
            }));
          
          console.log('📅 Atividades de agendamentos:', atividadesAgendamentos);
          
          // Buscar tarefas concluídas
          console.log('📝 Buscando tarefas concluídas...');
          const concluidasResponse = await fetch(`${API_BASE_URL}/api/tarefas/concluidas`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          let atividadesTarefas = [];
          if (concluidasResponse.ok) {
            const concluidasData = await concluidasResponse.json();
            console.log('✅ Tarefas concluídas recebidas:', concluidasData);
            atividadesTarefas = concluidasData.map(tarefa => {
              const tarefaTexto = tarefa.sessao?.tarefa_casa || 'Tarefa de casa';
              // Limitar a 50 caracteres
              const tarefaResumida = tarefaTexto.length > 50 ? tarefaTexto.substring(0, 50) + '...' : tarefaTexto;
              
              return {
                tipo: 'tarefa',
                titulo: 'Tarefa de casa concluída',
                descricao: tarefaResumida,
                data: tarefa.criado_em,
                timestamp: dayjs(tarefa.criado_em).valueOf()
              };
            });
            console.log('📝 Atividades de tarefas:', atividadesTarefas);
          } else {
            console.error('❌ Erro ao buscar tarefas concluídas:', await concluidasResponse.text());
          }
          
          console.log('📊 Atividades de testes:', atividadesTestes.length);
          console.log('📅 Atividades de sessões:', atividadesAgendamentos.length);
          console.log('📝 Atividades de tarefas:', atividadesTarefas.length);
          
          // Combinar e ordenar por data (mais recente primeiro)
          const todasAtividades = [...atividadesTestes, ...atividadesAgendamentos, ...atividadesTarefas]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5); // Pegar as 5 mais recentes
          
          console.log('✅ Atividades recentes combinadas:', todasAtividades);
          setAtividadesRecentes(todasAtividades);
        } else {
          console.error('❌ Erro ao buscar testes:', await testesResponse.text());
        }

        // Buscar testes disponíveis
        console.log('🔍 Buscando testes disponíveis...');
        const testesDisponiveisResponse = await fetch(`${API_BASE_URL}/api/testes-disponiveis/disponiveis`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('📝 Testes Disponíveis Response Status:', testesDisponiveisResponse.status);
        if (testesDisponiveisResponse.ok) {
          const testesDisponiveisData = await testesDisponiveisResponse.json();
          console.log('✅ Testes disponíveis recebidos:', testesDisponiveisData);
          
          // Log detalhado de cada teste
          testesDisponiveisData.forEach(teste => {
            console.log(`📋 Teste: ${teste.titulo}`);
            console.log(`   - Tipo: ${teste.tipo}`);
            console.log(`   - Ativo: ${teste.ativo}`);
            console.log(`   - Realizado: ${teste.realizado}`);
            console.log(`   - Deve aparecer? ${!teste.realizado && teste.ativo ? 'SIM' : 'NÃO'}`);
          });
          
          setTestesDisponiveis(testesDisponiveisData);
        } else {
          console.error('❌ Erro ao buscar testes disponíveis:', await testesDisponiveisResponse.text());
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const primeiroNome = user?.nome ? user.nome.split(' ')[0] : 'Usuário';
  const dataHoje = dayjs().format('dddd, D [de] MMMM [de] YYYY');

  console.log('Dashboard - Testes Realizados:', testesRealizados);
  console.log('Dashboard - Testes Disponíveis:', testesDisponiveis);

  return (
    <div style={{ 
      padding: '40px 48px', 
      background: '#f5f5f5', 
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header Simples */}
      <div style={{ marginBottom: '32px' }}>
    
        <Title level={2} style={{ 
          margin: '0 0 6px 0', 
          fontSize: window.innerWidth < 768 ? '32px' : '42px', 
          fontWeight: '600',
          lineHeight: '1.2',
          color: '#262626'
        }}>
          Olá, {primeiroNome}
        </Title>
        <Text style={{ 
          fontSize: window.innerWidth < 768 ? '24px' : '24px', 
          color: '#8c8c8c' 
        }}>
          {dataHoje}
        </Text>
      </div>

      <Row gutter={[28, 28]}>
        {/* Coluna Principal - Esquerda */}
        <Col xs={24} lg={15} xl={16}>
          <Row gutter={[24, 24]}>
            {/* Card Grande de Teste em Destaque - Primeiro teste não realizado */}
            {testesDisponiveis.filter(t => !t.realizado && t.ativo).slice(0, 1).map((teste) => (
              <Col xs={24} lg={10} key={teste.tipo}>
            <Card
              hoverable
              onClick={() => navigate(teste.rota)}
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#141B2D',
                border: 'none',
                minHeight: '280px',
                maxHeight: '400px'
              }}
              bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{
                backgroundImage: `url(${teste.imagem})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '140px',
                flexShrink: 0
              }} />
              <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Title level={3} style={{ color: 'white', marginBottom: '0', fontSize: '18px', lineHeight: '1.3' }}>
                  {teste.titulo}
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', marginBottom: '0', lineHeight: '1.5' }}>
                  {teste.descricao}
                </Paragraph>
                <Button 
                  type="default"
                  size="large"
                  style={{
                    background: 'white',
                    color: '#141B2D',
                    border: 'none',
                    fontWeight: '600',
                    height: '44px',
                    padding: '0 28px',
                    borderRadius: '8px',
                    width: '100%',
                    marginTop: '4px'
                  }}
                >
                  Fazer teste
                </Button>
              </div>
            </Card>
              </Col>
            ))}

            {/* Tarefas de Casa ao lado do Teste */}
            {tarefasCasa.length > 0 && (
              <Col xs={24} lg={14}>
                <Card 
                  title={
                    <span style={{ fontSize: '24px', fontWeight: '600', color: '#262626' }}>
                      Tarefas de casa
                    </span>
                  }
                  style={{ height: '100%', borderRadius: '16px', border: '1px solid #f0f0f0' }}
                  headStyle={{ borderBottom: '1px solid #f0f0f0', padding: '20px 24px' }}
                  bodyStyle={{ padding: '20px 24px' }}
                >
                  <List
                    dataSource={tarefasCasa}
                    renderItem={(item) => (
                      <List.Item style={{ border: 'none', padding: '12px 0', alignItems: 'flex-start' }}>
                        <List.Item.Meta
                          avatar={
                            <CheckCircleOutlined 
                              onClick={() => marcarTarefaConcluida(item.sessaoId)}
                              style={{ 
                                fontSize: '20px', 
                                color: item.concluida ? '#52c41a' : '#d9d9d9', 
                                marginTop: '2px',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                              }} 
                              onMouseEnter={(e) => e.currentTarget.style.color = '#52c41a'}
                              onMouseLeave={(e) => e.currentTarget.style.color = item.concluida ? '#52c41a' : '#d9d9d9'}
                            />
                          }
                          title={
                            <Text 
                              style={{ 
                                fontSize: '16px', 
                                color: '#262626',
                                textDecoration: item.concluida ? 'line-through' : 'none'
                              }}
                            >
                              {item.titulo}
                            </Text>
                          }
                          description={
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {dayjs(item.data).format('DD/MM/YY')}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                  <Button 
                    type="link" 
                    style={{ padding: 0, marginTop: '8px', color: '#F39200', fontWeight: '600', fontSize: '14px' }}
                  >
                    + Ver tudo
                  </Button>
                </Card>
              </Col>
            )}
          </Row>

          {/* Atividades Recentes e Testes Realizados */}
          <Row gutter={[28, 28]} style={{ marginTop: '32px' }}>
            {/* Atividades Recentes */}
            <Col xs={24} lg={12}>
              <Title level={4} style={{ marginBottom: '16px', fontSize: '24px', fontWeight: '600', color: '#262626' }}>
                Atividades recentes
              </Title>
              <Card style={{ borderRadius: '16px', border: '1px solid #f0f0f0' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '20px',
                    bottom: '20px',
                    width: '2px',
                    background: '#e8e8e8'
                  }} />
                  <List
                    itemLayout="horizontal"
                    dataSource={atividadesRecentes.slice(0, 5)}
                    locale={{ emptyText: 'Nenhuma atividade recente' }}
                    renderItem={(item, index) => (
                      <List.Item
                        style={{
                          padding: '16px 0',
                          paddingLeft: '52px',
                          border: 'none',
                          position: 'relative'
                        }}
                      >
                        <Avatar 
                          icon={
                            item.tipo === 'sessao' ? <CalendarOutlined /> : 
                            item.tipo === 'teste' ? <FileTextOutlined /> : 
                            item.tipo === 'tarefa' ? <CheckCircleOutlined /> : 
                            <FileTextOutlined />
                          }
                          style={{ 
                            background: 
                              item.tipo === 'sessao' ? '#141B2D' : 
                              item.tipo === 'teste' ? '#52c41a' : 
                              item.tipo === 'tarefa' ? '#F39200' : 
                              '#8c8c8c',
                            width: 42,
                            height: 42,
                            position: 'absolute',
                            left: 0,
                            zIndex: 1,
                            border: '3px solid white'
                          }}
                        />
                        <List.Item.Meta
                          title={<Text strong style={{ fontSize: '15px', color: '#262626' }}>{item.titulo}</Text>}
                          description={<Text type="secondary" style={{ fontSize: '13px' }}>{item.descricao}</Text>}
                        />
                        <Button 
                          type="text" 
                          icon={<CopyOutlined />}
                          style={{ color: '#bfbfbf' }}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </Card>
            </Col>

            {/* Testes Realizados */}
            <Col xs={24} lg={12}>
              <Title level={4} style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600', color: '#262626' }}>
                Testes realizados
              </Title>
              <Row gutter={[16, 16]}>
            {testesDisponiveis.filter(t => t.realizado).map((teste, index) => (
              <Col xs={24} key={teste.tipo}>
                <Card
                  hoverable
                  onClick={() => navigate(teste.rotaResultado)}
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <Row>
                    <Col xs={10}>
                      <div style={{
                        height: '100%',
                        minHeight: '140px',
                        backgroundImage: `url(${teste.imagem})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }} />
                    </Col>
                    <Col xs={14}>
                      <div style={{ 
                        padding: '20px',
                        background: '#141B2D',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Title level={5} style={{ color: 'white', marginBottom: '8px', fontSize: '16px' }}>
                          {teste.titulo}
                        </Title>
                        <Paragraph style={{ 
                          color: 'rgba(255,255,255,0.8)', 
                          fontSize: '12px',
                          marginBottom: '12px',
                          flex: 1
                        }}>
                          {teste.descricao}
                        </Paragraph>
                        <Button 
                          type="default"
                          size="small"
                          style={{
                            background: 'transparent',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        >
                          Ver resultado
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
              </Row>
            </Col>
          </Row>
        </Col>

        {/* Coluna Direita - Calendário */}
        <Col xs={24} lg={9} xl={8}>
          {/* Calendário */}
          <Card 
            title={
              <span style={{ fontSize: '24px', fontWeight: '600', color: '#262626' }}>
                Calendário
              </span>
            }
            style={{ borderRadius: '16px', border: '1px solid #f0f0f0' }}
            headStyle={{ borderBottom: '1px solid #f0f0f0', padding: '20px 24px' }}
            bodyStyle={{ padding: '24px' }}
          >
            {/* Card de Hoje */}
            {agendamentos.filter(a => dayjs(a.data_hora).isSame(dayjs(), 'day')).length > 0 && (
              <Card
                style={{
                  background: 'linear-gradient(135deg, #F39200 0%, #FDB913 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  marginBottom: '28px',
 
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Text strong style={{ color: 'white', fontSize: '15px', display: 'block', marginBottom: '20px', opacity: 0.9 }}>
                  Hoje
                </Text>
                {agendamentos
                  .filter(a => dayjs(a.data_hora).isSame(dayjs(), 'day'))
                  .map((agendamento, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: '32px', fontWeight: '700', display: 'block', lineHeight: '1.2', marginBottom: '8px' }}>
                          {dayjs(agendamento.data_hora).format('HH:mm')}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: '14px', display: 'block', marginBottom: '2px' }}>
                          {agendamento.titulo}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                          {agendamento.tipo || 'sessão'}
                        </Text>
                      </div>
                      <Button 
                        type="default"
                        size="large"
                        onClick={() => handleJoinVideo(agendamento)}
                        style={{
                          background: 'white',
                          color: '#F39200',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          height: '40px',
                          padding: '0 24px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        }}
                      >
                        Iniciar
                      </Button>
                    </div>
                  ))
                }
              </Card>
            )}

            {/* Próximos Agendamentos */}
            <div>
              {agendamentos.filter(a => dayjs(a.data_hora).isAfter(dayjs())).length === 0 && 
               agendamentos.filter(a => dayjs(a.data_hora).isSame(dayjs(), 'day')).length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#8c8c8c'
                }}>
                  <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
                  <Text style={{ fontSize: '15px', display: 'block', color: '#595959' }}>
                    Sem agendamentos próximos
                  </Text>
                </div>
              ) : (
                <>
                  {agendamentos
                    .filter(a => !dayjs(a.data_hora).isSame(dayjs(), 'day') && dayjs(a.data_hora).isAfter(dayjs()))
                    .slice(0, 5)
                    .map((agendamento, index) => {
                      const data = dayjs(agendamento.data_hora);
                      return (
                        <div key={index} style={{ marginBottom: '24px' }}>
                          <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '12px', color: '#262626' }}>
                            {data.format('DD [de] MMMM [de] YYYY')}
                          </Text>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            background: '#fafafa',
                            borderRadius: '10px',
                            borderLeft: '4px solid #141B2D'
                          }}>
                            <Text strong style={{ fontSize: '18px', color: '#262626', minWidth: '50px' }}>
                              {data.format('HH:mm')}
                            </Text>
                            <div style={{ flex: 1 }}>
                              <Text style={{ fontSize: '14px', display: 'block', color: '#262626', marginBottom: '2px' }}>
                                {agendamento.titulo}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {agendamento.tipo || 'sessão'}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                  <Button 
                    type="link" 
                    onClick={() => navigate('/cliente/agendamentos')}
                    style={{ padding: 0, marginTop: '4px', color: '#141B2D', fontWeight: '600', fontSize: '14px' }}
                  >
                    Ver todos os agendamentos →
                  </Button>
                </>
              )}
            </div>
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
};

export default Dashboard;
