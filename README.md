# HelPTech! - Plataforma de Aluguel de Equipamentos

Bem-vindo ao **HelPTech!**, uma plataforma moderna e responsiva para aluguel de equipamentos tecnológicos. Este projeto permite que usuários naveguem por um catálogo de produtos, filtrem por categoria e disponibilidade, adicionem itens ao carrinho e simulem o processo de aluguel.

## 🚀 Funcionalidades

### Frontend (Público)
*   **Catálogo de Produtos**: Visualização de produtos em grid com informações detalhadas (imagem, preço, avaliação, status).
*   **Filtros Avançados**:
    *   Por categoria (Notebooks, Câmeras, Videogames, Smartphones, Áudio).
    *   Por disponibilidade (Disponível/Alugado).
    *   Por faixa de preço.
    *   Busca textual.
*   **Ordenação**: Relevância, Preço (crescente/decrescente), Nome (A-Z).
*   **Cálculo de Preço Dinâmico**: O preço é calculado automaticamente com base na quantidade e no período selecionado (dias, semanas, meses), com descontos progressivos.
*   **Carrinho de Compras**: Adição/remoção de itens, ajuste de quantidade, visualização do total.
*   **Interface Responsiva**: Design moderno utilizando Tailwind CSS, adaptável a dispositivos móveis e desktops.

### Autenticação & Backend
*   **Login**: Sistema de autenticação de usuários.
*   **Registro**: Cadastro de novos usuários com validação de campos.
*   **Recuperação de Senha**: Página para recuperação de acesso.
*   **Dashboard**: Área logada para usuários (estrutura preparada).

## 🛠️ Tecnologias Utilizadas

*   **Frontend**:
    *   HTML5
    *   CSS3 (Tailwind CSS via CDN)
    *   JavaScript (ES6+)
*   **Backend**:
    *   PHP (Nativo)
*   **Banco de Dados**:
    *   MySQL
*   **Dados Estáticos**:
    *   JSON (`products.json` para o catálogo frontend)

## 📂 Estrutura do Projeto

```
/
├── index.html              # Página inicial (Landing Page / Catálogo)
├── main.js                 # Lógica principal do frontend (Carrinho, Filtros, JSON)
├── style.css               # Estilos personalizados
├── products.json           # Base de dados de produtos para o frontend
├── login/                  # Página e scripts de Login
│   ├── index.php
│   └── script_login.php
├── register/               # Página e scripts de Registro
│   ├── index.php
│   └── script_registro.php
├── forgot-password/        # Recuperação de senha
├── dashboard_logged/       # Área do usuário logado
└── img/                    # Imagens do projeto
```

## 📋 Pré-requisitos

Para rodar o projeto completo (incluindo autenticação), você precisará de:

*   Um servidor web com suporte a PHP (ex: Apache, Nginx, ou servidor embutido do PHP).
*   Banco de Dados MySQL.

Para rodar apenas a interface (catálogo e carrinho), basta um navegador web moderno, pois o frontend consome `products.json`.

## 🔧 Instalação e Configuração

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/helptech.git
cd helptech
```

### 2. Configuração do Banco de Dados (Para Login/Registro)

1.  Crie um banco de dados MySQL chamado `aluguel_itens`.
2.  Crie a tabela `usuarios` com a seguinte estrutura (baseado no código PHP):

```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    password VARCHAR(255) NOT NULL, -- Nota: O código atual usa senha em texto plano (não recomendado para produção)
    genero VARCHAR(20),
    birthday DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3.  Configure as credenciais do banco de dados nos arquivos:
    *   `login/script_login.php`
    *   `register/script_registro.php`

    Por padrão, está configurado como:
    *   Host: `localhost` ou `127.0.0.1`
    *   Usuário: `root`
    *   Senha: `joao01`
    *   Banco: `aluguel_itens`

### 3. Executando o Projeto

Se você tiver o PHP instalado, pode iniciar um servidor local rapidamente na raiz do projeto:

```bash
php -S localhost:8000
```

Acesse `http://localhost:8000` no seu navegador.

---

**Nota**: O arquivo `products.json` contém dados de exemplo para popular o catálogo na página inicial. Certifique-se de que ele esteja presente na raiz do projeto.

## 🔁 Integração com Supabase (API)

Adicionei uma implementação serverless em `api/products.js` que usa o cliente do Supabase para CRUD da tabela `products`.

Passos rápidos para configurar localmente (PowerShell):

1. Instale dependências:

```powershell
npm install
```

2. Defina as variáveis de ambiente (exemplo no PowerShell):

```powershell
$env:SUPABASE_URL = "https://seu-projeto.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "sua_service_role_key_aqui"
```

Nota: Para ambiente de produção (Vercel), defina `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` nas Environment Variables ou Secrets do provedor. Use a Service Role Key apenas em funções server-side (não em código cliente).

3. Teste as rotas:

- `GET /api/products` — lista todos os produtos.
- `GET /api/products?id=<uuid>` — obtém um produto por `id`.
- `POST /api/products` — cria um produto (body JSON com os campos da tabela `products`).
- `PUT /api/products?id=<uuid>` — atualiza um produto (body JSON com campos a alterar).
- `DELETE /api/products?id=<uuid>` — deleta um produto.

Os retornos seguem o formato `{ success: boolean, data?: ..., message?: string, error?: string }`.
