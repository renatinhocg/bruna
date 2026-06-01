# 🔗 InfinityPay - Integração com Links de Pagamento

## 📋 Visão Geral

Este sistema usa **links de pagamento** do InfinityPay ao invés de API direta. O fluxo é simples e seguro:

1. Cliente adiciona produtos ao carrinho
2. Cliente faz login/cadastro
3. Sistema gera link de pagamento do InfinityPay com dados do pedido
4. Cliente é redirecionado para página de pagamento do InfinityPay
5. InfinityPay processa o pagamento (PIX, Cartão, Boleto)
6. Webhook notifica nosso backend quando o pagamento é confirmado
7. Sistema libera acesso aos testes

## 🛠️ Configuração

### 1. No Painel InfinityPay

Acesse: https://dashboard.infinitepay.io

#### Criar Link Base
1. Menu lateral → **"Seu Link na Bio"** ou **"Monte seu link"**
2. Configure:
   - ✅ URL de redirecionamento pós-pagamento: `https://impulsobm.co/obrigado`
   - ✅ Produtos disponíveis (ou deixe dinâmico)
   - ✅ Formas de pagamento: PIX, Cartão, Boleto
3. Copie o link gerado (ex: `https://impulsobm.co`)

#### Configurar Webhook
1. Menu → **"Seus recebimentos"** → Configurações → **Webhooks**
2. Adicione URL: `https://seu-backend.railway.app/api/compras/webhook/infinitypay`
3. Ative notificações:
   - ✅ Pagamento aprovado
   - ✅ Pagamento recusado
   - ✅ Pagamento cancelado

### 2. No Backend (.env)

```env
# Link base do InfinityPay
INFINITYPAY_LINK_BASE=https://impulsobm.co

# URL do webhook (seu backend)
INFINITYPAY_WEBHOOK_URL=https://seu-backend.railway.app/api/compras/webhook/infinitypay
```

## 🔄 Fluxo de Pagamento

### Frontend → Backend

**Endpoint**: `POST /api/compras/checkout-autenticado`

**Request**:
```json
{
  "produtos": [1, 2, 3],
  "total": 29.70,
  "metodo_pagamento": "pix"
}
```

**Response**:
```json
{
  "pedido_id": "PED-1733920000000-ABC123",
  "status": "pending",
  "payment_url": "https://impulsobm.co?ref=PED-1733920000000-ABC123&amount=29.70&customer_name=João+Silva&customer_email=joao@email.com&products=DISC,Dominância,Inteligências",
  "total": "29.70",
  "metodo_pagamento": "pix",
  "produtos": [
    { "id": 1, "nome": "Teste DISC", "preco": "9.90" },
    { "id": 2, "nome": "Dominância Cerebral", "preco": "9.90" },
    { "id": 3, "nome": "Inteligências Múltiplas", "preco": "9.90" }
  ],
  "message": "Redirecione para o link de pagamento"
}
```

### Frontend → InfinityPay

O frontend exibe botão "Ir para Pagamento" que abre o `payment_url` em nova aba:

```jsx
<a
  href={paymentData.payment_url}
  target="_blank"
  rel="noopener noreferrer"
>
  Ir para Pagamento →
</a>
```

### InfinityPay → Backend (Webhook)

Quando o pagamento é confirmado, o InfinityPay envia:

**Endpoint**: `POST /api/compras/webhook/infinitypay`

**Payload** (exemplo):
```json
{
  "id": "txn_abc123",
  "status": "paid",
  "amount": 2970,
  "payment_method": "pix",
  "reference": "PED-1733920000000-ABC123",
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

**Ação do Backend**:
1. Valida webhook
2. Busca compra pelo `reference` (pedido_id)
3. Atualiza status para `pago`
4. Envia email de confirmação
5. Libera acesso aos testes

## 📁 Arquivos Principais

### Backend

- **`backend/src/services/infinitypay.js`**: Serviço que gera links de pagamento
- **`backend/src/routes/compras.js`**: Endpoints de checkout e webhook
- **`backend/.env`**: Configurações do InfinityPay

### Frontend

- **`frontend/produto-landing/src/pages/CheckoutPage.jsx`**: Página de checkout
- **`frontend/produto-landing/src/components/Cart.jsx`**: Carrinho com botão "Finalizar Compra"
- **`frontend/produto-landing/src/App.jsx`**: Rotas (/, /checkout)

## 🧪 Testando

### 1. Teste Local

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend/produto-landing
npm run dev
```

Acesse: http://localhost:5173

### 2. Fluxo de Teste

1. ✅ Adicione produtos ao carrinho
2. ✅ Clique em "Finalizar Compra"
3. ✅ Faça login ou cadastre-se
4. ✅ Escolha forma de pagamento
5. ✅ Clique "Finalizar Pedido"
6. ✅ Veja o link gerado
7. ✅ Clique "Ir para Pagamento"
8. ✅ Complete o pagamento no InfinityPay
9. ✅ Aguarde webhook atualizar status

### 3. Simular Webhook (Desenvolvimento)

Use o Postman ou curl:

```bash
curl -X POST http://localhost:8002/api/compras/webhook/infinitypay \
  -H "Content-Type: application/json" \
  -d '{
    "id": "txn_test123",
    "status": "paid",
    "amount": 2970,
    "payment_method": "pix",
    "reference": "PED-1733920000000-ABC123",
    "customer": {
      "name": "João Silva",
      "email": "joao@email.com"
    }
  }'
```

## 🔒 Segurança

1. **Validação de Webhook**: Implementar validação de assinatura HMAC
2. **HTTPS**: Usar apenas HTTPS em produção
3. **Sanitização**: Validar todos os dados recebidos
4. **Rate Limiting**: Limitar requisições ao webhook

## 📊 Monitoramento

### Ver Compras no Admin

Acesse: http://localhost:3000/vendas

### Ver Logs

```bash
# Backend
tail -f backend/logs/compras.log

# Webhook
tail -f backend/logs/webhook.log
```

## 🚀 Deploy

### Railway (Backend)

```bash
cd backend
railway up
```

Configurar variáveis de ambiente no Railway:
- `INFINITYPAY_LINK_BASE`
- `INFINITYPAY_WEBHOOK_URL` (URL do seu backend + /api/compras/webhook/infinitypay)

### Vercel (Frontend)

```bash
cd frontend/produto-landing
vercel --prod
```

Configurar variáveis de ambiente:
- `VITE_API_URL` (URL do backend no Railway)

## ❓ Troubleshooting

### Link não está funcionando

1. ✅ Verifique se o link está configurado no `.env`
2. ✅ Confirme que o link está ativo no painel InfinityPay
3. ✅ Teste abrindo o link manualmente no navegador

### Webhook não está chegando

1. ✅ Confirme URL no painel InfinityPay
2. ✅ Use HTTPS (ngrok para desenvolvimento)
3. ✅ Verifique logs do backend
4. ✅ Teste com webhook de teste manual

### Pedido não atualiza após pagamento

1. ✅ Veja logs do webhook
2. ✅ Confirme que `reference` no webhook = `pedido_id` no banco
3. ✅ Verifique se o status está sendo mapeado corretamente

## 📞 Suporte

- **InfinityPay**: https://help.infinitepay.io
- **Documentação**: https://docs.infinitepay.io
- **Dashboard**: https://dashboard.infinitepay.io

---

✨ **Sistema pronto para uso!** Basta configurar o link no painel InfinityPay e adicionar ao `.env`.
