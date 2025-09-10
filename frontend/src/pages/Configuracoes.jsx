import React from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  TimePicker, 
  Switch, 
  Button, 
  Typography, 
  Row, 
  Col,
  InputNumber,
  message 
} from 'antd';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const Configuracoes = ({ user }) => {
  const [form] = Form.useForm();

  const handleSave = (values) => {
    console.log('Configurações salvas:', values);
    message.success('Configurações salvas com sucesso!');
  };

  const configuracoesPadrao = {
    horarioInicio: moment('09:00', 'HH:mm'),
    horarioFim: moment('18:00', 'HH:mm'),
    duracaoSessao: 60,
    duracaoAvaliacao: 90,
    duracaoFollowUp: 30,
    intervaloPadrao: 15,
    notificacoesEmail: true,
    notificacoesWhatsApp: false,
    lembreteAntecedencia: 24,
    valorSessao: 150,
    valorAvaliacao: 200,
    valorFollowUp: 80,
  };

  return (
    <div>
      <Title level={2}>Configurações do Sistema</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Horários de Funcionamento" style={{ marginBottom: 16 }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={configuracoesPadrao}
              onFinish={handleSave}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="horarioInicio"
                    label="Horário de Início"
                  >
                    <TimePicker 
                      format="HH:mm" 
                      style={{ width: '100%' }}
                      placeholder="Selecione o horário"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="horarioFim"
                    label="Horário de Fim"
                  >
                    <TimePicker 
                      format="HH:mm" 
                      style={{ width: '100%' }}
                      placeholder="Selecione o horário"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="intervaloPadrao"
                label="Intervalo entre Sessões (minutos)"
              >
                <InputNumber
                  min={0}
                  max={120}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Form>
          </Card>

          <Card title="Durações Padrão" style={{ marginBottom: 16 }}>
            <Form.Item
              name="duracaoSessao"
              label="Sessão de Coaching (minutos)"
            >
              <InputNumber
                min={15}
                max={180}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="duracaoAvaliacao"
              label="Avaliação (minutos)"
            >
              <InputNumber
                min={30}
                max={240}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="duracaoFollowUp"
              label="Follow-up (minutos)"
            >
              <InputNumber
                min={15}
                max={120}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Notificações" style={{ marginBottom: 16 }}>
            <Form.Item
              name="notificacoesEmail"
              label="Notificações por Email"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="notificacoesWhatsApp"
              label="Notificações por WhatsApp"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="lembreteAntecedencia"
              label="Lembrete com Antecedência (horas)"
            >
              <Select style={{ width: '100%' }}>
                <Option value={1}>1 hora</Option>
                <Option value={2}>2 horas</Option>
                <Option value={6}>6 horas</Option>
                <Option value={12}>12 horas</Option>
                <Option value={24}>24 horas</Option>
                <Option value={48}>48 horas</Option>
              </Select>
            </Form.Item>
          </Card>

          <Card title="Valores das Sessões" style={{ marginBottom: 16 }}>
            <Form.Item
              name="valorSessao"
              label="Valor - Sessão de Coaching (R$)"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/R\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              name="valorAvaliacao"
              label="Valor - Avaliação (R$)"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/R\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              name="valorFollowUp"
              label="Valor - Follow-up (R$)"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/R\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Card>
        </Col>
      </Row>

      <Card>
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" size="large">
            Salvar Configurações
          </Button>
        </Form.Item>
      </Card>
    </div>
  );
};

export default Configuracoes;
