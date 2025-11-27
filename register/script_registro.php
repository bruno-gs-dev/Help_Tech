<?php
// Habilitar exibição de erros para debug (remover em produção)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Definir cabeçalho como JSON
header('Content-Type: application/json');

// Configurações do banco de dados
$servername = "localhost";
$username = "root";
$password = "joao01";
$dbname = "aluguel_itens";

$response = array();

try {
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Conexão falhou: " . $conn->connect_error);
    }
    
    // Definir charset para UTF-8
    $conn->set_charset("utf8mb4");
    
    // Verificar se o formulário foi enviado
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        
        // Obter dados do formulário com verificação de existência
        $first_name = isset($_POST['first_name']) ? trim($_POST['first_name']) : '';
        $last_name = isset($_POST['last_name']) ? trim($_POST['last_name']) : '';
        $birthday = isset($_POST['birthday']) ? trim($_POST['birthday']) : '';
        $gender = isset($_POST['gender']) ? $_POST['gender'] : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
        $password = isset($_POST['password']) ? trim($_POST['password']) : '';
        
        // Validação básica dos campos obrigatórios
        $errors = array();
        
        if (empty($first_name)) {
            $errors[] = "Primeiro nome é obrigatório";
        }
        
        if (empty($last_name)) {
            $errors[] = "Sobrenome é obrigatório";
        }
        
        if (empty($email)) {
            $errors[] = "Email é obrigatório";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Email inválido";
        }
        
        if (empty($password)) {
            $errors[] = "Senha é obrigatória";
        } elseif (strlen($password) < 6) {
            $errors[] = "Senha deve ter pelo menos 6 caracteres";
        }
        
        if (empty($phone)) {
            $errors[] = "Telefone é obrigatório";
        }
        
        if (empty($birthday)) {
            $errors[] = "Data de nascimento é obrigatória";
        } else {
            // Converter data de DD/MM/YYYY para YYYY-MM-DD
            $dateObj = DateTime::createFromFormat('d/m/Y', $birthday);
            if ($dateObj) {
                $birthday = $dateObj->format('Y-m-d');
            } else {
                $errors[] = "Formato de data inválido";
            }
        }
        
        // Se não há erros, proceder com a inserção
        if (empty($errors)) {
            
            // Verificar se o email já existe
            $check_email = "SELECT id FROM usuarios WHERE email = ?";
            $stmt_check = $conn->prepare($check_email);
            
            if (!$stmt_check) {
                throw new Exception("Erro ao preparar consulta: " . $conn->error);
            }
            
            $stmt_check->bind_param("s", $email);
            $stmt_check->execute();
            $result_check = $stmt_check->get_result();
            
            if ($result_check->num_rows > 0) {
                $response['status'] = 'error';
                $response['message'] = 'Este email já está cadastrado!';
            } else {
                
                // Verificar se o telefone já existe
                $check_phone = "SELECT id FROM usuarios WHERE telefone = ?";
                $stmt_check_phone = $conn->prepare($check_phone);
                
                if (!$stmt_check_phone) {
                    throw new Exception("Erro ao preparar consulta de telefone: " . $conn->error);
                }
                
                $stmt_check_phone->bind_param("s", $phone);
                $stmt_check_phone->execute();
                $result_check_phone = $stmt_check_phone->get_result();
                
                if ($result_check_phone->num_rows > 0) {
                    $response['status'] = 'error';
                    $response['message'] = 'Este telefone já está cadastrado!';
                    $stmt_check_phone->close();
                } else {
                    $stmt_check_phone->close();
                    
                    // Preparar a query SQL usando prepared statement para evitar SQL injection
                    $sql = "INSERT INTO usuarios (first_name, last_name, birthday, genero, email, telefone, password) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    
                    $stmt = $conn->prepare($sql);
                    
                    if (!$stmt) {
                        throw new Exception("Erro ao preparar inserção: " . $conn->error);
                    }
                    
                    $stmt->bind_param("sssssss", $first_name, $last_name, $birthday, $gender, $email, $phone, $password);
                    
                    if ($stmt->execute()) {
                        $response['status'] = 'success';
                        $response['message'] = 'Registro realizado com sucesso!';
                    } else {
                        // Tratar erros de duplicação que não foram pegos antes
                        $error_msg = $stmt->error;
                        if (strpos($error_msg, 'Duplicate entry') !== false) {
                            if (strpos($error_msg, 'email') !== false) {
                                $response['message'] = 'Este email já está cadastrado!';
                            } elseif (strpos($error_msg, 'telefone') !== false) {
                                $response['message'] = 'Este telefone já está cadastrado!';
                            } else {
                                $response['message'] = 'Dados já cadastrados no sistema!';
                            }
                        } else {
                            $response['message'] = 'Não foi possível completar o cadastro. Tente novamente.';
                        }
                        $response['status'] = 'error';
                    }
                    
                    $stmt->close();
                }
            }
            
            $stmt_check->close();
            
        } else {
            // Exibir erros de validação
            $response['status'] = 'error';
            $response['message'] = implode("\n", $errors);
        }
        
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Método inválido';
    }
    
} catch (Exception $e) {
    error_log("Erro no registro: " . $e->getMessage());
    $response['status'] = 'error';
    $response['message'] = 'Não foi possível completar o cadastro. Por favor, tente novamente.';
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
    echo json_encode($response);
}
?>