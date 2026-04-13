'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Button,
  Rate,
  DatePicker,
  Select,
  Upload,
  message,
  Space,
  Divider,
  Row,
  Col,
  Descriptions,
  Tag,
  Spin,
  Typography
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import AdminLayout from '@/components/AdminLayout';
import apiService from '@/services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import type { UploadFile } from 'antd/es/upload/interface';

dayjs.locale('pt-br');

const { TextArea } = Input;
const { Title, Text } = Typography;

interface Agendamento {
  id: number;
  usuario_id: number;
  titulo: string;
  descricao?: string;
  data_hora: string;
  duracao_minutos: number;
  status: string;
  tipo: string;
  usuario?: {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
  };
  resumo_sessao?: string;
  objetivos_alcancados?: string;
  proximos_passos?: string;
  observacoes_profissional?: string;
  avaliacao_progresso?: number;
  pontos_positivos?: string;
  pontos_atencao?: string;
  recomendacoes?: string;
  proxima_sessao_sugerida?: string;
  anexos?: string;
  visivel_cliente?: boolean;
}

export default function SessaoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [inicioSessao] = useState(dayjs());

  useEffect(() => {
    if (id) {
      loadAgendamento();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAgendamento = async () => {
    try {
      setLoadingData(true);
      const data = await apiService.getAgendamento(parseInt(id));
      setAgendamento(data);
      
      // Preencher form com dados existentes se houver
      if (data.resumo_sessao) {
        form.setFieldsValue({
          resumo_sessao: data.resumo_sessao,
          objetivos_alcancados: data.objetivos_alcancados,
          proximos_passos: data.proximos_passos,
          observacoes_profissional: data.observacoes_profissional,
          avaliacao_progresso: data.avaliacao_progresso || 3,
          pontos_positivos: data.pontos_positivos,
          pontos_atencao: data.pontos_atencao,
          recomendacoes: data.recomendacoes,
          proxima_sessao_sugerida: data.proxima_sessao_sugerida ? dayjs(data.proxima_sessao_sugerida) : null,
          visivel_cliente: data.visivel_cliente !== undefined ? data.visivel_cliente : true
        });
      } else {
        // Valores padrão para nova sessão
        form.setFieldsValue({
          avaliacao_progresso: 3,
          visivel_cliente: true
        });
      }

      // Carregar anexos existentes se houver
      if (data.anexos) {
        try {
          const anexos = JSON.parse(data.anexos);
          setFileList(anexos.map((url: string, index: number) => ({
            uid: `${index}`,
            name: url.split('/').pop() || `arquivo-${index}`,
            status: 'done',
            url: url
          })));
        } catch (e) {
          console.error('Erro ao parsear anexos:', e);
        }
      }
    } catch (error) {
      message.error('Erro ao carregar agendamento');
      console.error(error);
      router.push('/agendamentos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      console.log('📤 Iniciando upload do arquivo:', file.name, file.size, 'bytes');
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('⏳ Enviando para API...');
      const response = await apiService.uploadFile(formData);
      console.log('✅ Upload concluído. URL:', response.url);
      return response.url;
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      message.error('Erro ao fazer upload do arquivo');
      throw error;
    }
  };

  const handleSalvar = async (concluir = false) => {
    try {
      console.log('🔄 Iniciando salvamento...', { concluir });
      const values = await form.validateFields();
      console.log('✅ Validação OK, valores:', values);
      setLoading(true);

      // Upload de arquivos se houver novos
      const anexosUrls: string[] = [];
      console.log('📎 Processando arquivos:', fileList.length);
      
      for (const file of fileList) {
        if (file.url) {
          console.log('  ✓ Arquivo já tem URL:', file.url);
          anexosUrls.push(file.url);
        } else if (file.originFileObj) {
          console.log('  ⬆️ Fazendo upload de:', file.name);
          const url = await handleUpload(file.originFileObj);
          console.log('  ✅ Upload concluído:', url);
          anexosUrls.push(url);
        }
      }

      const agendamentoData = {
        resumo_sessao: values.resumo_sessao,
        objetivos_alcancados: values.objetivos_alcancados,
        proximos_passos: values.proximos_passos,
        observacoes_profissional: values.observacoes_profissional,
        avaliacao_progresso: values.avaliacao_progresso,
        pontos_positivos: values.pontos_positivos,
        pontos_atencao: values.pontos_atencao,
        recomendacoes: values.recomendacoes,
        proxima_sessao_sugerida: values.proxima_sessao_sugerida ? values.proxima_sessao_sugerida.toISOString() : null,
        anexos: anexosUrls.length > 0 ? JSON.stringify(anexosUrls) : null,
        visivel_cliente: values.visivel_cliente,
        ...(concluir && { status: 'concluido' })
      };

      console.log('📤 Enviando dados para API:', agendamentoData);
      const response = await apiService.updateAgendamento(parseInt(id), agendamentoData);
      console.log('✅ Resposta da API:', response);
      
      // Se concluiu E tem próxima sessão sugerida, criar novo agendamento
      if (concluir && values.proxima_sessao_sugerida && agendamento) {
        try {
          console.log('📅 Criando novo agendamento para próxima sessão...');
          const novoAgendamento = {
            usuario_id: agendamento.usuario_id,
            titulo: `Sessão de Acompanhamento - ${agendamento.usuario?.nome || 'Cliente'}`,
            descricao: 'Sessão de acompanhamento agendada automaticamente',
            data_hora: values.proxima_sessao_sugerida.toISOString(),
            duracao_minutos: agendamento.duracao_minutos || 60,
            status: 'agendado',
            tipo: agendamento.tipo || 'sessao'
          };
          
          await apiService.createAgendamento(novoAgendamento);
          console.log('✅ Novo agendamento criado com sucesso!');
          message.success('Sessão concluída e próximo agendamento criado!');
        } catch (error) {
          console.error('❌ Erro ao criar novo agendamento:', error);
          message.warning('Sessão concluída, mas houve erro ao criar o próximo agendamento');
        }
      } else {
        message.success(concluir ? 'Sessão concluída com sucesso!' : 'Relatório salvo com sucesso!');
      }
      
      if (concluir) {
        router.push('/agendamentos');
      } else {
        await loadAgendamento();
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      if (error instanceof Error) {
        if (error.message === 'Validation failed') {
          message.error('Preencha todos os campos obrigatórios');
        } else {
          message.error(`Erro ao salvar: ${error.message}`);
        }
      } else {
        message.error('Erro ao salvar relatório');
      }
    } finally {
      setLoading(false);
    }
  };

  const getDuracaoSessao = () => {
    const agora = dayjs();
    const diff = agora.diff(inicioSessao, 'minute');
    return diff;
  };

  if (loadingData) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  if (!agendamento) {
    return null;
  }

  const statusColors = {
    pendente: 'orange',
    agendado: 'blue',
    confirmado: 'green',
    concluido: 'cyan',
    cancelado: 'red'
  };

  return (
    <AdminLayout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/agendamentos')}
          style={{ marginBottom: '16px' }}
        >
          Voltar para Agendamentos
        </Button>

        <Card style={{ marginBottom: '24px' }}>
          <Title level={3}>
            <CalendarOutlined /> Sessão em Andamento
          </Title>
          
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Cliente" span={2}>
              <Space>
                <UserOutlined />
                <Text strong>{agendamento.usuario?.nome || 'N/A'}</Text>
                {agendamento.usuario?.email && (
                  <Text type="secondary">({agendamento.usuario.email})</Text>
                )}
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Título">
              {agendamento.titulo}
            </Descriptions.Item>
            
            <Descriptions.Item label="Status">
              <Tag color={statusColors[agendamento.status as keyof typeof statusColors]}>
                {agendamento.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Data e Hora">
              <Space>
                <CalendarOutlined />
                {dayjs(agendamento.data_hora).format('DD/MM/YYYY HH:mm')}
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Duração Prevista">
              <Space>
                <ClockCircleOutlined />
                {agendamento.duracao_minutos} minutos
              </Space>
            </Descriptions.Item>

            {agendamento.descricao && (
              <Descriptions.Item label="Descrição" span={2}>
                {agendamento.descricao}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card title="Relatório da Sessão">
          <Form
            form={form}
            layout="vertical"
            onFinish={() => handleSalvar(false)}
          >
            <Divider orientation="left">Resumo da Sessão</Divider>
            
            <Form.Item
              name="resumo_sessao"
              label="Resumo da Sessão"
              rules={[{ required: true, message: 'Informe o resumo da sessão' }]}
            >
              <TextArea
                rows={5}
                placeholder="Descreva o que foi discutido e trabalhado durante a sessão..."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="objetivos_alcancados"
                  label="Objetivos Alcançados"
                >
                  <TextArea
                    rows={4}
                    placeholder="Quais objetivos foram alcançados nesta sessão?"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="proximos_passos"
                  label="Próximos Passos"
                >
                  <TextArea
                    rows={4}
                    placeholder="Quais são os próximos passos para o cliente?"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Avaliação e Observações</Divider>

            <Form.Item
              name="avaliacao_progresso"
              label="Avaliação do Progresso do Cliente"
            >
              <Rate count={5} style={{ fontSize: 36 }} />
            </Form.Item>

            <Form.Item
              name="observacoes_profissional"
              label="Observações do Profissional (Uso Interno)"
              tooltip="Estas observações não serão visíveis para o cliente"
            >
              <TextArea
                rows={4}
                placeholder="Observações internas sobre o cliente, percepções, notas técnicas..."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="pontos_positivos"
                  label="Pontos Positivos"
                >
                  <TextArea
                    rows={4}
                    placeholder="Aspectos positivos observados durante a sessão..."
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="pontos_atencao"
                  label="Pontos de Atenção"
                >
                  <TextArea
                    rows={4}
                    placeholder="Aspectos que requerem atenção especial..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Recomendações e Próxima Sessão</Divider>

            <Form.Item
              name="recomendacoes"
              label="Recomendações"
            >
              <TextArea
                rows={4}
                placeholder="Recomendações para o cliente seguir até a próxima sessão..."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="proxima_sessao_sugerida"
                  label="Próxima Sessão Sugerida"
                >
                  <DatePicker
                    showTime={{ format: 'HH:mm' }}
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Selecione data e hora"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="visivel_cliente"
                  label="Visibilidade do Relatório"
                  initialValue={true}
                >
                  <Select style={{ width: '100%' }}>
                    <Select.Option value={true}>
                      ✓ Visível para o cliente
                    </Select.Option>
                    <Select.Option value={false}>
                      🔒 Apenas para uso profissional
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Anexos</Divider>

            <Form.Item
              label="Arquivos Anexos"
              tooltip="Anexe documentos, imagens ou outros arquivos relevantes"
            >
              <Upload
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                multiple
              >
                <Button icon={<UploadOutlined />}>
                  Selecionar Arquivos
                </Button>
              </Upload>
            </Form.Item>

            <Divider />

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <Text type="secondary">
                    Tempo de sessão: {getDuracaoSessao()} minutos
                  </Text>
                </Space>
                <Space>
                  <Button
                    onClick={() => router.push('/agendamentos')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="default"
                    icon={<SaveOutlined />}
                    onClick={() => handleSalvar(false)}
                    loading={loading}
                  >
                    Salvar Rascunho
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleSalvar(true)}
                    loading={loading}
                  >
                    Finalizar e Concluir Sessão
                  </Button>
                </Space>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
}
