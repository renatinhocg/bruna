/*
  =========================
  LOJA DESABILITADA TEMPORARIAMENTE
  =========================
*/

import React, { useState, useEffect } from 'react';
// import { useCart } from '../context/CartContext';
import API_BASE_URL from '../config/api';

function ShopSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // const { addToCart } = useCart();

  useEffect(() => {
    // Buscar produtos da API
  fetch(`${API_BASE_URL}/produtos?ativo=true`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar produtos:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section id="loja" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>Carregando produtos...</p>
      </section>
    );
  }

  return (
    <section id="loja" style={{
      padding: '80px 20px',
      background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🛍️ Loja de Testes Psicológicos
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Descubra seu perfil profissional com nossos testes cientificamente validados
          </p>
        </div>

        {/* Grid de Produtos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                background: product.destaque 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'white',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: product.destaque
                  ? '0 10px 40px rgba(102, 126, 234, 0.3)'
                  : '0 4px 20px rgba(0, 0, 0, 0.08)',
                position: 'relative',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
                border: product.destaque ? 'none' : '1px solid #e5e7eb',
                color: product.destaque ? 'white' : '#141B34'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = product.destaque
                  ? '0 15px 50px rgba(102, 126, 234, 0.4)'
                  : '0 8px 30px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = product.destaque
                  ? '0 10px 40px rgba(102, 126, 234, 0.3)'
                  : '0 4px 20px rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* Badge */}
              {product.destaque && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '20px',
                  background: '#fbbf24',
                  color: '#78350f',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
                }}>
                  ⭐ MAIS COMPLETO
                </div>
              )}

              {/* Ícone */}
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {product.icone}
              </div>

              {/* Título */}
              <h3 style={{
                fontSize: '22px',
                fontWeight: 'bold',
                marginBottom: '16px',
                textAlign: 'center',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {product.nome}
              </h3>

              {/* Preço */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                {product.preco_original && (
                  <div style={{
                    fontSize: '16px',
                    textDecoration: 'line-through',
                    opacity: 0.7,
                    marginBottom: '4px'
                  }}>
                    R$ {parseFloat(product.preco_original).toFixed(2)}
                  </div>
                )}
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: product.destaque ? 'white' : '#10b981'
                }}>
                  R$ {parseFloat(product.preco).toFixed(2)}
                </div>
                {product.preco_original && (
                  <div style={{
                    fontSize: '14px',
                    marginTop: '4px',
                    opacity: 0.9
                  }}>
                    Economize R$ {(parseFloat(product.preco_original) - parseFloat(product.preco)).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Descrição */}
              <p style={{
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '20px',
                textAlign: 'center',
                opacity: product.destaque ? 0.95 : 0.8,
                minHeight: '80px'
              }}>
                {product.descricao}
              </p>

              {/* Features */}
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 24px 0'
              }}>
                {product.features?.map((feature, index) => (
                  <li
                    key={index}
                    style={{
                      fontSize: '14px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <span style={{
                      color: product.destaque ? '#fbbf24' : '#10b981',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      flexShrink: 0
                    }}>
                      ✓
                    </span>
                    <span style={{ flex: 1, opacity: product.destaque ? 0.95 : 0.9 }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Botão Adicionar ao Carrinho */}
              <button
                onClick={() => addToCart(product)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: product.destaque 
                    ? 'white' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: product.destaque ? '#667eea' : 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.stopPropagation();
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.stopPropagation();
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
              >
                🛒 Adicionar ao Carrinho
              </button>
            </div>
          ))}
        </div>

        {/* Garantia */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: '#141B34'
          }}>
            Compra 100% Segura
          </h3>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Pagamento processado com segurança pela <strong>Pagar.me/Stone</strong>.
            Seus dados estão protegidos e você receberá acesso imediato após a confirmação do pagamento.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ShopSection;
