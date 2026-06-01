# 🚀 Guia Rápido - Sistema de Links

## Passo 1: Migrar o Banco de Dados

```powershell
cd backend
npx prisma migrate dev --name add_links_system
npx prisma generate
```

## Passo 2: Testar a API

Inicie o backend:
```powershell
cd backend
npm run dev
```

Teste no navegador ou Postman:
```
GET http://localhost:8002/api/links/public
```

## Passo 3: Acessar o Admin

### Opção 1: Admin Next.js (Recomendado)
```powershell
cd admin
npm run dev
```
Acesse: http://localhost:3001/links

### Opção 2: Admin React
```powershell
cd frontend
npm run dev
```
Acesse: http://localhost:5173/admin/links

## Passo 4: Criar seus Primeiros Links

No painel admin:

1. Clique em "Novo Link"
2. Preencha:
   - **Título:** Meu Instagram
   - **URL:** https://instagram.com/seu_usuario
   - **Ícone:** 📱
   - **Cor:** #E4405F (rosa do Instagram)
   - **Ordem:** 1
3. Clique em "Salvar"

Repita para outros links:
- YouTube: 🎥 #FF0000
- LinkedIn: 💼 #0077B5
- Email: 📧 #34A853
- Website: 🌐 #1890ff

## Passo 5: Visualizar a Página Pública

```powershell
cd frontend
npm run dev
```

Acesse: http://localhost:5173/links

## 🎨 Personalize seu Perfil

Edite `frontend/src/pages/LinktreePage.jsx`:

```javascript
const [perfil, setPerfil] = useState({
  nome: 'Seu Nome Aqui',
  descricao: 'Sua Descrição Aqui',
  avatar: 'https://seu-avatar.jpg'
});
```

## 📊 Visualizar Estatísticas

No painel admin:
1. Clique em "Stats" ao lado de qualquer link
2. Veja:
   - Total de cliques
   - Cliques por dia
   - Últimos cliques com horário e IP

## 🌐 Compartilhar sua Página

Depois de fazer deploy:
```
https://seudominio.com/links
```

Compartilhe esse link em:
- Bio do Instagram
- Bio do LinkedIn
- Bio do Twitter/X
- Assinatura de email
- Cartão de visitas digital

## 💡 Dicas

### Ordem dos Links
Links são exibidos pela ordem crescente do campo "Ordem":
- Ordem 0: Primeiro
- Ordem 1: Segundo
- Ordem 2: Terceiro

### Cores Sugeridas
- Instagram: #E4405F
- Facebook: #1877F2
- LinkedIn: #0077B5
- YouTube: #FF0000
- TikTok: #000000
- WhatsApp: #25D366
- Email: #34A853
- Website: #1890ff

### Emojis Populares
- 📱 Redes Sociais
- 💼 Profissional
- 🎥 Vídeos
- 📧 Contato
- 🛒 Loja
- 📚 Conteúdo
- 🎓 Educação
- 🎨 Portfolio

## ⚠️ Troubleshooting

### Links não aparecem na página pública
✅ Verifique se o link está marcado como "Ativo"

### Cliques não são registrados
✅ Verifique se o backend está rodando
✅ Confira o console do navegador por erros CORS

### Estatísticas zeradas
✅ Certifique-se de que a migration foi executada
✅ Reinicie o backend após a migration

## 🎯 Próximos Passos

1. ✅ Criar seus links
2. ✅ Personalizar cores e ícones
3. ✅ Testar a página pública
4. ✅ Compartilhar o link
5. ✅ Acompanhar estatísticas

## 📞 Suporte

Se precisar de ajuda, verifique:
- Console do navegador (F12)
- Logs do backend
- Arquivo README-LINKS.md completo
