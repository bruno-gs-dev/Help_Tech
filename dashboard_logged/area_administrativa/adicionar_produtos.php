<<?php
header('Content-Type: application/json');

// Conexão com o banco
$host = 'localhost';
$dbname = 'aluguel_itens';
$username = 'root';
$password = 'joao01';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Receber dados do front-end
    $data = json_decode(file_get_contents("php://input"), true);

    // Validar campos obrigatórios
    if (
        !isset($data['nome_produto']) || !isset($data['categoria']) ||
        !isset($data['preco_por_dia']) || !isset($data['status']) ||
        !isset($data['avaliacao']) || !isset($data['descricao']) ||
        !isset($data['imagem'])
    ) {
        echo json_encode(['erro' => 'Campos obrigatórios ausentes']);
        exit;
    }

    // Inserir no banco
    $sql = "INSERT INTO produtos (nome_produto, categoria, preco_por_dia, status, avaliacao, descricao, imagem)
            VALUES (:nome_produto, :categoria, :preco_por_dia, :status, :avaliacao, :descricao, :imagem)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nome_produto' => $data['nome_produto'],
        ':categoria' => $data['categoria'],
        ':preco_por_dia' => $data['preco_por_dia'],
        ':status' => $data['status'],
        ':avaliacao' => $data['avaliacao'],
        ':descricao' => $data['descricao'],
        ':imagem' => $data['imagem']
    ]);

    echo json_encode(['sucesso' => 'Produto inserido com sucesso']);
} catch (PDOException $e) {
    echo json_encode(['erro' => $e->getMessage()]);
}
?>
