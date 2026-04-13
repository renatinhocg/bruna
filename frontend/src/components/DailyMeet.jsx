import React, { useEffect, useRef } from 'react';
import { Modal } from 'antd';

const DailyMeet = ({ roomName, displayName, onClose, visible }) => {
  const callFrameRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (visible && roomName) {
      // Abrir em nova janela
      window.open(`/cliente/videochamada/${roomName}`, '_blank', 'width=1400,height=900');
      onClose();
    }
  }, [visible, roomName, onClose]);

  useEffect(() => {
    if (!visible || !roomName) return;

    const loadDailyScript = async () => {
      if (window.DailyIframe) {
        initializeDaily();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@daily-co/daily-js';
      script.onload = () => initializeDaily();
      document.head.appendChild(script);
    };

    const initializeDaily = async () => {
      if (!containerRef.current || callFrameRef.current) return;

      try {
        const API_KEY = '43892317a582a18fd168944818ab88aa444955b8a93173032e112a66d403e8f6';
        const sanitizedRoomName = `bmc-${roomName.replace(/_/g, '-')}`;
        
        // Tentar criar a sala
        const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            name: sanitizedRoomName,
            privacy: 'public',
            properties: {
              enable_chat: true,
              enable_screenshare: true,
              start_video_off: false,
              start_audio_off: false,
            },
          }),
        });

        let roomData;
        if (roomResponse.ok) {
          roomData = await roomResponse.json();
        } else if (roomResponse.status === 400) {
          // Sala já existe, buscar
          const getRoomResponse = await fetch(`https://api.daily.co/v1/rooms/${sanitizedRoomName}`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` },
          });
          
          if (getRoomResponse.ok) {
            roomData = await getRoomResponse.json();
          } else {
            throw new Error('Erro ao buscar sala');
          }
        } else {
          throw new Error('Erro ao criar sala');
        }

        const roomUrl = roomData.url;
        
        callFrameRef.current = window.DailyIframe.createFrame(containerRef.current, {
          iframeStyle: {
            width: '100%',
            height: '600px',
            border: 'none',
          },
          showLeaveButton: true,
          showFullscreenButton: true,
        });

        callFrameRef.current.join({
          url: roomUrl,
          userName: displayName,
        });

        callFrameRef.current.on('left-meeting', () => {
          onClose();
        });
      } catch (error) {
        console.error('Erro Daily.co:', error);
        alert('Erro ao iniciar videochamada. Verifique sua conexão e tente novamente.');
        onClose();
      }
    };

    loadDailyScript();

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
    };
  }, [visible, roomName, displayName, onClose]);

  return (
    <Modal
      title="Videochamada"
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
      destroyOnClose
    >
      <div
        ref={containerRef}
        style={{
          height: '100%',
          width: '100%',
          minHeight: '600px',
        }}
      />
    </Modal>
  );
};

export default DailyMeet;
