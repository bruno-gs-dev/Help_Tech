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

// Obtém o ID do usuário logado da sessão
$userId = (int)$_SESSION['user_id'];

// Configuração da conexão com o banco de dados
$host = 'localhost';
$dbname = 'aluguel_itens';
$username = 'root';
$password = 'joao01';

try {
    // Conexão PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Busca as informações do usuário (removido a vírgula extra após 'password')
    $sql = "SELECT id, first_name, last_name, birthday, email, telefone, password FROM usuarios WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    
    // Verifica se o usuário foi encontrado
    if ($stmt->rowCount() > 0) {
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Formata a data de nascimento para o formato correto (Y-m-d para o input date)
        $dataNascimento = '';
        if (!empty($usuario['birthday'])) {
            // Se a data está em formato d-m-Y, converte para Y-m-d
            $dataNascimento = date('Y-m-d', strtotime($usuario['birthday']));
        }
        
        // Combina first_name e last_name
        $nomeCompleto = trim(($usuario['first_name'] ?? '') . ' ' . ($usuario['last_name'] ?? ''));
        
        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $usuario['id'],
                'name' => $nomeCompleto,
                'first_name' => $usuario['first_name'] ?? '',
                'last_name' => $usuario['last_name'] ?? '',
                'birthdate' => $dataNascimento,
                'email' => $usuario['email'] ?? '',
                'phone' => $usuario['telefone'] ?? '',
                // 'profilePic' => 'https://via.placeholder.com/150'
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Usuário não encontrado.'
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
