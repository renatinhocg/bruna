# 🌐 Configuração de URLs da API

## 📋 Resumo

O projeto usa **variáveis de ambiente** para configurar as URLs da API. Isso permite que o código funcione tanto em **desenvolvimento local** quanto em **produção** sem alterações.

---

## 🎯 Como Funciona

### **Frontend (React + Vite)**

#### Arquivos de Ambiente:

1. **`.env`** - Desenvolvimento local
```bash
VITE_API_URL=http://localhost:8002
```

2. **`.env.production`** - Produção
```bash
VITE_API_URL=https://backend-production-60f8.up.railway.app
```

#### No Código:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';
```

**O que acontece:**
- 🏠 **Local**: Usa `http://localhost:8002`
- 🚀 **Produção**: Usa `https://backend-production-60f8.up.railway.app`

---

### **Admin (Next.js)**

#### Arquivos de Ambiente:

1. **`.env.local`** - Desenvolvimento local
```bash
NEXT_PUBLIC_API_URL=http://localhost:8002
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002/api
```

2. **`.env.production`** - Produção
```bash
NEXT_PUBLIC_API_URL=https://backend-production-60f8.up.railway.app
NEXT_PUBLIC_API_BASE_URL=https://backend-production-60f8.up.railway.app/api
```

#### No Código:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
```

---

## 🔄 Quando as URLs Mudam?

### **Automaticamente:**

1. **Desenvolvimento**
   - Executa: `npm run dev`
   - Lê: `.env` ou `.env.local`
   - Usa: `http://localhost:8002`

2. **Build de Produção**
   - Executa: `npm run build`
   - Lê: `.env.production`
   - Usa: URL do Railway

3. **Deploy no Railway/Vercel**
   - Usa variáveis configuradas no painel
   - Não precisa dos arquivos `.env`

---

## ⚙️ Configuração no Deploy

### **Railway (Backend)**
Já configurado em: `https://backend-production-60f8.up.railway.app`

### **Vercel/Hostinger (Frontend)**
Configure estas variáveis no painel:

```bash
VITE_API_URL=https://backend-production-60f8.up.railway.app
```

### **Railway/Vercel (Admin)**
Configure estas variáveis no painel:

```bash
NEXT_PUBLIC_API_URL=https://backend-production-60f8.up.railway.app
NEXT_PUBLIC_API_BASE_URL=https://backend-production-60f8.up.railway.app/api
```

---

## 🔍 Verificação

Para ver qual URL está sendo usada, abra o console do navegador:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

---

## ✅ Status Atual

| Projeto | Desenvolvimento | Produção | Status |
|---------|----------------|----------|--------|
| **Frontend** | ✅ `.env` criado | ✅ `.env.production` | OK |
| **Admin** | ✅ `.env.local` existe | ✅ `.env.production` atualizado | OK |
| **Backend** | ✅ localhost:8002 | ✅ Railway | OK |

---

## 🚀 Resultado

**Não precisa alterar código!** 

- 🏠 **Localmente**: Sempre usa `localhost:8002`
- 🌍 **Em produção**: Automaticamente usa a URL do Railway
- 🔒 **Seguro**: URLs sensíveis não vão para o GitHub (`.env` está no `.gitignore`)

---

## 📝 Importante

❌ **NUNCA** commite arquivos `.env` ou `.env.local`

✅ **SEMPRE** commite `.env.example` como referência

✅ Configure as variáveis de ambiente **no painel do serviço de deploy**
