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

// Obtém a ação
$action = isset($_POST['action']) ? trim($_POST['action']) : '';

// Configuração da conexão com o banco de dados
$host = 'localhost';
$dbname = 'aluguel_itens';
$username = 'root';
$password = 'joao01';

try {
    // Conexão PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // CARREGAR ESTATÍSTICAS DO DASHBOARD
    if ($action === 'dashboard-stats') {
        $sqlProducts = "SELECT COUNT(*) as total FROM produtos WHERE status = 'available'";
        $sqlOrders = "SELECT COUNT(*) as total FROM aluguel WHERE MONTH(data_aluguel) = MONTH(NOW()) AND YEAR(data_aluguel) = YEAR(NOW())";
        $sqlRevenue = "SELECT SUM(valor_total) as total FROM aluguel WHERE MONTH(data_aluguel) = MONTH(NOW()) AND YEAR(data_aluguel) = YEAR(NOW())";
        $sqlRatings = "SELECT COUNT(*) as total FROM avaliacao";

        $stmtProducts = $pdo->query($sqlProducts);
        $stmtOrders = $pdo->query($sqlOrders);
        $stmtRevenue = $pdo->query($sqlRevenue);
        $stmtRatings = $pdo->query($sqlRatings);

        $productsCount = $stmtProducts->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
        $ordersCount = $stmtOrders->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
        $revenueTotal = $stmtRevenue->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
        $ratingsCount = $stmtRatings->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

        echo json_encode([
            'success' => true,
            'data' => [
                'products' => (int)$productsCount,
                'orders' => (int)$ordersCount,
                'revenue' => (float)$revenueTotal,
                'ratings' => (int)$ratingsCount
            ]
        ]);
    }
    
    // CARREGAR ATIVIDADES RECENTES
    elseif ($action === 'recent-activities') {
        $sql = "SELECT id, nome, descricao, criado_em, tipo FROM atividades ORDER BY criado_em DESC LIMIT 3";
        $stmt = $pdo->query($sql);
        $atividades = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $atividades
        ]);
    }

    // CARREGAR PRODUTOS MAIS ALUGADOS
    elseif ($action === 'top-rented-products') {
        $sql = "SELECT p.nome, COUNT(a.id) as aluguel_count 
                FROM produtos p 
                LEFT JOIN aluguel a ON p.id = a.produto_id 
                GROUP BY p.id 
                ORDER BY aluguel_count DESC 
                LIMIT 5";
        $stmt = $pdo->query($sql);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $products
        ]);
    }

    // CARREGAR RECEITA POR CATEGORIA
    elseif ($action === 'revenue-by-category') {
        $sql = "SELECT p.categoria, SUM(a.valor_total) as revenue 
                FROM produtos p 
                LEFT JOIN aluguel a ON p.id = a.produto_id 
                GROUP BY p.categoria";
        $stmt = $pdo->query($sql);
        $revenues = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $revenues
        ]);
    }

    // CARREGAR TODOS OS PEDIDOS
    elseif ($action === 'orders') {
        $sql = "SELECT a.id, u.first_name, u.last_name, p.nome as produto, a.data_aluguel, a.data_devolucao, a.valor_total, a.status 
                FROM aluguel a 
                JOIN usuarios u ON a.usuario_id = u.id 
                JOIN produtos p ON a.produto_id = p.id 
                ORDER BY a.data_aluguel DESC";
        $stmt = $pdo->query($sql);
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $pedidos
        ]);
    }

    // CARREGAR INFORMAÇÕES DO PARCEIRO/ADMIN (USUÁRIO LOGADO)
    elseif ($action === 'partner-info') {
        // Obter informações do usuário logado da tabela usuarios
        $sql = "SELECT id, first_name, last_name, email, telefone FROM usuarios WHERE id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $_SESSION['user_id']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
            // Combinar nome
            $nomeCompleto = trim($usuario['first_name'] . ' ' . $usuario['last_name']);
            
            $parceiro = [
                'id' => $usuario['id'],
                'nome' => $nomeCompleto,
                'cnpj' => '', // Vazio por padrão
                'email' => $usuario['email'],
                'telefone' => $usuario['telefone'] ?? '',
                'descricao' => '',
                'endereco' => ''
            ];

            // Tentar carregar dados adicionais do arquivo JSON (se existir)
            $configFile = __DIR__ . '/config/partner_config_' . $_SESSION['user_id'] . '.json';
            if (file_exists($configFile)) {
                $jsonData = json_decode(file_get_contents($configFile), true);
                if ($jsonData) {
                    $parceiro = array_merge($parceiro, $jsonData);
                }
            }

            echo json_encode([
                'success' => true,
                'data' => $parceiro
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Usuário não encontrado.'
            ]);
        }
    }

    else {
        echo json_encode([
            'success' => false,
            'message' => 'Ação não reconhecida.'
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
