<?php
session_start();

// Verifica se está logado
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Usuário não autenticado.'
    ]);
    exit;
}

// Apenas aceita requisições POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido.'
    ]);
    exit;
}

// Obtém o ID do usuário logado da sessão
$userId = (int)$_SESSION['user_id'];

// Valida e sanitiza os dados
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$birthdate = isset($_POST['birthdate']) ? trim($_POST['birthdate']) : '';

// Validações básicas
$erros = [];

if (empty($name)) {
    $erros[] = 'Nome é obrigatório.';
}

if (empty($email)) {
    $erros[] = 'E-mail é obrigatório.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erros[] = 'E-mail inválido.';
}

if (!empty($birthdate)) {
    // Valida o formato DD/MM/YYYY e converte para YYYY-MM-DD
    if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $birthdate, $matches)) {
        $day = $matches[1];
        $month = $matches[2];
        $year = $matches[3];
        
        if (!checkdate($month, $day, $year)) {
            $erros[] = 'Data de nascimento inválida.';
        } else {
            $birthdate = "$year-$month-$day";
        }
    } else {
        $erros[] = 'Data de nascimento deve estar no formato DD/MM/YYYY.';
    }
}

// Se houver erros de validação, retorna
if (!empty($erros)) {
    echo json_encode([
        'success' => false,
        'message' => implode(' ', $erros)
    ]);
    exit;
}

// Separa o nome em first_name e last_name
$nameParts = explode(' ', $name, 2);
$firstName = $nameParts[0];
$lastName = isset($nameParts[1]) ? $nameParts[1] : '';

// Configuração da conexão com o banco de dados
$host = 'localhost';
$dbname = 'aluguel_itens';
$username = 'root';
$password = 'joao01';

try {
    // Conexão PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Prepara a query de atualização
    $sql = "UPDATE usuarios SET 
            first_name = :first_name, 
            last_name = :last_name, 
            email = :email, 
            telefone = :phone, 
            birthday = :birthday 
            WHERE id = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':first_name', $firstName);
    $stmt->bindParam(':last_name', $lastName);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':birthday', $birthdate);
    $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
    
    // Executa a atualização
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Informações atualizadas com sucesso!'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Nenhuma alteração foi feita.'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao atualizar as informações.'
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro no banco de dados: ' . $e->getMessage()
    ]);
}
?>
