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
    
    // ADICIONAR PRODUTO
    if ($action === 'add') {
        $name = isset($_POST['name']) ? trim($_POST['name']) : '';
        $category = isset($_POST['category']) ? trim($_POST['category']) : '';
        $price = isset($_POST['price']) ? floatval($_POST['price']) : 0;
        $status = isset($_POST['status']) ? trim($_POST['status']) : 'available';
        $rating = isset($_POST['rating']) ? floatval($_POST['rating']) : 0;
        $description = isset($_POST['description']) ? trim($_POST['description']) : '';
        $image = isset($_POST['image']) ? trim($_POST['image']) : '';

        // Validações
        $erros = [];
        if (empty($name)) $erros[] = 'Nome é obrigatório.';
        if (empty($category)) $erros[] = 'Categoria é obrigatória.';
        if ($price <= 0) $erros[] = 'Preço deve ser maior que 0.';
        if (empty($description)) $erros[] = 'Descrição é obrigatória.';
        if (empty($image)) $erros[] = 'URL da imagem é obrigatória.';

        if (!empty($erros)) {
            echo json_encode([
                'success' => false,
                'message' => implode(' ', $erros)
            ]);
            exit;
        }

        $sql = "INSERT INTO produtos (nome, categoria, preco, status, avaliacao, descricao, imagem, criado_em) 
                VALUES (:name, :category, :price, :status, :rating, :description, :image, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':rating', $rating);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':image', $image);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Produto adicionado com sucesso!',
                'id' => $pdo->lastInsertId()
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao adicionar produto.'
            ]);
        }
    }
    
    // EDITAR PRODUTO
    elseif ($action === 'edit') {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $name = isset($_POST['name']) ? trim($_POST['name']) : '';
        $category = isset($_POST['category']) ? trim($_POST['category']) : '';
        $price = isset($_POST['price']) ? floatval($_POST['price']) : 0;
        $status = isset($_POST['status']) ? trim($_POST['status']) : 'available';
        $rating = isset($_POST['rating']) ? floatval($_POST['rating']) : 0;
        $description = isset($_POST['description']) ? trim($_POST['description']) : '';
        $image = isset($_POST['image']) ? trim($_POST['image']) : '';

        // Validações
        $erros = [];
        if ($id <= 0) $erros[] = 'ID inválido.';
        if (empty($name)) $erros[] = 'Nome é obrigatório.';
        if (empty($category)) $erros[] = 'Categoria é obrigatória.';
        if ($price <= 0) $erros[] = 'Preço deve ser maior que 0.';
        if (empty($description)) $erros[] = 'Descrição é obrigatória.';
        if (empty($image)) $erros[] = 'URL da imagem é obrigatória.';

        if (!empty($erros)) {
            echo json_encode([
                'success' => false,
                'message' => implode(' ', $erros)
            ]);
            exit;
        }

        $sql = "UPDATE produtos SET 
                nome = :name, 
                categoria = :category, 
                preco = :price, 
                status = :status, 
                avaliacao = :rating, 
                descricao = :description, 
                imagem = :image 
                WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':rating', $rating);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':image', $image);

        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Produto atualizado com sucesso!'
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
                'message' => 'Erro ao atualizar produto.'
            ]);
        }
    }
    
    // DELETAR PRODUTO
    elseif ($action === 'delete') {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;

        if ($id <= 0) {
            echo json_encode([
                'success' => false,
                'message' => 'ID inválido.'
            ]);
            exit;
        }

        $sql = "DELETE FROM produtos WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Produto excluído com sucesso!'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Produto não encontrado.'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao excluir produto.'
            ]);
        }
    }
    
    // LISTAR PRODUTOS
    elseif ($action === 'list') {
        $sql = "SELECT id, nome, categoria, preco, status, avaliacao, descricao, imagem FROM produtos ORDER BY criado_em DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        
        $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $produtos
        ]);
    }
    
    // ATUALIZAR INFORMAÇÕES DO PARCEIRO/ADMIN
    elseif ($action === 'update-partner') {
        $nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
        $cnpj = isset($_POST['cnpj']) ? trim($_POST['cnpj']) : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $telefone = isset($_POST['telefone']) ? trim($_POST['telefone']) : '';
        $descricao = isset($_POST['descricao']) ? trim($_POST['descricao']) : '';
        $endereco = isset($_POST['endereco']) ? trim($_POST['endereco']) : '';

        // Validações
        $erros = [];
        if (empty($nome)) $erros[] = 'Nome é obrigatório.';
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $erros[] = 'Email válido é obrigatório.';

        if (!empty($erros)) {
            echo json_encode([
                'success' => false,
                'message' => implode(' ', $erros)
            ]);
            exit;
        }

        // Separar nome em first_name e last_name
        $nomeParts = explode(' ', $nome, 2);
        $firstName = $nomeParts[0];
        $lastName = isset($nomeParts[1]) ? $nomeParts[1] : '';

        // Atualizar tabela usuarios com email e telefone
        $sqlUpdate = "UPDATE usuarios SET 
                      first_name = :first_name, 
                      last_name = :last_name, 
                      email = :email, 
                      telefone = :telefone 
                      WHERE id = :user_id";
        
        $stmt = $pdo->prepare($sqlUpdate);
        $stmt->execute([
            ':first_name' => $firstName,
            ':last_name' => $lastName,
            ':email' => $email,
            ':telefone' => $telefone,
            ':user_id' => $_SESSION['user_id']
        ]);

        // Criar diretório de configuração se não existir
        $configDir = __DIR__ . '/config';
        if (!is_dir($configDir)) {
            @mkdir($configDir, 0777, true);
        }

        // Dados adicionais a salvar em JSON (CNPJ, descrição, endereço)
        $partnerData = [
            'id' => $_SESSION['user_id'],
            'nome' => $nome,
            'cnpj' => $cnpj,
            'email' => $email,
            'telefone' => $telefone,
            'descricao' => $descricao,
            'endereco' => $endereco
        ];

        // Salvar em arquivo JSON (um arquivo por usuário)
        $configFile = $configDir . '/partner_config_' . $_SESSION['user_id'] . '.json';
        $jsonData = json_encode($partnerData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        // Tentar salvar com verificação de erro
        $writeResult = @file_put_contents($configFile, $jsonData);
        
        if ($writeResult !== false) {
            echo json_encode([
                'success' => true,
                'message' => 'Configurações atualizadas com sucesso!'
            ]);
        } else {
            // Se falhar em salvar o arquivo JSON, pelo menos os dados foram salvos no banco
            echo json_encode([
                'success' => true,
                'message' => 'Informações de perfil atualizadas com sucesso!'
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
