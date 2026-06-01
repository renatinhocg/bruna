'use client';

import React from 'react';
import { Form, Input, Select, Button, Space, Upload, Avatar } from 'antd';
import { BankOutlined, UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

type EmpresaFormProps = {
    form: any;
    loading: boolean;
    logoPreview: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    onLogoChange: (info: any) => void;
    onRemoveLogo: () => void;
    submitLabel: string;
};

export default function EmpresaForm({
    form,
    loading,
    logoPreview,
    onSubmit,
    onCancel,
    onLogoChange,
    onRemoveLogo,
    submitLabel
}: EmpresaFormProps) {
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            size="large"
            initialValues={{ status: 'ACTIVE' }}
        >
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar
                    shape="square"
                    size={80}
                    src={logoPreview}
                    icon={!logoPreview && <BankOutlined />}
                    style={{ backgroundColor: '#f0f2f5', color: '#8c8c8c' }}
                />
                <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={onLogoChange}
                    accept="image/*"
                >
                    <Button icon={<UploadOutlined />}>Selecionar Logo</Button>
                </Upload>
                {logoPreview && (
                    <Button type="link" danger onClick={onRemoveLogo}>
                        Remover
                    </Button>
                )}
            </div>

            <Form.Item
                label="Nome da Empresa"
                name="name"
                rules={[{ required: true, message: 'O nome e obrigatorio' }]}
            >
                <Input placeholder="Ex: Tech Solutions Ltda" />
            </Form.Item>

            <Form.Item
                label="CNPJ"
                name="cnpj"
            >
                <Input placeholder="00.000.000/0000-00" />
            </Form.Item>

            <Form.Item
                label="Descricao"
                name="description"
            >
                <TextArea rows={4} placeholder="Breve descricao da empresa" />
            </Form.Item>

            <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true }]}
            >
                <Select>
                    <Option value="ACTIVE">Ativa</Option>
                    <Option value="INACTIVE">Inativa</Option>
                </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                    <Button onClick={onCancel}>Cancelar</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {submitLabel}
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}
