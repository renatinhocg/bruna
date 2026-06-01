# 🛠️ Comandos Úteis para Produção

## 📊 Ver logs em produção

### Railway (Backend)
```bash
# Via CLI
railway logs

# Ou no dashboard: https://railway.app
```

### Vercel (Admin/Frontend)
```bash
# Via CLI
vercel logs [deployment-url]

# Ou no dashboard: https://vercel.com
```

---

## 🔄 Redeployar após mudanças

### Método 1: Git Push (Automático)
```bash
git add .
git commit -m "Suas mudanças"
git push
# Railway e Vercel fazem redeploy automaticamente!
```

### Método 2: CLI Manual
```bash
# Backend
cd backend
railway up

# Admin
cd admin
vercel --prod

# Frontend  
cd frontend
vercel --prod
```

---

## 🗄️ Comandos do Banco de Dados

### Aplicar migrations
```bash
cd backend
npx prisma migrate deploy
```

### Ver dados (Prisma Studio)
```bash
cd backend
npx prisma studio
```

### Criar backup
```bash
# Exportar dados
pg_dump $DATABASE_URL > backup.sql

# Importar dados
psql $DATABASE_URL < backup.sql
```

---

## 🧹 Limpar e reconstruir

### Backend
```bash
cd backend
rm -rf node_modules
npm install
npx prisma generate
npm start
```

### Admin
```bash
cd admin
rm -rf node_modules .next
npm install
npm run build
npm start
```

### Frontend
```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
npm run preview
```

---

## 🔍 Testar localmente com produção

### Conectar ao banco de produção localmente
```bash
# Copie o DATABASE_URL de produção
# Cole no seu .env local
cd backend
npm run dev
```

### Apontar frontend local para API de produção
```bash
# No .env do frontend
VITE_API_URL=https://seu-backend.up.railway.app

npm run dev
```

---

## 📈 Monitoramento

### Ver métricas no Railway
1. Acesse https://railway.app/project/SEU-PROJETO
2. Clique no serviço
3. Ver: CPU, RAM, Network, Logs

### Ver analytics no Vercel
1. Acesse https://vercel.com/seu-usuario/seu-projeto
2. Aba "Analytics"
3. Ver: Pageviews, Performance, Errors

---

## 🆘 Troubleshooting comum

### Erro 500 no backend
```bash
# Ver logs
railway logs --tail

# Possíveis causas:
# - DATABASE_URL incorreta
# - Migrations não aplicadas
# - Variável de ambiente faltando
```

### Admin/Frontend não conecta na API
```bash
# Verificar variável de ambiente
echo $NEXT_PUBLIC_API_URL  # Admin
echo $VITE_API_URL         # Frontend

# Verificar CORS no backend
# Ver src/index.js - configuração do cors
```

### Variável de ambiente não atualiza
```bash
# Vercel: Precisa redeployar
vercel --prod

# Railway: Reinicia automaticamente após salvar
```

---

## 🔐 Segurança

### Rotacionar JWT Secret
1. Gere novo secret: `openssl rand -base64 32`
2. Atualize JWT_SECRET no Railway
3. Todos os usuários precisarão fazer login novamente

### Atualizar senha do banco
1. Gere nova senha no Railway
2. Atualize DATABASE_URL em todos os lugares
3. Redeploy

---

## 📝 Checklist de Deploy

- [ ] Backend deployed no Railway
- [ ] Banco conectado e migrations aplicadas
- [ ] Usuário admin criado (`node seed.js`)
- [ ] Admin deployed no Vercel
- [ ] Frontend deployed no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] Testes básicos funcionando
- [ ] URLs documentadas para o cliente
