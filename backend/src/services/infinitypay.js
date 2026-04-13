/**
 * InfinityPay Integration Service
 * Sistema de Links de Pagamento
 */

class InfinityPayService {
  constructor() {
  // URL base do link gerado no painel InfinityPay
  this.paymentLinkBase = process.env.INFINITYPAY_LINK_BASE || 'https://impulsobm.co';
  console.log('[InfinityPay] paymentLinkBase:', this.paymentLinkBase);
  }

  /**
   * Gerar URL de pagamento dinâmica no formato InfinityPay
   * Formato: https://checkout.infinitepay.io/user?items=[...]&redirect_url=...
   */
  generatePaymentLink(pedidoData) {
    const {
      pedido_id,
      total,
      produtos,
      cliente_nome,
      cliente_email
    } = pedidoData;

    // Converter produtos para formato InfinityPay
    // Preços em centavos (R$ 9,90 = 990)
    const items = produtos.map(p => ({
      name: p.nome,
      price: Math.round(parseFloat(p.preco) * 100), // Converter para centavos
      quantity: 1
    }));

    // URL de redirecionamento após pagamento (pode personalizar)
  const redirectUrl = process.env.INFINITYPAY_REDIRECT_URL || 'https://impulsobm.com.br/obrigado';
  console.log('[InfinityPay] redirectUrl:', redirectUrl);

    // Construir URL com items em JSON
    const itemsJson = encodeURIComponent(JSON.stringify(items));
    const url = `${this.paymentLinkBase}?items=${itemsJson}&redirect_url=${encodeURIComponent(redirectUrl)}`;

    return url;
  }

  /**
   * Criar pagamento com link único
   * Retorna o link de pagamento do InfinityPay
   */
  createPaymentLink(pedidoData) {
    const paymentUrl = this.generatePaymentLink(pedidoData);
    
    return {
      payment_url: paymentUrl,
      pedido_id: pedidoData.pedido_id,
      status: 'pending',
      message: 'Redirecione o cliente para o link de pagamento'
    };
  }

  /**
   * Processar webhook do InfinityPay
   * Validar e extrair dados do pagamento
   */
  processWebhook(webhookData) {
    try {
      const {
        id,
        status,
        amount,
        payment_method,
        reference,
        customer
      } = webhookData;

      return {
        transaction_id: id,
        status: this.mapStatus(status),
        valor: amount / 100, // Converter de centavos
        metodo_pagamento: payment_method,
        pedido_id: reference,
        cliente: {
          nome: customer?.name,
          email: customer?.email
        }
      };
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      throw error;
    }
  }

  /**
   * Mapear status do InfinityPay para status interno
   */
  mapStatus(infinityPayStatus) {
    const statusMap = {
      'pending': 'pendente',
      'paid': 'pago',
      'approved': 'pago',
      'cancelled': 'cancelado',
      'expired': 'expirado',
      'failed': 'cancelado'
    };

    return statusMap[infinityPayStatus] || 'pendente';
  }
}

// Singleton
const infinityPayService = new InfinityPayService();

export default infinityPayService;
