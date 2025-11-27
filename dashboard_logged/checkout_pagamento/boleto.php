<?php
/**
 * Script para gerar e baixar boleto em PDF
 * Uso: boleto.php?id=PAG_xxx&valor=xxx
 */

session_start();

// Validar parâmetros
$id_pagamento = isset($_GET['id']) ? trim($_GET['id']) : '';
$valor = isset($_GET['valor']) ? floatval($_GET['valor']) : 0;

if (empty($id_pagamento) || $valor <= 0) {
    http_response_code(400);
    echo 'Parâmetros inválidos';
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

    // Buscar dados do pagamento
    $sql = "SELECT * FROM pagamentos WHERE id_pagamento = :id_pagamento";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id_pagamento' => $id_pagamento]);
    $pagamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pagamento) {
        http_response_code(404);
        echo 'Boleto não encontrado';
        exit;
    }

    // Se tiver a biblioteca FPDF instalada, gerar PDF real
    // Para este exemplo, vamos gerar um HTML que pode ser impresso
    
    header('Content-Type: text/html; charset=utf-8');
    header('Content-Disposition: attachment; filename="boleto_' . $id_pagamento . '.html"');

    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Boleto - <?php echo $id_pagamento; ?></title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: Arial, sans-serif;
                background: #f0f0f0;
                padding: 20px;
            }
            .boleto-container {
                background: white;
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                border: 2px solid #000;
                line-height: 1.4;
            }
            .boleto-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                border-bottom: 3px solid #000;
                padding-bottom: 10px;
            }
            .banco-logo {
                font-weight: bold;
                font-size: 24px;
            }
            .linha-direcao {
                font-size: 12px;
                font-weight: bold;
                text-align: right;
            }
            .codigo-barras {
                background: #fff;
                padding: 10px;
                margin: 10px 0;
                text-align: center;
                font-family: 'Courier New', monospace;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
            }
            .secao {
                margin: 20px 0;
                padding: 10px;
                border: 1px solid #ddd;
            }
            .linha-info {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                font-size: 13px;
            }
            .label {
                font-weight: bold;
                color: #333;
            }
            .valor-principal {
                font-size: 28px;
                font-weight: bold;
                color: #000;
                text-align: center;
                padding: 20px;
                border: 2px solid #000;
                margin: 10px 0;
            }
            .rodape {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="boleto-container">
            <div class="boleto-header">
                <div class="banco-logo">Banco HELPTECH</div>
                <div class="linha-direcao">
                    Recebimento de Boletos
                </div>
            </div>

            <div class="codigo-barras">
                <?php echo $pagamento['dados_resposta'] ? 
                    json_decode($pagamento['dados_resposta'], true)['codigo_barras'] ?? 'Código de barras aqui' 
                    : 'Código de barras aqui'; 
                ?>
            </div>

            <div class="secao">
                <div class="linha-info">
                    <span class="label">Beneficiário:</span>
                    <span>HelPTech Rentals LTDA - CNPJ: 00.000.000/0001-00</span>
                </div>
                <div class="linha-info">
                    <span class="label">Agência/Código:</span>
                    <span>0001 / 123456-7</span>
                </div>
            </div>

            <div class="secao">
                <div class="linha-info">
                    <span class="label">Pagador:</span>
                    <span><?php echo htmlspecialchars($pagamento['nome']); ?></span>
                </div>
                <div class="linha-info">
                    <span class="label">CPF/CNPJ:</span>
                    <span><?php echo htmlspecialchars($pagamento['cpf']); ?></span>
                </div>
                <div class="linha-info">
                    <span class="label">Endereço:</span>
                    <span><?php echo htmlspecialchars($pagamento['endereco'] . ', ' . $pagamento['numero']); ?></span>
                </div>
            </div>

            <div class="secao">
                <div class="linha-info">
                    <span class="label">Nosso Número:</span>
                    <span><?php echo htmlspecialchars($id_pagamento); ?></span>
                </div>
                <div class="linha-info">
                    <span class="label">Data do Vencimento:</span>
                    <span><?php echo date('d/m/Y', strtotime('+3 days')); ?></span>
                </div>
                <div class="linha-info">
                    <span class="label">Data de Emissão:</span>
                    <span><?php echo date('d/m/Y'); ?></span>
                </div>
            </div>

            <div class="valor-principal">
                R$ <?php echo number_format($pagamento['valor'], 2, ',', '.'); ?>
            </div>

            <div class="secao">
                <div class="linha-info">
                    <span class="label">Juros/Multa:</span>
                    <span>R$ 0,00</span>
                </div>
                <div class="linha-info">
                    <span class="label">Desconto:</span>
                    <span>R$ 0,00</span>
                </div>
                <div class="linha-info">
                    <span class="label">Valor Total:</span>
                    <span><strong>R$ <?php echo number_format($pagamento['valor'], 2, ',', '.'); ?></strong></span>
                </div>
            </div>

            <div class="rodape">
                <p>Boleto gerado automaticamente pelo sistema HelPTech</p>
                <p>Válido até: <?php echo date('d/m/Y', strtotime('+3 days')); ?></p>
                <p><button onclick="window.print()">Imprimir Boleto</button></p>
            </div>
        </div>

        <script>
            // Auto-imprimir se aberto em janela separada
            if (window.location.href.includes('boleto.php')) {
                setTimeout(() => {
                    window.print();
                }, 500);
            }
        </script>
    </body>
    </html>
    <?php

} catch (PDOException $e) {
    http_response_code(500);
    echo 'Erro ao buscar boleto: ' . $e->getMessage();
}
?>
