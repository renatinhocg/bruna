import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Tag, 
  Button, 
  Space,
  Modal,
  Descriptions,
  Row,
  Col 
} from 'antd';
import { 
  EyeOutlined, 
  CalendarOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

const MeusAgendamentos = ({ user }) => {
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);

  // Dados fictícios - em um sistema real viriam da API
  const agendamentos = [
    {
      key: '1',
      id: 1,
      data: '2024-12-15',
      horario: '14:00',
      tipo: 'Sessão de Coaching',
      status: 'confirmado',
      coach: 'Dr. João Silva',
      objetivo: 'Planejar transição de carreira',
      observacoes: 'Preparar currículo atualizado',
      link_reuniao: 'https://meet.google.com/abc-defg-hij'
    },
    {
      key: '2',
      id: 2,
      data: '2024-12-18',
      horario: '16:00',
      tipo: 'Follow-up',
      status: 'agendado',
      coach: 'Dr. João Silva',
      objetivo: 'Acompanhamento do progresso',
      observacoes: 'Revisar ações da sessão anterior'
    },
    {
      key: '3',
      id: 3,
      data: '2024-12-05',
      horario: '10:00',
      tipo: 'Avaliação',
      status: 'concluido',
      coach: 'Dr. João Silva',
      objetivo: 'Avaliação inicial de perfil',
      observacoes: 'Primeira sessão - conhecer o cliente'
    },
    {
      key: '4',
      id: 4,
      data: '2024-12-08',
      horario: '15:00',
      tipo: 'Sessão de Coaching',
      status: 'concluido',
      coach: 'Dr. João Silva',
      objetivo: 'Definir metas profissionais',
      observacoes: 'Trabalhar autoconhecimento'
    }
  ];

  const handleViewDetails = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setDetailsVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado': return 'green';
      case 'agendado': return 'blue';
      case 'concluido': return 'purple';
      case 'cancelado': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'agendado': return 'Aguardando Confirmação';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      sorter: (a, b) => new Date(a.data) - new Date(b.data),
      render: (data) => new Date(data).toLocaleDateString('pt-BR')
    },
    {
      title: 'Horário',
      dataIndex: 'horario',
      key: 'horario',
    },
    {
      title: 'Tipo de Sessão',
      dataIndex: 'tipo',
      key: 'tipo',
    },
    {
      title: 'Coach',
      dataIndex: 'coach',
      key: 'coach',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Confirmado', value: 'confirmado' },
        { text: 'Aguardando', value: 'agendado' },
        { text: 'Concluído', value: 'concluido' },
        { text: 'Cancelado', value: 'cancelado' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            Detalhes
          </Button>
          {record.status === 'confirmado' && record.link_reuniao && (
            <Button
              type="link"
              href={record.link_reuniao}
              target="_blank"
              size="small"
            >
              Entrar na Reunião
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const proximasSeSSoes = agendamentos.filter(a => 
    ['confirmado', 'agendado'].includes(a.status) && 
    new Date(a.data) >= new Date()
  );

  const sessoesPassadas = agendamentos.filter(a => 
    a.status === 'concluido' || 
    new Date(a.data) < new Date()
  );

  return (
    <div>
      <Title level={2}>
        <CalendarOutlined /> Meus Agendamentos
      </Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {proximasSeSSoes.length}
              </div>
              <div>Próximas Sessões</div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CalendarOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {sessoesPassadas.length}
              </div>
              <div>Sessões Realizadas</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Próximas Sessões" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={proximasSeSSoes}
          pagination={false}
          size="middle"
          locale={{ emptyText: 'Nenhuma sessão agendada' }}
        />
      </Card>

      <Card title="Histórico de Sessões">
        <Table
          columns={columns}
          dataSource={sessoesPassadas}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          size="middle"
          locale={{ emptyText: 'Nenhuma sessão realizada' }}
        />
      </Card>

      <Modal
        title="Detalhes da Sessão"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Fechar
          </Button>
        ]}
        width={600}
      >
        {selectedAgendamento && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Data">
              {new Date(selectedAgendamento.data).toLocaleDateString('pt-BR')}
            </Descriptions.Item>
            <Descriptions.Item label="Horário">
              {selectedAgendamento.horario}
            </Descriptions.Item>
            <Descriptions.Item label="Tipo de Sessão">
              {selectedAgendamento.tipo}
            </Descriptions.Item>
            <Descriptions.Item label="Coach">
              {selectedAgendamento.coach}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedAgendamento.status)}>
                {getStatusText(selectedAgendamento.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Objetivo">
              {selectedAgendamento.objetivo}
            </Descriptions.Item>
            <Descriptions.Item label="Observações">
              {selectedAgendamento.observacoes || 'Nenhuma observação'}
            </Descriptions.Item>
            {selectedAgendamento.link_reuniao && (
              <Descriptions.Item label="Link da Reunião">
                <a href={selectedAgendamento.link_reuniao} target="_blank" rel="noopener noreferrer">
                  Clique aqui para entrar na reunião
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MeusAgendamentos;
