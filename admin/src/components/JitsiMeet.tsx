"use client";

import React from 'react';
import { Modal, Button, Space } from 'antd';

interface JitsiMeetProps {
  roomName: string;
  displayName: string;
  onClose: () => void;
  visible: boolean;
}

const JitsiMeet: React.FC<JitsiMeetProps> = ({ roomName, onClose, visible }) => {
  // Gerar link do Jitsi Meet
  const meetUrl = `https://meet.jit.si/BMConsultoria_${roomName}`;

  return (
    <Modal
      title="Iniciar Videochamada"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', marginBottom: '24px' }}>
          A videochamada será aberta em uma nova janela.
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
          Link da sala: <strong>BMConsultoria_{roomName}</strong>
        </p>
        <Space size="large">
          <Button 
            type="primary" 
            size="large"
            onClick={() => {
              window.open(meetUrl, '_blank');
              onClose();
            }}
          >
            Abrir Videochamada
          </Button>
          <Button 
            size="large"
            onClick={() => {
              navigator.clipboard.writeText(meetUrl);
              Modal.success({
                content: 'Link copiado! Você pode enviar para o cliente via WhatsApp.',
              });
            }}
          >
            Copiar Link
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default JitsiMeet;
