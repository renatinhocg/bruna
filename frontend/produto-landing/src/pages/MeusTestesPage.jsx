
import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';

export default function MeusTestesPage() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setCompras(null);
      return;
    }
    fetch(`${API_BASE_URL}/compras/minhas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => setCompras(data))
      .catch(() => setCompras(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', background: 'white', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 32 }}>
      <h2 style={{ fontSize: 28, marginBottom: 24 }}>🧪 Meus Testes</h2>
      {loading ? (
        <div>Carregando...</div>
      ) : !localStorage.getItem('token') || compras === null ? (
        <div style={{padding:40}}>Faça login para ver seus testes.</div>
      ) : Array.isArray(compras) && compras.length === 0 ? (
        <div>Nenhum teste comprado ainda.</div>
      ) : Array.isArray(compras) ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {compras.map((compra) => (
            <li key={compra.id} style={{ marginBottom: 18, padding: 18, border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb' }}>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{compra.produto?.icone || '🧪'} {compra.produto?.nome}</div>
              <div style={{ color: '#6366f1', fontSize: 15, margin: '6px 0' }}>Status: <b>{compra.status}</b></div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Valor: R$ {parseFloat(compra.valor).toFixed(2)}</div>
              {compra.status === 'pago' ? (
                <div style={{ marginTop: 8, color: '#10b981', fontWeight: 500 }}>Liberado ✔</div>
              ) : (
                <div style={{ marginTop: 8, color: '#f59e42', fontWeight: 500 }}>Aguardando pagamento/aprovação</div>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
