
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import API_BASE_URL from '../config/api';

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, getTotal, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: Dados, 2: Pagamento, 3: Processando, 4: Sucesso
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [paymentData, setPaymentData] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: ''
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome || formData.nome.length < 3) {
      newErrors.nome = 'Nome completo é obrigatório';
    }
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail válido é obrigatório';
    }
    
    if (!formData.telefone || formData.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone válido é obrigatório';
    }
    
    if (!formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF válido é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setStep(3);

    try {
      // Criar pedido no backend
  const response = await fetch(`${API_BASE_URL}/compras/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          produtos: cart.map(p => p.id),
          total: getTotal(),
          metodo_pagamento: paymentMethod,
          cliente: formData
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao processar pagamento');
      }

      const data = await response.json();
      setPaymentData(data);
      setStep(4);
      
      // Limpar carrinho após sucesso
      // clearCart(); // Comentado para manter carrinho até confirmação de pagamento

    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease'
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 1001,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            {step === 1 && '📝 Seus Dados'}
            {step === 2 && '💳 Forma de Pagamento'}
            {step === 3 && '⏳ Processando...'}
            {step === 4 && '✅ Pedido Confirmado!'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              lineHeight: 1,
              opacity: loading ? 0.5 : 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {/* Step 1: Dados do Cliente */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#141B34' }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.nome ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = errors.nome ? '#ef4444' : '#e5e7eb'}
                  placeholder="Seu nome completo"
                />
                {errors.nome && <span style={{ color: '#ef4444', fontSize: '14px' }}>{errors.nome}</span>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#141B34' }}>
                  E-mail *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb'}
                  placeholder="seu@email.com"
                />
                {errors.email && <span style={{ color: '#ef4444', fontSize: '14px' }}>{errors.email}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#141B34' }}>
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${errors.telefone ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = errors.telefone ? '#ef4444' : '#e5e7eb'}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                  {errors.telefone && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.telefone}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#141B34' }}>
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${errors.cpf ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = errors.cpf ? '#ef4444' : '#e5e7eb'}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {errors.cpf && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.cpf}</span>}
                </div>
              </div>

              {/* Resumo do Pedido */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
                  Resumo do Pedido
                </h3>
                {cart.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    fontSize: '14px'
                  }}>
                    <span>{item.icone} {item.nome}</span>
                    <span style={{ fontWeight: 'bold' }}>{formatCurrency(item.preco)}</span>
                  </div>
                ))}
                <div style={{
                  borderTop: '2px solid #e5e7eb',
                  marginTop: '16px',
                  paddingTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  <span>Total</span>
                  <span style={{ color: '#10b981' }}>{formatCurrency(getTotal())}</span>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Continuar para Pagamento →
              </button>
            </form>
          )}

          {/* Step 2: Forma de Pagamento */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
                  Escolha a forma de pagamento
                </h3>

                {/* PIX */}
                <div
                  onClick={() => setPaymentMethod('pix')}
                  style={{
                    border: `2px solid ${paymentMethod === 'pix' ? '#667eea' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: paymentMethod === 'pix' ? '#f0f4ff' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '32px' }}>🎯</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                        PIX
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        Aprovação instantânea
                      </div>
                    </div>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${paymentMethod === 'pix' ? '#667eea' : '#e5e7eb'}`,
                      background: paymentMethod === 'pix' ? '#667eea' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px'
                    }}>
                      {paymentMethod === 'pix' && '✓'}
                    </div>
                  </div>
                </div>

                {/* Cartão de Crédito */}
                <div
                  onClick={() => setPaymentMethod('credit_card')}
                  style={{
                    border: `2px solid ${paymentMethod === 'credit_card' ? '#667eea' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: paymentMethod === 'credit_card' ? '#f0f4ff' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '32px' }}>💳</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                        Cartão de Crédito
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        Parcelamento em até 3x sem juros
                      </div>
                    </div>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${paymentMethod === 'credit_card' ? '#667eea' : '#e5e7eb'}`,
                      background: paymentMethod === 'credit_card' ? '#667eea' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px'
                    }}>
                      {paymentMethod === 'credit_card' && '✓'}
                    </div>
                  </div>
                </div>

                {/* Boleto */}
                <div
                  onClick={() => setPaymentMethod('boleto')}
                  style={{
                    border: `2px solid ${paymentMethod === 'boleto' ? '#667eea' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: paymentMethod === 'boleto' ? '#f0f4ff' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '32px' }}>🏦</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                        Boleto Bancário
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        Vencimento em 3 dias úteis
                      </div>
                    </div>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${paymentMethod === 'boleto' ? '#667eea' : '#e5e7eb'}`,
                      background: paymentMethod === 'boleto' ? '#667eea' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px'
                    }}>
                      {paymentMethod === 'boleto' && '✓'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'white',
                    color: '#667eea',
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  style={{
                    flex: 2,
                    padding: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Finalizar Pedido 🎉
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Processando */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'spin 2s linear infinite' }}>
                ⏳
              </div>
              <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Processando seu pedido...</h3>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Aguarde enquanto geramos seu pagamento
              </p>
            </div>
          )}

          {/* Step 4: Sucesso */}
          {step === 4 && paymentData && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
              <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#10b981' }}>
                Pedido Confirmado!
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Pedido #{paymentData.pedido_id}
              </p>

              {paymentMethod === 'pix' && paymentData.qr_code && (
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px'
                }}>
                  <h4 style={{ marginBottom: '16px' }}>📱 Pague com PIX</h4>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '16px'
                  }}>
                    <img
                      src={paymentData.qr_code}
                      alt="QR Code PIX"
                      style={{ maxWidth: '200px', height: 'auto' }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentData.pix_code);
                      alert('Código PIX copiado!');
                    }}
                    style={{
                      padding: '12px 24px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    📋 Copiar Código PIX
                  </button>
                </div>
              )}

              {paymentMethod === 'boleto' && paymentData.boleto_url && (
                <div style={{ marginBottom: '24px' }}>
                  <a
                    href={paymentData.boleto_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '16px 32px',
                      background: '#10b981',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    🏦 Ver Boleto
                  </a>
                </div>
              )}

              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                Enviamos os detalhes para <strong>{formData.email}</strong>
              </p>

              <button
                onClick={() => {
                  clearCart();
                  onClose();
                }}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -40%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}
