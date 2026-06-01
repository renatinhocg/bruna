# 🚀 Deploy Rápido - 3 Passos

## ⚡ Opção 1: Deploy Automático via Git

### 1. Backend (Railway)
```bash
# O backend JÁ ESTÁ no Railway conectado ao banco!
# Basta fazer push:
git add .
git commit -m "Deploy backend"
git push
```

### 2. Admin (Vercel)
```bash
cd admin
vercel --prod
# Quando perguntar:
# - Project name: admin-bruna
# - Link to existing project: No
# - Build Command: npm run build
# - Output Directory: .next
```

### 3. Frontend (Vercel)
```bash
cd frontend
vercel --prod
# Quando perguntar:
# - Project name: frontend-bruna  
# - Build Command: npm run build
# - Output Directory: dist
```

---

## 🔑 Variáveis de Ambiente

### Backend (Railway) - JÁ CONFIGURADO ✅
```
DATABASE_URL=postgresql://SEU_USUARIO:SUA_SENHA@SEU_HOST:5432/SEU_BANCO
JWT_SECRET=SUA_CHAVE_JWT
AWS_ACCESS_KEY_ID=SUA_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=SUA_AWS_SECRET_ACCESS_KEY
AWS_REGION=SUA_AWS_REGION
AWS_S3_BUCKET=SEU_BUCKET
```

### Admin (Vercel) - ADICIONAR NO DASHBOARD
1. Acesse https://vercel.com/seu-usuario/admin-bruna/settings/environment-variables
2. Adicione:
```
NEXT_PUBLIC_API_URL = https://SEU-BACKEND.up.railway.app
```

### Frontend (Vercel) - ADICIONAR NO DASHBOARD
1. Acesse https://vercel.com/seu-usuario/frontend-bruna/settings/environment-variables
2. Adicione:
```
VITE_API_URL = https://SEU-BACKEND.up.railway.app
```

---

## 📦 Ou via Dashboard (Sem CLI)

### Backend (Railway)
1. Acesse https://railway.app
2. Conecte seu repositório GitHub
3. Selecione a pasta `/backend`
4. Deploy automático!

### Admin + Frontend (Vercel)
1. Acesse https://vercel.com/new
2. Import Git Repository
3. Selecione o repositório
4. Configure o diretório raiz:
   - Admin: `/admin`
   - Frontend: `/frontend`
5. Adicione as variáveis de ambiente
6. Deploy!

---

## ✅ Pronto!

Suas URLs serão algo como:
- Backend: `backend-production-XXXX.up.railway.app`
- Admin: `admin-bruna-XXXX.vercel.app`
- Frontend: `frontend-bruna-XXXX.vercel.app`

**Importante:** Depois de obter a URL do backend, atualize as variáveis `NEXT_PUBLIC_API_URL` e `VITE_API_URL` e redeploy!
