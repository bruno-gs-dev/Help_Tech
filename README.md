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
git clone https://github.com/bruno-gs-dev/Help_Tech.git
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

    **⚠️ IMPORTANTE (Segurança):**

    1.  **Credenciais do Banco**: Nunca commite senhas reais no código. Para produção, utilize variáveis de ambiente (arquivo `.env`). Exemplo de `.env`:
        ```
        DB_HOST=localhost
        DB_USER=seu_usuario
        DB_PASSWORD=sua_senha
        DB_NAME=aluguel_itens
        ```
    2.  **Senhas de Usuários**: O código atual de exemplo armazena senhas em texto plano para fins didáticos. **Para produção, é obrigatório utilizar hash de senhas**.
        *   Ao registrar: use `password_hash($password, PASSWORD_DEFAULT)`.
        *   Ao logar: use `password_verify($senha_informada, $hash_banco)`.

### 3. Executando o Projeto

Se você tiver o PHP instalado, pode iniciar um servidor local rapidamente na raiz do projeto:

```bash
php -S localhost:8000
```

Acesse `http://localhost:8000` no seu navegador.

---

**Nota**: O arquivo `products.json` contém dados de exemplo para popular o catálogo na página inicial. Certifique-se de que ele esteja presente na raiz do projeto.
