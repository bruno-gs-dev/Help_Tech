<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Conexão com o banco
$host = 'localhost';
$dbname = 'aluguel_itens';
$username = 'root';
$password = 'joao01';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Buscar todos os produtos
    $sql = "SELECT * FROM produtos ORDER BY id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatar os produtos para o formato esperado pelo main.js
    $produtosFormatados = [];
    foreach ($produtos as $produto) {
        $produtosFormatados[] = [
            'id' => (int)$produto['id'],
            'name' => $produto['nome_produto'],
            'category' => $produto['categoria'],
            'price' => (float)$produto['preco_por_dia'],
            'period' => 'dia',
            'status' => $produto['status'],
            'description' => $produto['descricao'],
            'image' => $produto['imagem'],
            'rating' => (float)$produto['avaliacao'],
            'reviews' => 0 // Pode ser adicionado posteriormente
        ];
    }
    
    echo json_encode($produtosFormatados);
} catch (PDOException $e) {
    echo json_encode(['erro' => $e->getMessage()]);
}
?>
