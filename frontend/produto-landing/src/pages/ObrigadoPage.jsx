import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ObrigadoPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(102,126,234,0.08)', padding: 40, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
        <h2 style={{ fontSize: 28, marginBottom: 12, color: '#10b981' }}>Pagamento Recebido!</h2>
        <p style={{ color: '#374151', fontSize: 18, marginBottom: 24 }}>
          Obrigado por sua compra.<br />
          Seu pedido foi registrado com sucesso.<br />
          <b>Assim que o pagamento for confirmado, seus testes serão liberados.</b>
        </p>
        <div style={{ background: '#f0fdf4', color: '#166534', borderRadius: 8, padding: 16, marginBottom: 24, fontSize: 15 }}>
          Você receberá um e-mail assim que o acesso estiver disponível.<br />
          Caso tenha dúvidas, entre em contato pelo WhatsApp.
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '14px 32px',
            fontSize: 18,
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: 8
          }}
        >
          Ir para página inicial
        </button>
        <br />
        <button
          onClick={() => navigate('/meus-testes')}
          style={{
            background: 'none',
            color: '#6366f1',
            border: 'none',
            fontSize: 16,
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          Acessar meus testes
        </button>
      </div>
    </div>
  );
}
