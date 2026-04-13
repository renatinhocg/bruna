import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Space } from 'antd';

const JitsiMeet = ({ roomName, displayName, onClose, visible }) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApi = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && roomName) {
      setLoading(true);
      
      // Verificar se o script já foi carregado
      if (window.JitsiMeetExternalAPI) {
        initializeJitsi();
      } else {
        // Carregar script do Jitsi
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => {
          console.log('Jitsi script carregado');
          initializeJitsi();
        };
        script.onerror = () => {
          console.error('Erro ao carregar Jitsi');
          setLoading(false);
        };
        document.body.appendChild(script);
      }
    }

    return () => {
      if (jitsiApi.current) {
        jitsiApi.current.dispose();
        jitsiApi.current = null;
      }
    };
  }, [visible, roomName]);

  const initializeJitsi = () => {
    if (!window.JitsiMeetExternalAPI) {
      console.error('JitsiMeetExternalAPI não está disponível');
      setLoading(false);
      return;
    }

    if (jitsiApi.current) {
      console.log('Jitsi já inicializado');
      return;
    }

    if (!jitsiContainerRef.current) {
      console.error('Container ref não está disponível');
      setTimeout(initializeJitsi, 100);
      return;
    }

    try {
      console.log('Inicializando Jitsi com roomName:', roomName);
      
      const domain = 'meet.jit.si';
      const options = {
        roomName: `BMConsultoria_${roomName}`,
        width: '100%',
        height: 600,
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
          requireDisplayName: false,
          enableNoisyMicDetection: false,
          disableModeratorIndicator: false,
          enableLobbyChat: false,
          startSilent: false,
          enableClosePage: false,
          hideConferenceSubject: false,
          subject: 'BM Consultoria - Sessão',
          startAudioOnly: false,
          disableInviteFunctions: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'hangup', 'chat', 'tileview', 'raisehand'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: '#1C2541',
          DISABLE_VIDEO_BACKGROUND: false,
          TOOLBAR_ALWAYS_VISIBLE: true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        },
        userInfo: {
          displayName: displayName || 'Participante'
        }
      };

      jitsiApi.current = new window.JitsiMeetExternalAPI(domain, options);
      setLoading(false);

      // Event listeners
      jitsiApi.current.addEventListener('videoConferenceJoined', () => {
        console.log('Entrou na conferência');
      });

      jitsiApi.current.addEventListener('videoConferenceLeft', () => {
        console.log('Saiu da conferência');
        handleClose();
      });

      jitsiApi.current.addEventListener('readyToClose', () => {
        handleClose();
      });
    } catch (error) {
      console.error('Erro ao inicializar Jitsi:', error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (jitsiApi.current) {
      jitsiApi.current.dispose();
      jitsiApi.current = null;
    }
    if (onClose) {
      onClose();
    }
  };

  // Gerar link do Google Meet (você precisará criar o link no Google Calendar)
  // Por enquanto, usar Jitsi em nova aba como solução gratuita
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
        </Space>
      </div>
    </Modal>
  );
};

export default JitsiMeet;
