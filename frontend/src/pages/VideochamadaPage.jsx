import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function VideochamadaPage() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const callFrameRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!roomName) return;

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
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        callFrameRef.current = window.DailyIframe.createFrame(containerRef.current, {
          iframeStyle: {
            width: '100%',
            height: '100vh',
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
          },
          showLeaveButton: true,
          showFullscreenButton: true,
        });

        callFrameRef.current.join({
          url: roomUrl,
          userName: user.nome || 'Cliente',
        });

        callFrameRef.current.on('left-meeting', () => {
          navigate('/meus-agendamentos');
        });
      } catch (error) {
        console.error('Erro Daily.co:', error);
        alert('Erro ao iniciar videochamada.');
        navigate('/meus-agendamentos');
      }
    };

    loadDailyScript();

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
    };
  }, [roomName, navigate]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/meus-agendamentos')}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
        }}
      >
        Voltar
      </Button>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
