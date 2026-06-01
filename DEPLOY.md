# 🚀 Guia de Deploy - Sistema de Coach de Carreiras

## 📋 Pré-requisitos

- Conta no Railway (para Backend + Banco)
- Conta no Vercel (para Admin + Frontend)
- Git instalado e repositório configurado

---

## 1️⃣ Deploy do Backend (Railway)

### Passo 1: Preparar o repositório
```bash
cd backend
git add .
git commit -m "Preparar backend para deploy"
git push
```

### Passo 2: Criar projeto no Railway
1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório e pasta `/backend`

### Passo 3: Configurar variáveis de ambiente no Railway
Adicione as seguintes variáveis:
```
DATABASE_URL=postgresql://SEU_USUARIO:SUA_SENHA@SEU_HOST:5432/SEU_BANCO?connection_limit=5&pool_timeout=10&connect_timeout=10
JWT_SECRET=SUA_CHAVE_JWT
AWS_ACCESS_KEY_ID=SUA_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=SUA_AWS_SECRET_ACCESS_KEY
AWS_REGION=SUA_AWS_REGION
AWS_S3_BUCKET=SEU_BUCKET
PORT=8002
```

### Passo 4: Deploy automático
- O Railway vai fazer o build e deploy automaticamente
- Após o deploy, copie a URL pública (ex: `https://backend-production.up.railway.app`)

---

## 2️⃣ Deploy do Admin (Vercel)

### Passo 1: Build local (teste)
```bash
cd admin
npm run build
```

### Passo 2: Deploy no Vercel
```bash
# Instalar Vercel CLI (se não tiver)
npm install -g vercel

# Fazer deploy
cd admin
vercel
```

### Passo 3: Configurar variável de ambiente na Vercel
Na dashboard da Vercel, adicione:
```
NEXT_PUBLIC_API_URL=https://SEU-BACKEND.up.railway.app
```

### Passo 4: Redeployar após configurar variável
```bash
vercel --prod
```

---

## 3️⃣ Deploy do Frontend (Vercel)

### Passo 1: Build local (teste)
```bash
cd frontend
npm run build
```

### Passo 2: Deploy no Vercel
```bash
cd frontend
vercel
```

### Passo 3: Configurar variável de ambiente na Vercel
Na dashboard da Vercel, adicione:
```
VITE_API_URL=https://SEU-BACKEND.up.railway.app
```

### Passo 4: Redeployar após configurar variável
```bash
vercel --prod
```

---

## 🔧 Configurações de CORS no Backend

Certifique-se de que o backend aceita requisições dos domínios do Vercel.

No arquivo `backend/src/index.js`, configure o CORS:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://SEU-ADMIN.vercel.app',
    'https://SEU-FRONTEND.vercel.app'
  ],
  credentials: true
}));
```

---

## ✅ Checklist Final

### Backend (Railway)
- [ ] Código commitado no Git
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] URL pública funcionando
- [ ] Migrations aplicadas
- [ ] Usuário admin criado

### Admin (Vercel)
- [ ] Build local funcionando
- [ ] Variável NEXT_PUBLIC_API_URL configurada
- [ ] Deploy realizado
- [ ] URL pública funcionando
- [ ] Login funcionando

### Frontend (Vercel)
- [ ] Build local funcionando
- [ ] Variável VITE_API_URL configurada
- [ ] Deploy realizado
- [ ] URL pública funcionando
- [ ] Login funcionando
- [ ] Teste de inteligências funcionando

---

## 🆘 Troubleshooting

### Erro de CORS
- Adicione o domínio do Vercel no CORS do backend
- Redeploy o backend

### Variável de ambiente não funciona
- Vercel: Precisa redeployar após adicionar variável
- Railway: Reinicia automaticamente

### Erro 500 no backend
- Verifique logs no Railway
- Verifique se DATABASE_URL está correta
- Verifique se migrations foram aplicadas

---

## 📝 URLs Finais

Após o deploy, você terá:

- **Backend:** https://backend-production.up.railway.app
- **Admin:** https://admin-bruna.vercel.app
- **Frontend:** https://frontend-bruna.vercel.app

---

## 🔄 Atualizações futuras

Para atualizar após mudanças no código:

```bash
# Fazer mudanças
git add .
git commit -m "Suas mudanças"
git push

# Railway e Vercel vão fazer redeploy automático!
```
