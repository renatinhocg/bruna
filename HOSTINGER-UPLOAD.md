# 📤 Upload do Frontend para o Hostinger

## 📁 Arquivos para Upload

Na pasta `E:\Bruna\frontend\dist\` você tem:

```
dist/
├── .htaccess          ← Configuração do servidor
├── index.html         ← Página principal
└── assets/
    ├── index-aLRq3McW.css   ← CSS compilado
    └── index-D3J3IKxT.js    ← JavaScript compilado
```

## 🚀 Passo a Passo

### 1. Acesse o Painel do Hostinger

- Vá em: https://hpanel.hostinger.com
- Faça login com suas credenciais

### 2. Abra o File Manager

- No painel, clique em **"Files"** → **"File Manager"**
- Ou acesse diretamente a seção de arquivos

### 3. Navegue até a Pasta do Domínio

**Se for o domínio principal:**
- Vá para `public_html/`

**Se for um subdomínio:**
- Vá para `public_html/subdominio/`

### 4. Limpe a Pasta (IMPORTANTE!)

Antes de fazer upload, **delete todos os arquivos antigos**:
- Selecione todos os arquivos na pasta
- Clique em "Delete" ou ícone da lixeira
- ⚠️ **ATENÇÃO**: Não delete o arquivo `.htaccess` se já existir um (você vai sobrescrever depois)

### 5. Faça o Upload

**Opção A: Upload via Interface Web**

1. Clique no botão **"Upload"** no File Manager
2. Arraste ou selecione **TODOS** os arquivos de `E:\Bruna\frontend\dist\`
3. Certifique-se de incluir:
   - ✅ `.htaccess` (pode estar oculto!)
   - ✅ `index.html`
   - ✅ Pasta `assets/` com os 2 arquivos dentro

**Opção B: Upload via FTP (Mais Rápido)**

1. Abra seu cliente FTP (FileZilla, WinSCP, etc.)
2. Conecte com as credenciais do Hostinger:
   - Host: `ftp.seudominio.com`
   - Porta: 21
   - Usuário: (fornecido pelo Hostinger)
   - Senha: (fornecida pelo Hostinger)
3. Arraste todos os arquivos de `dist/` para `public_html/`

### 6. Verifique a Estrutura Final

No `public_html/` você deve ter:

```
public_html/
├── .htaccess          ✅
├── index.html         ✅
└── assets/
    ├── index-aLRq3McW.css   ✅
    └── index-D3J3IKxT.js    ✅
```

### 7. Teste o Site

Acesse seu domínio: `https://seudominio.com`

**Teste as funcionalidades:**
- ✅ Página inicial carrega
- ✅ Login funciona
- ✅ Roteamento funciona (navegação entre páginas)
- ✅ API conecta ao backend do Railway

### 8. Se algo não funcionar...

**Problema: Página em branco**
- Solução: Verifique se `index.html` está na raiz
- Abra o Console do navegador (F12) e veja os erros

**Problema: Erro 404 nas rotas**
- Solução: Verifique se o `.htaccess` foi enviado corretamente
- Ele pode estar oculto - ative "Mostrar arquivos ocultos" no File Manager

**Problema: CSS/JS não carrega**
- Solução: Verifique se a pasta `assets/` foi enviada com os arquivos dentro
- Limpe o cache do navegador (Ctrl+Shift+R)

**Problema: API não conecta**
- Solução: Verifique se o build foi feito com `VITE_API_URL` correto
- A variável deve estar em `frontend/.env.production`:
  ```
  VITE_API_URL=https://backend-production-60f8.up.railway.app
  ```
- Se não estiver, faça `npm run build` novamente

## ✅ Checklist Final

Antes de considerar concluído, teste:

- [ ] Domínio carrega a página inicial
- [ ] Login funciona (teste com catarina@email.com)
- [ ] Navegação entre páginas funciona
- [ ] Teste de inteligências carrega
- [ ] Resultados aparecem corretamente
- [ ] Perfil do usuário carrega
- [ ] Avatar do usuário aparece
- [ ] Console do navegador não tem erros críticos

## 🔄 Para Atualizar o Site

Sempre que fizer mudanças no código:

1. **Build novamente:**
   ```bash
   cd E:\Bruna\frontend
   npm run build
   ```

2. **Upload dos novos arquivos:**
   - Faça upload de todo o conteúdo de `dist/` novamente
   - Sobrescreva os arquivos antigos

3. **Limpe o cache:**
   - No navegador: Ctrl+Shift+R
   - Pode levar alguns minutos para atualizar

## 📝 Notas Importantes

- ⚠️ O `.htaccess` é **essencial** para o roteamento do React Router funcionar
- ⚠️ A pasta `assets/` deve estar na mesma estrutura que está no `dist/`
- ⚠️ Não renomeie os arquivos JS/CSS - eles têm hash único gerado pelo Vite
- ✅ O backend continua no Railway - não precisa mexer nele
- ✅ O admin também fica no Railway - apenas o frontend vai pro Hostinger

## 🌐 URLs Finais

Após o upload:

- **Frontend**: `https://seudominio.com` ← No Hostinger
- **Admin**: `https://admin-production-08fa.up.railway.app` ← No Railway
- **Backend**: `https://backend-production-60f8.up.railway.app` ← No Railway

---

✅ **Pronto! Seu frontend está no Hostinger e conectado ao backend do Railway!**
