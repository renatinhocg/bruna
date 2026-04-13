import React from 'react';
import { Button } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';


export default function GoogleAgendaButton() {
  const handleConnect = async () => {
    try {
  const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        alert('Você precisa estar logado para conectar o Google Agenda.');
        return;
      }
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
      const res = await fetch(`${apiUrl}/api/google/login`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao obter URL do Google.');
      }
    } catch {
      alert('Erro ao conectar Google Agenda.');
    }
  };
  return (
    <Button
      type="primary"
      icon={<GoogleOutlined />}
      onClick={handleConnect}
      style={{ background: '#4285F4', borderColor: '#4285F4' }}
    >
      Conectar Google Agenda
    </Button>
  );
}
