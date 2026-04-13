
import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';

export default function MinhasComprasPage() {
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
      <h2 style={{ fontSize: 28, marginBottom: 24 }}>🧾 Minhas Compras</h2>
      {loading ? (
        <div>Carregando...</div>
      ) : !localStorage.getItem('token') || compras === null ? (
        <div style={{padding:40}}>Faça login para ver seu histórico de compras.</div>
      ) : Array.isArray(compras) && compras.length === 0 ? (
        <div>Nenhuma compra realizada ainda.</div>
      ) : Array.isArray(compras) ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {compras.map((compra) => (
            <li key={compra.id} style={{ marginBottom: 18, padding: 18, border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb' }}>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{compra.produto?.icone || '🧪'} {compra.produto?.nome}</div>
              <div style={{ color: '#6366f1', fontSize: 15, margin: '6px 0' }}>Status: <b>{compra.status}</b></div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Valor: R$ {parseFloat(compra.valor).toFixed(2)}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Data: {new Date(compra.criado_em).toLocaleString('pt-BR')}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Método: {compra.metodo_pagamento}</div>
              {compra.status === 'pendente' && compra.payment_url && (
                <a href={compra.payment_url} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'underline', fontWeight: 500, marginTop: 8, display: 'inline-block' }}>Pagar agora</a>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
