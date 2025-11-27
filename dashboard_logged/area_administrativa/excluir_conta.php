<?php
// Configuração da conexão com o banco de dados
$host = 'localhost';
$dbname = 'aluguel_itens';
$username = 'root';
$password = 'joao01';

try {
    // Conexão PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verifica se o ID foi enviado
    if (isset($_POST['id']) && !empty($_POST['id'])) {
        $id = $_POST['id'];
        
        // Prepara a query de exclusão
        $sql = "DELETE FROM usuário WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        
        // Executa a exclusão
        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Conta excluída com sucesso!'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Nenhuma conta encontrada com este ID.'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao excluir a conta.'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'ID não fornecido.'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro no banco de dados: ' . $e->getMessage()
    ]);
}
?>