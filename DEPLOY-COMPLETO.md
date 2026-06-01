# 🚀 Deploy Completo - Sistema de Coaching

## ✅ Status do Deploy

Todos os serviços foram deployados com sucesso no Railway!

## 🌐 URLs de Produção

### Backend (API)
- **URL**: https://backend-production-60f8.up.railway.app
- **Porta**: 8002
- **Status**: ✅ Rodando

### Frontend (Portal do Cliente)
- **URL**: https://frontend-copy-production-4ecf.up.railway.app
- **Porta**: 8080
- **Status**: ✅ Rodando

### Admin (Painel Administrativo)
- **URL**: https://admin-production-08fa.up.railway.app
- **Porta**: 8080
- **Status**: ✅ Rodando

## 🗄️ Banco de Dados

- **Tipo**: PostgreSQL
- **Host**: tramway.proxy.rlwy.net:27035
- **Database**: railway
- **Status**: ✅ Conectado

## 🔐 Credenciais de Acesso

### Admin
- **Email**: admin@coaching.com
- **Senha**: 123456

### Cliente de Teste
- **Email**: catarina@email.com
- **Senha**: (definida durante cadastro)

## 📦 Variáveis de Ambiente Configuradas

### Backend
- `DATABASE_URL`: Configurada ✅
- `JWT_SECRET`: Configurada ✅
- `AWS_ACCESS_KEY_ID`: Configurada ✅
- `AWS_SECRET_ACCESS_KEY`: Configurada ✅
- `AWS_REGION`: us-east-2 ✅
- `AWS_S3_BUCKET`: sistema-carreira ✅
- `PORT`: 8002 ✅

### Frontend
- `VITE_API_URL`: https://backend-production-60f8.up.railway.app ✅
- `PORT`: 8080 ✅

### Admin
- `NEXT_PUBLIC_API_URL`: https://backend-production-60f8.up.railway.app ✅
- `PORT`: 8080 ✅

## 🔧 Configurações Aplicadas

### CORS
O backend está configurado para aceitar requisições de:
- `*.vercel.app`
- `*.up.railway.app`
- Credenciais habilitadas

### Build Configurations

**Backend** (`railway.json`):
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate"
  },
  "deploy": {
    "startCommand": "node src/index.js"
  }
}
```

**Frontend** (`railway.json`):
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "HOST=0.0.0.0 PORT=8080 npx serve@latest dist -l 8080"
  }
}
```

**Admin** (`railway.json`):
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/"
  },
  "deploy": {
    "startCommand": "cd .next/standalone && HOSTNAME=0.0.0.0 PORT=${PORT:-8080} node server.js"
  }
}
```

## 📊 Estrutura do Projeto

```
Sistema de Coaching
├── Backend (Node.js + Express + Prisma)
│   ├── API REST
│   ├── Autenticação JWT
│   ├── Upload de arquivos (AWS S3)
│   └── Banco PostgreSQL
├── Frontend (React + Vite + Ant Design)
│   ├── Portal do Cliente
│   ├── Teste de Inteligências Múltiplas
│   └── Perfil do Usuário
└── Admin (Next.js + Ant Design)
    ├── Gestão de Usuários
    ├── Gestão de Testes
    ├── Gestão de Perguntas/Categorias
    └── Relatórios
```

## 🎯 Funcionalidades Deployadas

### Portal do Cliente
- ✅ Login/Cadastro
- ✅ Teste de Inteligências Múltiplas
- ✅ Visualização de Resultados
- ✅ Perfil do Usuário
- ✅ Upload de Avatar

### Painel Admin
- ✅ Login Administrativo
- ✅ Dashboard com Estatísticas
- ✅ Gestão de Usuários
- ✅ Gestão de Categorias
- ✅ Gestão de Perguntas
- ✅ Gestão de Possibilidades (Respostas)
- ✅ Visualização de Resultados
- ✅ Testes Pendentes de Aprovação
- ✅ Relatórios

## 🚀 Como Fazer Deploy Novamente

### Backend
```bash
cd backend
railway up --service Backend
```

### Frontend
```bash
cd frontend
npm run build
railway up --service "Frontend copy"
```

### Admin
```bash
cd admin
npm run build
railway up --service Admin
```

## 📝 Notas Importantes

1. **Prisma**: O Prisma Client é gerado durante o build. As migrations já foram aplicadas no banco.

2. **Variáveis de Ambiente do Vite**: As variáveis `VITE_*` precisam estar configuradas **antes** do build, pois são compiladas no código.

3. **Next.js Standalone**: O admin usa o modo standalone do Next.js, que copia apenas os arquivos necessários para produção.

4. **Arquivos Estáticos**: O comando de build do admin copia os arquivos estáticos (`.next/static` e `public`) para dentro do diretório standalone.

5. **CORS**: O backend aceita requisições de qualquer subdomínio `.vercel.app` e `.up.railway.app`.

## 🐛 Troubleshooting

### Frontend retornando localhost
- Verifique se a variável `VITE_API_URL` está configurada no Railway
- Faça um novo build: `npm run build`
- Deploy novamente: `railway up`

### Admin com erro 404 nos chunks
- Verifique se o comando de build copiou os arquivos estáticos
- Comando correto: `npm run build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/`

### Backend com erro de conexão
- Verifique se a `DATABASE_URL` está correta
- Teste a conexão com o banco
- Verifique os logs: `railway logs --service Backend`

## 📚 Documentação Adicional

- [Railway Documentation](https://docs.railway.app/)
- [Next.js Standalone Output](https://nextjs.org/docs/pages/api-reference/next-config-js/output)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment/deployment-guides)

---

✅ **Deploy concluído com sucesso em 3 de outubro de 2025**
