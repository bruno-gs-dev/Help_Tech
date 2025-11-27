<?php
session_start();

// TESTE - remova depois
echo "ID da sessão: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'Não logado');
var_dump($_SESSION); // Mostra tudo que tem na sessão
exit; // Para aqui para você ver
?>