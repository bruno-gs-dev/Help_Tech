# 🚀 Guia de Deploy na Vercel - HelPTech

## ✅ Alterações Realizadas

O projeto foi **convertido de PHP para Serverless Functions (Node.js)** para funcionar na Vercel.

### Arquivos Criados/Atualizados:

1. **`api/alterar_informacoes.js`** - Serverless Function para gerenciar produtos e informações do parceiro
2. **`api/capturar_informacoes.js`** - Serverless Function para buscar informações do parceiro
3. **`api/auth.js`** - Serverless Function para autenticação (já existia)
4. **`api/products.js`** - Serverless Function para produtos (já existia)
5. **`dashboard_logged/area_administrativa/area_adm.html`** - Atualizado para usar as APIs
6. **`vercel.json`** - Configuração do Vercel atualizada
7. **`.vercelignore`** - Ignora arquivos PHP no deploy

## 📋 Como Fazer o Deploy

### Opção 1: Deploy via Vercel CLI (Recomendado)

1. **Instale o Vercel CLI** (se ainda não tiver):
```bash
npm install -g vercel
```

2. **Faça login na Vercel**:
```bash
vercel login
```

3. **Deploy do projeto**:
```bash
cd c:\Users\Bruno\Downloads\Help_Tech
vercel
```

4. **Para deploy em produção**:
```bash
vercel --prod
```

### Opção 2: Deploy via Dashboard da Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta
3. Clique em **"Add New Project"**
4. Importe o repositório Git ou faça upload dos arquivos
5. A Vercel detectará automaticamente a configuração do `vercel.json`
6. Clique em **"Deploy"**

## 🔧 Configuração

### Variáveis de Ambiente (Opcional)

Se você quiser adicionar um banco de dados no futuro, configure as variáveis de ambiente na Vercel:

1. Vá em **Settings** > **Environment Variables**
2. Adicione suas variáveis (ex: `DATABASE_URL`, `API_KEY`, etc.)

## 📝 Notas Importantes

### ⚠️ Limitações Atuais

- **Sem banco de dados**: As Serverless Functions retornam dados mockados (exemplo)
- **Produtos**: Ainda carregam do `products.json` (arquivo estático)
- **Autenticação**: Usa credenciais hardcoded (admin@helptech.com / admin123)

### 🔄 Próximos Passos Recomendados

Para ter um sistema completo em produção, você precisará:

1. **Adicionar um Banco de Dados**:
   - **Vercel Postgres** (integração nativa)
   - **MongoDB Atlas** (gratuito)
   - **Supabase** (gratuito)
   - **PlanetScale** (MySQL serverless)

2. **Implementar Autenticação Real**:
   - JWT tokens
   - NextAuth.js
   - Clerk
   - Auth0

3. **Atualizar as Serverless Functions** para conectar com o banco de dados

## 🌐 URLs Após o Deploy

Após o deploy, sua aplicação estará disponível em:

- **Produção**: `https://seu-projeto.vercel.app`
- **Preview**: URLs geradas automaticamente para cada commit

### Rotas Principais:

- `/` - Página inicial
- `/login` - Login
- `/register` - Registro
- `/dashboard_logged` - Dashboard
- `/dashboard_logged/area_administrativa` - Área administrativa
- `/api/auth` - API de autenticação
- `/api/products` - API de produtos
- `/api/alterar_informacoes` - API para alterar informações
- `/api/capturar_informacoes` - API para capturar informações

## 🐛 Troubleshooting

### Erro: "Function not found"
- Verifique se os arquivos em `api/` têm a extensão `.js`
- Confirme que o `vercel.json` está configurado corretamente

### Erro: "CORS"
- As Serverless Functions já incluem headers CORS
- Se persistir, adicione `Access-Control-Allow-Origin: *` nas respostas

### Erro: "404 Not Found"
- Verifique se os arquivos HTML existem nos caminhos corretos
- Confirme os `rewrites` no `vercel.json`

## 📚 Documentação Útil

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Configuration](https://vercel.com/docs/projects/project-configuration)
- [Vercel CLI](https://vercel.com/docs/cli)

---

**Desenvolvido com ❤️ para HelPTech**
