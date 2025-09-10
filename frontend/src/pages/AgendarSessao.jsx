import React, { useState } from 'react';
import { 
  Card, 
  Calendar, 
  Form, 
  Input, 
  Select, 
  Button, 
  Typography, 
  Row, 
  Col,
  TimePicker,
  message 
} from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AgendarSessao = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [form] = Form.useForm();

  const horariosDisponiveis = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const tiposSessao = [
    { value: 'coaching', label: 'Sessão de Coaching' },
    { value: 'avaliacao', label: 'Avaliação de Carreira' },
    { value: 'follow_up', label: 'Follow-up' }
  ];

  const onDateSelect = (date) => {
    setSelectedDate(date);
    form.setFieldsValue({ data: date });
  };

  const handleSubmit = (values) => {
    console.log('Agendamento solicitado:', {
      ...values,
      cliente_id: user?.id,
      data: selectedDate?.format('YYYY-MM-DD'),
      horario: values.horario
    });
    
    message.success('Solicitação de agendamento enviada! Aguarde confirmação.');
    form.resetFields();
    setSelectedDate(null);
  };

  const dateCellRender = (date) => {
    const today = moment();
    if (date.isBefore(today, 'day')) {
      return null;
    }
    
    // Simular disponibilidade (em um sistema real, viria da API)
    const isAvailable = date.day() !== 0 && date.day() !== 6; // Não é domingo ou sábado
    
    if (isAvailable) {
      return (
        <div style={{ 
          background: selectedDate?.isSame(date, 'day') ? '#1890ff' : '#f0f0f0',
          color: selectedDate?.isSame(date, 'day') ? 'white' : 'black',
          borderRadius: '4px',
          padding: '2px 4px',
          fontSize: '10px',
          textAlign: 'center'
        }}>
          Disponível
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <Title level={2}>
        <CalendarOutlined /> Agendar Nova Sessão
      </Title>
      <p>Selecione uma data disponível e preencha os detalhes da sessão.</p>
      
      <Row gutter={24}>
        <Col span={14}>
          <Card title="Selecione uma Data">
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={onDateSelect}
              disabledDate={(date) => date.isBefore(moment(), 'day')}
            />
          </Card>
        </Col>
        
        <Col span={10}>
          <Card title="Detalhes da Sessão">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="tipo"
                label="Tipo de Sessão"
                rules={[{ required: true, message: 'Selecione o tipo de sessão' }]}
              >
                <Select placeholder="Escolha o tipo de sessão">
                  {tiposSessao.map(tipo => (
                    <Option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="horario"
                label="Horário Preferido"
                rules={[{ required: true, message: 'Selecione um horário' }]}
              >
                <Select placeholder="Escolha um horário">
                  {horariosDisponiveis.map(horario => (
                    <Option key={horario} value={horario}>
                      {horario}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="objetivo"
                label="Objetivo da Sessão"
                rules={[{ required: true, message: 'Descreva o objetivo da sessão' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Descreva brevemente o que você gostaria de trabalhar nesta sessão..."
                />
              </Form.Item>

              <Form.Item
                name="observacoes"
                label="Observações Adicionais"
              >
                <TextArea
                  rows={3}
                  placeholder="Alguma informação adicional que gostaria de compartilhar..."
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block
                  disabled={!selectedDate}
                >
                  Solicitar Agendamento
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AgendarSessao;
