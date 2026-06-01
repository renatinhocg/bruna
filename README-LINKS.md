# Sistema de Links - Estilo Linktree

Uma página de links personalizável com rastreamento de cliques, similar ao Linktree.

## 🚀 Funcionalidades

### 📱 Página Pública (Linktree)
- Design moderno e responsivo
- Animações suaves
- Ícones personalizáveis com emojis
- Cores customizáveis para cada link
- Layout otimizado para mobile
- Carregamento rápido

### 📊 Painel Administrativo
- CRUD completo de links
- Estatísticas em tempo real
- Contagem total de cliques
- Cliques dos últimos 7 dias
- Ativar/desativar links
- Ordenação customizável
- Visualização detalhada de estatísticas por link
- Timeline de cliques
- Estatísticas por dia

### 🔍 Rastreamento de Cliques
- Registro automático de cada clique
- Captura de IP do visitante
- User Agent (navegador/dispositivo)
- Referrer (origem do tráfego)
- Timestamp preciso
- Estatísticas por período (7, 30 dias)

## 📂 Estrutura do Projeto

### Backend
```
backend/
├── prisma/
│   └── schema.prisma          # Models: Link, ClickLog
└── src/
    └── routes/
        └── links.js           # API endpoints
```

### Frontend
```
frontend/src/pages/
├── LinktreePage.jsx           # Página pública
└── admin/
    └── AdminLinks.jsx         # Painel admin

admin/src/app/
└── links/
    └── page.tsx               # Painel admin Next.js
```

## 🛠️ Instalação

### 1. Migração do Banco de Dados

```bash
cd backend
npx prisma migrate dev --name add_links_system
npx prisma generate
```

### 2. Iniciar Backend

```bash
cd backend
npm run dev
```

### 3. Iniciar Frontend

```bash
cd frontend
npm run dev
```

### 4. Iniciar Admin (Next.js)

```bash
cd admin
npm run dev
```

## 📡 Endpoints da API

### Públicos (Sem Autenticação)

#### Listar Links Ativos
```
GET /api/links/public
```
Retorna todos os links ativos ordenados.

#### Registrar Clique
```
POST /api/links/:id/click
Body: { "referer": "string" }
```
Registra um clique no link.

### Administrativos (Requer Autenticação)

#### Listar Todos os Links
```
GET /api/links
```
Retorna todos os links com estatísticas.

#### Criar Link
```
POST /api/links
Body: {
  "titulo": "string",
  "url": "string",
  "icone": "🔗",
  "descricao": "string",
  "cor": "#1890ff",
  "ordem": 0,
  "ativo": true
}
```

#### Atualizar Link
```
PUT /api/links/:id
Body: { mesmos campos do POST }
```

#### Deletar Link
```
DELETE /api/links/:id
```

#### Estatísticas Detalhadas
```
GET /api/links/:id/stats?dias=30
```
Retorna estatísticas detalhadas de um link.

## 🎨 Personalização

### Página Pública (LinktreePage.jsx)

Você pode personalizar:

```javascript
const perfil = {
  nome: 'Seu Nome',
  descricao: 'Sua Descrição',
  avatar: 'URL do Avatar'
};
```

### Cores e Gradiente

```javascript
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
```

## 📊 Schema do Banco de Dados

### Modelo Link
```prisma
model Link {
  id            Int         @id @default(autoincrement())
  titulo        String
  url           String
  icone         String?     @default("🔗")
  descricao     String?
  cor           String?     @default("#1890ff")
  ordem         Int         @default(0)
  ativo         Boolean     @default(true)
  usuario_id    Int?
  clicks        ClickLog[]
  criado_em     DateTime    @default(now())
  atualizado_em DateTime    @updatedAt
}
```

### Modelo ClickLog
```prisma
model ClickLog {
  id           Int      @id @default(autoincrement())
  link_id      Int
  ip_address   String?
  user_agent   String?
  referer      String?
  pais         String?
  cidade       String?
  clicked_at   DateTime @default(now())
  link         Link     @relation(...)
}
```

## 🔗 URLs de Acesso

### Produção
- **Página Pública:** `https://seudominio.com/links`
- **Admin:** `https://admin.seudominio.com/links`

### Desenvolvimento
- **Página Pública:** `http://localhost:5173/links`
- **Admin (Next.js):** `http://localhost:3001/links`
- **Admin (React):** `http://localhost:5173/admin/links`

## 📈 Estatísticas Disponíveis

### Visão Geral
- Total de links
- Links ativos
- Total de cliques (todos os tempos)
- Cliques dos últimos 7 dias

### Por Link
- Total de cliques
- Cliques por dia (30 dias)
- Cliques por país (se disponível)
- Timeline dos últimos cliques
- IP e User Agent de cada clique

## 🎯 Casos de Uso

1. **Influenciadores Digitais:** Agregar todos os links em um único lugar
2. **Profissionais:** Portfolio, redes sociais, contato
3. **Empresas:** Landing page com múltiplos CTAs
4. **Eventos:** Links para inscrição, programação, sponsors
5. **Educadores:** Materiais, cursos, redes sociais

## 🔒 Segurança

- Rotas administrativas devem ter autenticação
- Validação de URLs no backend
- Sanitização de inputs
- Rate limiting recomendado para endpoints públicos
- CORS configurado adequadamente

## 📱 Responsividade

A página pública é totalmente responsiva:
- ✅ Mobile (< 768px)
- ✅ Tablet (768px - 1024px)
- ✅ Desktop (> 1024px)

## 🎨 Exemplos de Emojis para Ícones

- 📱 Instagram
- 💼 LinkedIn
- 🎥 YouTube
- 📧 Email
- 🌐 Website
- 📝 Blog
- 🛒 Loja
- 📞 Contato
- 📚 Portfólio
- 🎓 Cursos

## 📝 Notas

- Os cliques são registrados de forma assíncrona para não atrasar a navegação
- Links inativos não aparecem na página pública
- A ordenação dos links pode ser customizada pelo campo `ordem`
- Estatísticas são calculadas em tempo real

## 🤝 Contribuindo

Para adicionar novas funcionalidades:
1. Backend: Adicione endpoints em `backend/src/routes/links.js`
2. Frontend: Atualize `LinktreePage.jsx` ou `AdminLinks.jsx`
3. Database: Modifique `prisma/schema.prisma` e rode migration

## 📄 Licença

Este projeto faz parte do sistema administrativo da Bruna Martins - Coach de Carreiras.
