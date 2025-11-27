<?php
session_start();

// Habilitar exibição de erros para debug (remover em produção)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configurações do banco de dados
$servername = "127.0.0.1";
$db_username = "root";
$db_password = "joao01";
$dbname = "aluguel_itens";

// Debug: Log de início do script
error_log("Script de login iniciado - " . date('Y-m-d H:i:s'));

// Verificar se o formulário foi enviado via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Debug: Log dos dados recebidos
    error_log("Dados POST recebidos: " . print_r($_POST, true));
    
    // Conectar ao banco de dados
    $conn = new mysqli($servername, $db_username, $db_password, $dbname);
    
    // Verificar conexão
    if ($conn->connect_error) {
        error_log("Erro de conexão com banco: " . $conn->connect_error);
        die("Conexão falhou: " . $conn->connect_error);
    }
    
    // Debug: Log de conexão bem-sucedida
    error_log("Conexão com banco estabelecida com sucesso");
    
    // Receber e sanitizar os dados do formulário
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    
    // Debug: Log dos dados sanitizados
    error_log("Email sanitizado: " . $email);
    error_log("Senha recebida: " . (empty($password) ? "VAZIA" : "PRESENTE"));
    
    // Validações básicas
    if (empty($email) || empty($password)) {
        error_log("Erro de validação: Campos vazios");
        $_SESSION['error'] = "Por favor, preencha todos os campos.";
        header("Location: index.php");
        exit();
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        error_log("Erro de validação: Email inválido - " . $email);
        $_SESSION['error'] = "Por favor, insira um email válido.";
        header("Location: index.php");
        exit();
    }
    
    // Preparar e executar a consulta para verificar o usuário
    $stmt = $conn->prepare("SELECT id, email, password, first_name, last_name FROM usuarios WHERE email = ?");
    
    if (!$stmt) {
        error_log("Erro ao preparar statement: " . $conn->error);
        $_SESSION['error'] = "Erro interno do servidor. Tente novamente.";
        header("Location: index.php");
        exit();
    }
    
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Debug: Log do resultado da consulta
    error_log("Usuários encontrados: " . $result->num_rows);
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Debug: Log dos dados do usuário (sem senha)
        error_log("Usuário encontrado - ID: " . $user['id'] . ", Email: " . $user['email'] . ", Nome: " . $user['first_name'] . " " . $user['last_name']);
        
        // Verificar a senha (comparação direta pois está em texto plano)
        if ($password === $user['password']) {
            // Login bem-sucedido
            error_log("Login bem-sucedido para usuário: " . $user['email']);
            
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
            $_SESSION['login_time'] = time();
            
            // Debug: Log da sessão criada
            error_log("Sessão criada - User ID: " . $_SESSION['user_id'] . ", Email: " . $_SESSION['user_email']);
            
            // Redirecionar para a página de dashboard
            header("Location: ../dashboard_logged/index.php");
            exit();
        } else {
            // Senha incorreta
            error_log("Senha incorreta para usuário: " . $user['email']);
            $_SESSION['error'] = "Email ou senha incorretos.";
            header("Location: index.php");
            exit();
        }
    } else {
        // Usuário não encontrado
        error_log("Usuário não encontrado para email: " . $email);
        $_SESSION['error'] = "Email ou senha incorretos.";
        header("Location: index.php");
        exit();
    }
    
    // Fechar conexões
    $stmt->close();
    $conn->close();
    
} else {
    // Se não foi enviado via POST, redirecionar para a página de login
    error_log("Acesso direto ao script sem POST - redirecionando");
    header("Location: index.php");
    exit();
}
?>