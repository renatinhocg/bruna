import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Row, Col, Spin, message } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, PaperClipOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/pt-br';
import axios from 'axios';

moment.locale('pt-br');

const { Title, Text } = Typography;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

function DetalhesAgendamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agendamento, setAgendamento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgendamento();
  }, [id]);

  const fetchAgendamento = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Buscando agendamento ID:', id);
      console.log('URL:', `${API_BASE_URL}/api/agendamentos/${id}`);
      
      const response = await axios.get(`${API_BASE_URL}/api/agendamentos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Resposta do backend:', response.data);
      setAgendamento(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamento:', error);
      console.error('Detalhes do erro:', error.response?.data);
      message.error('Erro ao carregar detalhes do agendamento');
    } finally {
      setLoading(false);
    }
  };

  const addToCalendar = () => {
    if (!agendamento) return;
    
    const dataInicio = moment(agendamento.data_hora);
    const dataFim = dataInicio.clone().add(agendamento.duracao_minutos, 'minutes');
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(agendamento.titulo)}&dates=${dataInicio.format('YYYYMMDDTHHmmss')}/${dataFim.format('YYYYMMDDTHHmmss')}&details=${encodeURIComponent(agendamento.descricao || '')}&sf=true&output=xml`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Text>Agendamento não encontrado</Text>
      </div>
    );
  }

  const diasSemanaPT = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const diaSemana = diasSemanaPT[moment(agendamento.data_hora).day()];
  
  // Verificar se o evento já passou
  const eventoPassou = moment(agendamento.data_hora).isBefore(moment());

  return (
    <div style={{ 
      padding: window.innerWidth < 768 ? '20px' : '40px 48px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      paddingBottom: eventoPassou ? '40px' : '100px' // Espaço para o botão fixo
    }}>
      {/* Header com Botão Voltar */}
      <div style={{ marginBottom: '32px' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ 
            padding: '4px 8px',
            fontSize: '14px',
            color: '#262626',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Voltar
        </Button>
      </div>

      {/* Título da Página */}
      <Title level={2} style={{ margin: 0, marginBottom: '32px', fontSize: '28px', fontWeight: '700', color: '#1a1d2e' }}>
        Meus agendamentos
      </Title>

      <Row gutter={[24, 24]}>
        {/* Coluna Esquerda - Informações Principais */}
        <Col xs={24} md={10}>
          <Card
            style={{
              borderRadius: '12px',
              border: 'none'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <Title level={3} style={{ margin: 0, marginBottom: '32px', fontSize: '22px', fontWeight: '600', color: '#1a1d2e' }}>
              {agendamento.titulo || 'Sessão de atendimento'}
            </Title>

            {/* Data */}
            <div style={{ marginBottom: '24px' }}>
              <Text style={{ display: 'block', fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>
                Data
              </Text>
              <Text strong style={{ display: 'block', fontSize: '18px', color: '#262626', marginBottom: '4px' }}>
                {moment(agendamento.data_hora).format('DD/MM/YYYY')}
              </Text>
              <Text style={{ fontSize: '14px', color: '#595959', textTransform: 'capitalize' }}>
                {diaSemana}
              </Text>
            </div>

            {/* Horário */}
            <div style={{ marginBottom: '24px' }}>
              <Text style={{ display: 'block', fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>
                Horário
              </Text>
              <Text strong style={{ fontSize: '18px', color: '#262626' }}>
                {moment(agendamento.data_hora).format('HH:mm')}
              </Text>
            </div>

            {/* Duração */}
            <div>
              <Text style={{ display: 'block', fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>
                Duração
              </Text>
              <Text strong style={{ fontSize: '18px', color: '#262626' }}>
                {agendamento.duracao_minutos} min
              </Text>
            </div>
          </Card>
        </Col>

        {/* Coluna Direita - Tarefa, Observações e Anexos */}
        <Col xs={24} md={14}>
          {/* Card Tarefa de Casa */}
          {agendamento.tarefa_casa && (
            <Card
              style={{
                borderRadius: '12px',
                marginBottom: '24px',
                border:'none'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              <Title level={4} style={{ margin: 0, marginBottom: '12px', fontSize: '20px', fontWeight: '600', color: '#1a1d2e' }}>
                Tarefa de casa
              </Title>
              <Text style={{ fontSize: '14px', color: '#595959', whiteSpace: 'pre-line' }}>
                {agendamento.tarefa_casa}
              </Text>
            </Card>
          )}

          {/* Card Observações */}
          {agendamento.observacoes && (
            <Card
              style={{
                borderRadius: '12px',
                marginBottom: '24px',
                border: 'none'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              <Title level={4} style={{ margin: 0, marginBottom: '12px', fontSize: '18px', fontWeight: '600', color: '#1a1d2e' }}>
                Observações
              </Title>
              <Text style={{ fontSize: '14px', color: '#595959', whiteSpace: 'pre-line' }}>
                {agendamento.observacoes}
              </Text>
            </Card>
          )}

          {/* Card Anexos */}
          {(agendamento.anexos?.length > 0 || agendamento.num_anexos > 0) && (
            <Card
              style={{
                borderRadius: '12px',
                border: 'none'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              <Title level={4} style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#1a1d2e' }}>
                Anexos
              </Title>
              
              {/* Lista de anexos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {agendamento.anexos && agendamento.anexos.length > 0 ? (
                  agendamento.anexos.map((anexo, index) => (
                    <a
                      key={index}
                      href={anexo.url || anexo.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        transition: 'background 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#e8e8e8'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    >
                      <PaperClipOutlined style={{ fontSize: '18px', color: '#595959' }} />
                      <div style={{ flex: 1 }}>
                        <Text style={{ display: 'block', fontSize: '14px', color: '#262626' }}>
                          {anexo.nome || anexo.filename || `Anexo ${index + 1}`}
                        </Text>
                      </div>
                      {anexo.tamanho && (
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          {anexo.tamanho}
                        </Text>
                      )}
                    </a>
                  ))
                ) : (
                  <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                    {agendamento.num_anexos || 0} anexo(s) disponível(is)
                  </Text>
                )}
              </div>
            </Card>
          )}
          
          {/* Mensagem quando não há dados adicionais */}
          {!agendamento.tarefa_casa && !agendamento.observacoes && !(agendamento.anexos?.length > 0 || agendamento.num_anexos > 0) && (
            <Card
              style={{
                borderRadius: '12px',
                border: 'none',
                textAlign: 'center'
              }}
              bodyStyle={{ padding: '48px 32px' }}
            >
              <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                Nenhuma informação adicional disponível para este agendamento.
              </Text>
            </Card>
          )}
        </Col>
      </Row>

      {/* Botão Adicionar à Agenda - Fixo no rodapé (apenas se evento não passou) */}
      {!eventoPassou && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          background: 'white',
          borderTop: '1px solid #f0f0f0',
          zIndex: 1000
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Button
              type="primary"
              size="large"
              icon={<CalendarOutlined />}
              onClick={addToCalendar}
              block
              style={{
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              Adicionar à Minha Agenda
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalhesAgendamento;
