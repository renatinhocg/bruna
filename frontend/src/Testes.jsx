import React, { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Tag, Progress, message, Modal } from 'antd';
import { FileTextOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Testes({ user }) {
  const [testes, setTestes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchTestes();
  }, []);

  const fetchTestes = async () => {
    try {
      // Simular chamada para API
      const mockTestes = [
        {
          id: 1,
          titulo: 'Teste de Personalidade Myers-Briggs',
          descricao: 'Descubra seu tipo de personalidade e como isso influencia sua carreira',
          perguntas: 60,
          tempoEstimado: '30 min',
          status: 'disponivel'
        },
        {
          id: 2,
          titulo: 'Avaliação de Competências Profissionais',
          descricao: 'Identifique suas principais habilidades e áreas de desenvolvimento',
          perguntas: 45,
          tempoEstimado: '25 min',
          status: 'concluido'
        },
        {
          id: 3,
          titulo: 'Teste de Valores e Motivações',
          descricao: 'Entenda o que realmente importa para você na sua carreira',
          perguntas: 35,
          tempoEstimado: '20 min',
          status: 'em_andamento'
        }
      ];
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
    setSelectedTest(teste);
    setModalVisible(true);
  };

  const handleConfirmStart = () => {
    message.success(`Iniciando teste: ${selectedTest.titulo}`);
    setModalVisible(false);
    // Aqui seria redirecionado para a página do teste
  };

  return (
    <div>
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
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleStartTest(teste)}
                  disabled={teste.status === 'concluido'}
                >
                  {teste.status === 'concluido' ? 'Ver Resultados' :
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

      <Modal
        title="Confirmar Início do Teste"
        open={modalVisible}
        onOk={handleConfirmStart}
        onCancel={() => setModalVisible(false)}
        okText="Iniciar Teste"
        cancelText="Cancelar"
      >
        {selectedTest && (
          <div>
            <p><strong>Teste:</strong> {selectedTest.titulo}</p>
            <p><strong>Tempo estimado:</strong> {selectedTest.tempoEstimado}</p>
            <p><strong>Número de perguntas:</strong> {selectedTest.perguntas}</p>
            <p style={{ marginTop: '16px', color: '#666' }}>
              Certifique-se de ter tempo suficiente para completar o teste sem interrupções.
              Você pode salvar o progresso e continuar depois.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Testes;