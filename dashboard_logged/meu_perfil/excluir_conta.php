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

// Configuração da conexão com o banco de dados
$host = 'localhost';
$dbname = 'aluguel_itens';
$username = 'root';
$password = 'joao01';

try {
    // Conexão PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Prepara a query de exclusão (usando o ID da sessão, não do POST)
    $sql = "DELETE FROM usuarios WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
    
    // Executa a exclusão
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            // Destroi a sessão após exclusão bem-sucedida
            session_destroy();
            echo json_encode([
                'success' => true,
                'message' => 'Conta excluída com sucesso!'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Nenhuma conta encontrada.'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao excluir a conta.'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro no banco de dados: ' . $e->getMessage()
    ]);
}
?>