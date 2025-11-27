# 🚀 Deploy na Vercel - Help_Tech

## ✅ Preparação Concluída

Seu projeto foi preparado para deploy na Vercel! As seguintes alterações foram feitas:

### Arquivos Criados/Modificados:
- ✅ `vercel.json` - Configuração de rotas e rewrites
- ✅ `.gitignore` - Arquivos a serem ignorados
- ✅ Arquivos `.php` convertidos para `.html` (páginas estáticas)
- ✅ Links atualizados no `index.html`

---

## 📋 Passos para Deploy

### 1️⃣ **Instalar Vercel CLI** (Opcional)
```bash
npm install -g vercel
```

### 2️⃣ **Fazer Deploy via GitHub** (Recomendado)

#### Opção A: Via GitHub (Mais Fácil)
1. Crie um repositório no GitHub
2. Faça push do seu código:
   ```bash
   git add .
   git commit -m "Preparado para deploy na Vercel"
   git push origin main
   ```
3. Acesse [vercel.com](https://vercel.com)
4. Clique em "Add New Project"
5. Importe seu repositório do GitHub
6. A Vercel detectará automaticamente as configurações
7. Clique em "Deploy"

#### Opção B: Via Vercel CLI
```bash
cd c:\Users\Bruno\Downloads\Help_Tech
vercel
```

---

## ⚠️ IMPORTANTE: Limitações do Deploy Atual

### O que FUNCIONA na Vercel:
- ✅ Página inicial (index.html)
- ✅ Catálogo de produtos
- ✅ Filtros e busca
- ✅ Carrinho de compras (frontend)
- ✅ Páginas de login/registro (interface)
- ✅ Área administrativa (interface)

### O que NÃO funciona (precisa de backend):
- ❌ Autenticação real (login/registro)
- ❌ Salvamento de dados no banco
- ❌ Processamento de pagamentos
- ❌ Gerenciamento de produtos (adicionar/editar/excluir)

---

## 🔧 Para Funcionalidade Completa

Você tem 3 opções:

### **Opção 1: Backend Separado (Recomendado)**
- Frontend na Vercel (HTML/CSS/JS)
- Backend em outro serviço que suporta PHP:
  - [Railway.app](https://railway.app) (suporta PHP)
  - [Heroku](https://heroku.com) (suporta PHP)
  - [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)

### **Opção 2: Converter para Next.js**
- Migrar todo o projeto para Next.js
- Usar API Routes do Next.js
- Usar banco de dados serverless (Vercel Postgres, Supabase, etc.)

### **Opção 3: Usar Firebase/Supabase**
- Manter frontend na Vercel
- Usar Firebase ou Supabase para:
  - Autenticação
  - Banco de dados
  - Storage de arquivos

---

## 🎯 Deploy Rápido (Apenas Frontend)

Se você quer fazer deploy AGORA apenas do frontend:

```bash
# 1. Certifique-se de estar no diretório do projeto
cd c:\Users\Bruno\Downloads\Help_Tech

# 2. Inicialize o Git (se ainda não fez)
git init
git add .
git commit -m "Initial commit"

# 3. Crie um repositório no GitHub e faça push
# (siga as instruções do GitHub)

# 4. Conecte na Vercel via GitHub
# Acesse vercel.com e importe o repositório
```

---

## 📝 Próximos Passos Recomendados

1. **Testar localmente**: Abra `http://localhost:8000/index.html` (servidor Python já está rodando)
2. **Fazer deploy do frontend**: Siga os passos acima
3. **Decidir sobre o backend**: Escolha uma das opções para funcionalidade completa
4. **Configurar banco de dados**: Se optar por backend separado

---

## 🆘 Precisa de Ajuda?

- Documentação Vercel: https://vercel.com/docs
- Suporte Vercel: https://vercel.com/support

---

**Status Atual**: ✅ Pronto para deploy do frontend na Vercel
**Funcionalidade**: 🟡 Parcial (apenas interface, sem backend)
