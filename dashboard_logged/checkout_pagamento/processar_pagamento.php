<?php
header('Content-Type: application/json');
session_start();

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Dados da requisição
$nome_completo = isset($_POST['nome_completo']) ? trim($_POST['nome_completo']) : '';
$cpf = isset($_POST['cpf']) ? trim($_POST['cpf']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$telefone = isset($_POST['telefone']) ? trim($_POST['telefone']) : '';
$endereco = isset($_POST['endereco']) ? trim($_POST['endereco']) : '';
$numero = isset($_POST['numero']) ? trim($_POST['numero']) : '';
$complemento = isset($_POST['complemento']) ? trim($_POST['complemento']) : '';
$cep = isset($_POST['cep']) ? trim($_POST['cep']) : '';
$metodo_pagamento = isset($_POST['metodo_pagamento']) ? trim($_POST['metodo_pagamento']) : '';
$valor_total = isset($_POST['valor_total']) ? floatval($_POST['valor_total']) : 0;

// Validações básicas
$erros = [];
if (empty($nome_completo)) $erros[] = 'Nome completo é obrigatório';
if (empty($cpf)) $erros[] = 'CPF é obrigatório';
if (empty($email)) $erros[] = 'Email é obrigatório';
if (empty($metodo_pagamento)) $erros[] = 'Método de pagamento é obrigatório';
if ($valor_total <= 0) $erros[] = 'Valor inválido';

if (!empty($erros)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => implode(', ', $erros)
    ]);
    exit;
}

// Conexão com banco de dados
$host = 'localhost';
$dbname = 'aluguel_itens';
$username = 'root';
$password = 'joao01';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Gerar ID único para o pagamento
    $pagamento_id = 'PAG_' . date('YmdHis') . '_' . rand(1000, 9999);
    $status_pagamento = 'pendente';
    $data_criacao = date('Y-m-d H:i:s');

    // Processar conforme o método de pagamento
    $response = [];

    if ($metodo_pagamento === 'pix') {
        // Gerar PIX
        $response = gerarPix($valor_total, $pagamento_id, $email);
        $status_pagamento = 'aguardando_confirmacao';
    } 
    elseif ($metodo_pagamento === 'boleto') {
        // Gerar Boleto
        $response = gerarBoleto($valor_total, $pagamento_id, $cpf);
        $status_pagamento = 'aguardando_confirmacao';
    } 
    elseif ($metodo_pagamento === 'credit') {
        // Processar Cartão de Crédito
        $numero_cartao = isset($_POST['numero_cartao']) ? trim($_POST['numero_cartao']) : '';
        $nome_cartao = isset($_POST['nome_cartao']) ? trim($_POST['nome_cartao']) : '';
        $validade = isset($_POST['validade']) ? trim($_POST['validade']) : '';
        $cvv = isset($_POST['cvv']) ? trim($_POST['cvv']) : '';

        if (empty($numero_cartao) || empty($cvv)) {
            throw new Exception('Dados do cartão incompletos');
        }

        $response = processarCartao($valor_total, $numero_cartao, $nome_cartao, $validade, $cvv, $pagamento_id);
        $status_pagamento = $response['success'] ? 'aprovado' : 'recusado';
    } 
    elseif ($metodo_pagamento === 'transfer') {
        // Transferência bancária
        $response = gerarDadosTransferencia($valor_total, $pagamento_id);
        $status_pagamento = 'aguardando_confirmacao';
    }
    else {
        throw new Exception('Método de pagamento inválido');
    }

    // Salvar pagamento no banco de dados
    $sql = "INSERT INTO pagamentos (
                id_pagamento, usuario_id, valor, metodo, status, 
                nome, cpf, email, telefone, endereco, numero, complemento, cep,
                dados_resposta, criado_em
            ) VALUES (
                :id_pagamento, :usuario_id, :valor, :metodo, :status,
                :nome, :cpf, :email, :telefone, :endereco, :numero, :complemento, :cep,
                :dados_resposta, :criado_em
            )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id_pagamento' => $pagamento_id,
        ':usuario_id' => $_SESSION['user_id'] ?? null,
        ':valor' => $valor_total,
        ':metodo' => $metodo_pagamento,
        ':status' => $status_pagamento,
        ':nome' => $nome_completo,
        ':cpf' => $cpf,
        ':email' => $email,
        ':telefone' => $telefone,
        ':endereco' => $endereco,
        ':numero' => $numero,
        ':complemento' => $complemento,
        ':cep' => $cep,
        ':dados_resposta' => json_encode($response),
        ':criado_em' => $data_criacao
    ]);

    // Retornar resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Pagamento processado com sucesso',
        'pagamento_id' => $pagamento_id,
        'valor' => number_format($valor_total, 2, ',', '.'),
        'metodo' => $metodo_pagamento,
        'qr_code' => $response['qr_code'] ?? null,
        'boleto_url' => $response['boleto_url'] ?? null,
        'chave_pix' => $response['chave_pix'] ?? null,
        'status' => $status_pagamento
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao processar pagamento: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// ============ FUNÇÕES DE GERAÇÃO DE PAGAMENTO ============

function gerarPix($valor, $id_pagamento, $email) {
    // Gerar dados PIX (simulado - em produção use API real)
    $chave_pix = gerar_chave_pix();
    
    // Simular QR Code (em produção use biblioteca como "phpqrcode" ou chamar API)
    $qr_code_data = "00020126580014br.gov.bcb.brcode01051.0.0" .
                    "52040014br.gov.bcb.pix01366f6e67a83-d3bb-4b5c-a8d4-" .
                    md5($email . time()) .
                    "5204000053039865406" .
                    sprintf("%010.2f", $valor) .
                    "5802BR5913" .
                    "6009HELPTECH" .
                    "62410503***63047D5D";

    // Gerar QR Code em formato PNG (usando API online simulado)
    $qr_code_url = "data:image/svg+xml," . 
        urlencode('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="white" width="200" height="200"/><text x="50" y="100" font-size="20" fill="black">PIX QRCode</text><text x="60" y="130" font-size="12" fill="gray">' . substr($chave_pix, 0, 12) . '...</text></svg>');

    return [
        'success' => true,
        'qr_code' => $qr_code_url,
        'chave_pix' => $chave_pix,
        'expiracao_minutos' => 30,
        'id_pagamento' => $id_pagamento
    ];
}

function gerarBoleto($valor, $id_pagamento, $cpf) {
    // Gerar dados do boleto (simulado)
    $codigo_barras = gerar_codigo_barras($valor);
    $linha_digitavel = gerar_linha_digitavel($codigo_barras);
    
    // Simular URL de download do boleto
    $boleto_url = "boleto.php?id=" . urlencode($id_pagamento) . "&valor=" . urlencode($valor);

    return [
        'success' => true,
        'boleto_url' => $boleto_url,
        'codigo_barras' => $codigo_barras,
        'linha_digitavel' => $linha_digitavel,
        'vencimento' => date('d/m/Y', strtotime('+3 days')),
        'id_pagamento' => $id_pagamento
    ];
}

function processarCartao($valor, $numero_cartao, $nome_cartao, $validade, $cvv, $id_pagamento) {
    // Validação básica do cartão
    if (!validar_numero_cartao($numero_cartao)) {
        return ['success' => false, 'message' => 'Número de cartão inválido'];
    }

    if (strlen($cvv) < 3 || strlen($cvv) > 4) {
        return ['success' => false, 'message' => 'CVV inválido'];
    }

    // Aqui você integraria com a API de sua instituição de pagamento
    // Para este exemplo, vamos simular uma aprovação de 90%
    $aprovado = rand(1, 100) <= 90;

    return [
        'success' => $aprovado,
        'message' => $aprovado ? 'Cartão aprovado' : 'Cartão recusado',
        'ultimos_4_digitos' => substr($numero_cartao, -4),
        'id_pagamento' => $id_pagamento,
        'autorizacao_id' => $aprovado ? 'AUTH_' . bin2hex(random_bytes(8)) : null
    ];
}

function gerarDadosTransferencia($valor, $id_pagamento) {
    return [
        'success' => true,
        'banco' => 'HelPTech Financeira',
        'agencia' => '0001',
        'conta' => '123456-7',
        'tipo_conta' => 'Conta Corrente',
        'beneficiario' => 'HelPTech Rentals LTDA',
        'valor' => number_format($valor, 2, ',', '.'),
        'referencia' => $id_pagamento,
        'id_pagamento' => $id_pagamento
    ];
}

// ============ FUNÇÕES AUXILIARES ============

function gerar_chave_pix() {
    return bin2hex(random_bytes(16));
}

function gerar_codigo_barras($valor) {
    // Simulação simples de código de barras
    return sprintf("%05d.%05d %05d.%05d %05d.%05d %1d %14d",
        rand(10000, 99999),
        rand(10000, 99999),
        rand(10000, 99999),
        rand(10000, 99999),
        rand(10000, 99999),
        rand(10000, 99999),
        rand(1, 9),
        intval($valor * 100)
    );
}

function gerar_linha_digitavel($codigo_barras) {
    // Simulação da linha digitável
    $barras_limpo = str_replace([' ', '.'], '', $codigo_barras);
    return substr($barras_limpo, 0, 5) . '.' . substr($barras_limpo, 5, 5) . ' ' .
           substr($barras_limpo, 10, 5) . '.' . substr($barras_limpo, 15, 5) . ' ' .
           substr($barras_limpo, 20, 5) . '.' . substr($barras_limpo, 25, 5) . ' ' .
           substr($barras_limpo, 30, 1) . ' ' . substr($barras_limpo, 31);
}

function validar_numero_cartao($numero) {
    // Validar numero de cartao usando algoritmo de Luhn
    $numero = preg_replace('/\D/', '', $numero);
    if (strlen($numero) < 13 || strlen($numero) > 19) return false;

    $soma = 0;
    for ($i = 0; $i < strlen($numero); $i++) {
        $digito = intval($numero[$i]);
        if (($i % 2) == 0) {
            $digito *= 2;
            if ($digito > 9) $digito -= 9;
        }
        $soma += $digito;
    }
    return ($soma % 10) == 0;
}
?>
