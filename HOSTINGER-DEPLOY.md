# 📦 Deploy Admin no Hostinger

## ⚠️ Importante

O **Railway** continua funcionando normalmente! Esta configuração é apenas para criar uma versão do Admin que pode ser hospedada no Hostinger (hospedagem compartilhada).

## 🎯 Diferenças entre Railway e Hostinger

### Railway (Atual - Funcionando)
- Usa Next.js em modo `standalone` (servidor Node.js)
- Requer Node.js runtime
- Gera páginas dinamicamente
- URL: https://admin-production-08fa.up.railway.app

### Hostinger (Novo - Opcional)
- Usa Next.js em modo `export` (arquivos HTML estáticos)
- Não precisa de Node.js
- Páginas pré-renderizadas
- Pode usar qualquer hospedagem compartilhada

## 🚀 Como Gerar Build para Hostinger

### Passo 1: Executar o Script de Build

```bash
cd admin
npm run build:hostinger
```

Ou execute diretamente:

```powershell
.\build-hostinger.ps1
```

### Passo 2: Verificar a Pasta `out/`

O script vai gerar uma pasta `out/` com todos os arquivos estáticos:

```
out/
├── index.html
├── login.html
├── dashboard.html
├── usuarios.html
├── multiplas-inteligencias.html
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   ├── css/
│   │   └── media/
└── ...
```

## 📤 Upload para o Hostinger

### Método 1: File Manager (Recomendado)

1. **Acesse o Painel do Hostinger**
   - Login em: https://hpanel.hostinger.com

2. **Abra o File Manager**
   - Vá em: Files → File Manager

3. **Navegue até a Pasta do Domínio**
   - Se é o domínio principal: `public_html/`
   - Se é um subdomínio: `public_html/subdominio/`

4. **Limpe a Pasta (se necessário)**
   - Delete arquivos antigos (exceto .htaccess se existir)

5. **Faça Upload**
   - Clique em "Upload"
   - Selecione TODOS os arquivos da pasta `out/`
   - Aguarde o upload completar

6. **Verifique a Estrutura**
   - O arquivo `index.html` deve estar na raiz
   - A pasta `_next/` deve estar junto com index.html

### Método 2: FTP

1. **Configurar Cliente FTP** (FileZilla, WinSCP, etc.)
   - Host: ftp.seudominio.com
   - Usuário: (fornecido pelo Hostinger)
   - Senha: (fornecida pelo Hostinger)
   - Porta: 21

2. **Conectar e Navegar**
   - Conecte ao servidor
   - Vá para `public_html/`

3. **Upload dos Arquivos**
   - Arraste todos os arquivos de `out/` para `public_html/`
   - Aguarde a transferência

## ⚙️ Configuração da API URL

**IMPORTANTE**: Antes de fazer o build, você pode configurar a URL da API:

### Opção 1: Criar arquivo `.env.production`

Crie o arquivo `admin/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://backend-production-60f8.up.railway.app
```

Depois execute o build:

```bash
npm run build:hostinger
```

### Opção 2: Definir no momento do build

```bash
$env:NEXT_PUBLIC_API_URL="https://backend-production-60f8.up.railway.app"; npm run build:hostinger
```

## 🔧 Configuração do .htaccess (Opcional)

Se você quiser URLs limpas (sem .html), crie um arquivo `.htaccess` no Hostinger:

```apache
# Rewrite para remover .html das URLs
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([^\.]+)$ $1.html [NC,L]

# Redirecionar para HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Comprimir arquivos
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache de arquivos estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## 🧪 Testar o Deploy

1. **Acesse seu domínio**: `https://seudominio.com`
2. **Verifique o login**: `https://seudominio.com/login`
3. **Teste autenticação**: Faça login com admin@coaching.com / 123456
4. **Verifique o console**: Abra DevTools (F12) e veja se há erros

## ❗ Limitações do Export Estático

Algumas funcionalidades do Next.js não funcionam no modo estático:

- ❌ API Routes (use o backend do Railway)
- ❌ Rotas dinâmicas com `getServerSideProps`
- ❌ Middleware
- ❌ Revalidação incremental (ISR)

**Mas tudo que você precisa funciona!** O admin só usa:
- ✅ Client-side rendering
- ✅ API calls para o backend (Railway)
- ✅ Rotas estáticas

## 🔄 Atualizar o Site

Para atualizar o site depois de fazer mudanças:

1. Faça as alterações no código
2. Execute: `npm run build:hostinger`
3. Faça upload dos arquivos novos da pasta `out/`
4. Limpe o cache do navegador (Ctrl+F5)

## 🆚 Railway vs Hostinger - Quando Usar?

### Use Railway quando:
- ✅ Precisa de funcionalidades server-side
- ✅ Quer deploy automático via Git
- ✅ Precisa de ambientes (dev, staging, prod)
- ✅ Quer logs e monitoramento integrado

### Use Hostinger quando:
- ✅ Já tem hospedagem compartilhada paga
- ✅ Quer economizar (Railway cobra por uso)
- ✅ Site é simples e não precisa de servidor
- ✅ Preferência por controle manual

## 🐛 Troubleshooting

### Problema: Página em branco
- **Solução**: Verifique se o `index.html` está na raiz do `public_html/`
- Abra o DevTools (F12) e veja os erros no console

### Problema: Arquivos CSS/JS não carregam
- **Solução**: Verifique se a pasta `_next/` foi enviada corretamente
- Certifique-se que as permissões estão corretas (644 para arquivos, 755 para pastas)

### Problema: API não conecta
- **Solução**: Verifique se a variável `NEXT_PUBLIC_API_URL` foi definida antes do build
- Abra o DevTools → Network e veja para onde as requisições estão indo

### Problema: Erro 404 nas rotas
- **Solução**: Configure o `.htaccess` conforme mostrado acima
- Ou use as URLs com `.html`: `https://seudominio.com/login.html`

## 📞 Suporte

- Railway: https://railway.com/docs
- Hostinger: https://www.hostinger.com/tutorials
- Next.js Export: https://nextjs.org/docs/advanced-features/static-html-export

---

**✅ Lembre-se**: O Railway continua funcionando! Esta é apenas uma opção alternativa.
