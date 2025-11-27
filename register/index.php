<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <!-- Required meta tags-->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="Colorlib Templates">
    <meta name="author" content="Colorlib">
    <meta name="keywords" content="Colorlib Templates">

    <!-- Title Page-->
    <title>Aluguel de Itens</title>

    <!-- Icons font CSS-->
    <link href="vendor/mdi-font/css/material-design-iconic-font.min.css" rel="stylesheet" media="all">
    <link href="vendor/font-awesome-4.7/css/font-awesome.min.css" rel="stylesheet" media="all">
    <!-- Font special for pages-->
    <link href="https://fonts.googleapis.com/css?family=Poppins:100,100i,200,200i,300,300i,400,400i,500,500i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

    <!-- Vendor CSS-->
    <link href="vendor/select2/select2.min.css" rel="stylesheet" media="all">
    <link href="vendor/datepicker/daterangepicker.css" rel="stylesheet" media="all">

    <!-- Main CSS-->
    <link href="css/main.css" rel="stylesheet" media="all">

    <style>
        /* Modal Styles */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 999;
            animation: fadeIn 0.3s ease;
        }

        .modal-overlay.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            animation: slideUp 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .modal-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
        }

        .modal-header .pdf-icon {
            font-size: 32px;
            color: #e74c3c;
        }

        .modal-header h2 {
            margin: 0;
            font-size: 24px;
            color: #333;
            font-family: 'Poppins', sans-serif;
        }

        .modal-body {
            margin-bottom: 25px;
        }

        .terms-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #2196F3;
            text-decoration: none;
            font-weight: 600;
            margin: 15px 0;
            cursor: pointer;
            transition: color 0.2s;
        }

        .terms-link:hover {
            color: #0b7dda;
            text-decoration: underline;
        }

        .terms-link i {
            font-size: 16px;
        }

        .checkbox-group {
            margin: 15px 0;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }

        .checkbox-group input[type="checkbox"] {
            margin-top: 4px;
            cursor: pointer;
            width: 18px;
            height: 18px;
        }

        .checkbox-group label {
            margin: 0;
            cursor: pointer;
            font-size: 14px;
            color: #555;
            font-family: 'Poppins', sans-serif;
        }

        .modal-footer {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }

        .modal-footer button {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            transition: all 0.3s;
        }

        .btn-cancel {
            background: #f0f0f0;
            color: #333;
        }

        .btn-cancel:hover {
            background: #e0e0e0;
        }

        .btn-accept {
            background: #2196F3;
            color: white;
        }

        .btn-accept:hover:not(:disabled) {
            background: #0b7dda;
        }

        .btn-accept:disabled {
            background: #ccc;
            cursor: not-allowed;
            opacity: 0.6;
        }

        .error-message {
            color: #e74c3c;
            font-size: 13px;
            margin-top: 10px;
            display: none;
        }

        /* Success Modal Styles */
        .success-content {
            text-align: center;
            padding: 40px 30px !important;
        }

        .success-icon-box {
            width: 80px;
            height: 80px;
            background: #4CAF50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 25px;
            box-shadow: 0 10px 20px rgba(76, 175, 80, 0.3);
            animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .success-icon-box i {
            color: white;
            font-size: 40px;
        }

        .success-title {
            color: #333;
            font-size: 26px;
            font-weight: 700;
            margin-bottom: 10px;
            font-family: 'Poppins', sans-serif;
        }

        .success-desc {
            color: #666;
            font-size: 15px;
            margin-bottom: 0;
            line-height: 1.6;
        }

        @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        .redirect-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #4CAF50;
            border-radius: 50%;
            margin: 20px auto 0;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .input-error {
            border-bottom: 2px solid #e74c3c !important;
        }

        .field-error {
            color: #e74c3c;
            font-size: 12px;
            margin-top: 5px;
            display: none;
        }

        .alert-box {
            padding: 15px 20px;
            border: 1px solid transparent;
            border-radius: 8px;
            display: none;
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }

        .alert-danger {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
        }

        .alert-success {
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
        }

        /* Required field asterisk */
        .label.required::after {
            content: " *";
            color: #e74c3c;
            font-weight: bold;
        }

        /* Responsive improvements */
        body {
            overflow-y: auto !important;
        }

        .page-wrapper {
            display: flex !important;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        .wrapper--w680 {
            max-width: 750px !important;
            width: 100%;
        }

        .p-t-130 {
            padding-top: 0 !important;
        }

        .p-b-100 {
            padding-bottom: 0 !important;
        }

        /* Button container - space-between */
        .p-t-15 {
            padding-top: 15px;
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            gap: 15px;
        }

        /* Gender options side by side */
        .p-t-10 {
            display: flex !important;
            gap: 30px;
        }

        @media (max-width: 768px) {
            .page-wrapper {
                padding: 20px 10px;
            }

            .card-4 .card-body {
                padding: 40px 25px !important;
            }

            .title {
                font-size: 20px;
                margin-bottom: 25px;
            }

            .p-t-15 {
                flex-direction: column;
                gap: 15px;
            }

            .btn {
                width: 100%;
                margin: 0;
            }

            .row-space {
                gap: 15px;
            }

            .input-group {
                margin-bottom: 18px;
            }

            .modal-content {
                width: 95%;
                padding: 30px 20px;
            }

            .success-content {
                padding: 30px 20px !important;
            }
        }

        @media (max-width: 480px) {
            .card-4 .card-body {
                padding: 30px 20px !important;
            }

            .title {
                font-size: 18px;
                margin-bottom: 20px;
            }

            .label {
                font-size: 14px;
            }

            .input--style-4 {
                font-size: 14px;
                line-height: 45px;
            }

            .btn {
                line-height: 45px;
                font-size: 16px;
            }
        }
    </style>
</head>

<body>
    <div class="page-wrapper bg-gra-02 p-t-130 p-b-100 font-poppins">
        <div class="wrapper wrapper--w680">
            <div class="card card-4">
                <div class="card-body">
                    <h2 class="title">Cadastro</h2>
                    <div class="alert-box alert-danger" id="mainError"></div>
                    <form method="POST" action="script_registro.php" id="registerForm">
                        <div class="row row-space">
                            <div class="col-2">
                                <div class="input-group">
                                    <label class="label required" for="first_name">Primeiro Nome</label>
                                    <input class="input--style-4" type="text" name="first_name" id="first_name" placeholder="Digite seu primeiro nome" required>
                                    <div class="field-error" id="error-first_name"></div>
                                </div>
                            </div>
                            <div class="col-2">
                                <div class="input-group">
                                    <label class="label required" for="last_name">Sobrenome</label>
                                    <input class="input--style-4" type="text" name="last_name" id="last_name" placeholder="Digite seu sobrenome" required>
                                    <div class="field-error" id="error-last_name"></div>
                                </div>
                            </div>
                        </div>
                        <div class="row row-space">
                            <div class="col-2">
                                <div class="input-group">
                                    <label class="label required" for="birthday">Data de Nascimento</label>
                                    <div class="input-group-icon">
                                        <input class="input--style-4 js-datepicker" type="text" name="birthday" id="birthday" placeholder="DD/MM/AAAA" required>
                                        <i class="zmdi zmdi-calendar-note input-icon js-btn-calendar"></i>
                                    </div>
                                    <div class="field-error" id="error-birthday"></div>
                                </div>
                            </div>
                            <div class="col-2">
                                <div class="input-group">
                                    <label class="label">Gênero</label>
                                    <div class="p-t-10">
                                        <label class="radio-container m-r-45">Homem
                                            <input type="radio" checked="checked" name="gender" value="Homem">
                                            <span class="checkmark"></span>
                                        </label>
                                        <label class="radio-container">Mulher
                                            <input type="radio" name="gender" value="Mulher">
                                            <span class="checkmark"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row row-space">
                            <div class="col-2">
                                <div class="input-group">
                                    <label class="label required" for="email">Email</label>
                                    <input class="input--style-4" type="email" name="email" id="email" placeholder="seu.email@exemplo.com" required maxlength="50">
                                    <div class="field-error" id="error-email"></div>
                                </div>
                            </div>
                            <div class="col-2">
                                <div class="input-group">
                                    <label class="label required" for="phone">Telefone</label>
                                    <input class="input--style-4" type="text" name="phone" id="phone" placeholder="(00) 00000-0000" required>
                                    <div class="field-error" id="error-phone"></div>
                                </div>
                            </div>
                        </div>
                        <div class="input-group">
                            <label class="label required" for="password">Senha</label>
                            <input class="input--style-4" type="password" name="password" id="password" placeholder="Mínimo 6 caracteres" required>
                            <div class="field-error" id="error-password"></div>
                        </div>
                        <div class="p-t-15">
                            <button class="btn btn--radius-2 btn--blue btn-back" type="button" onclick="voltar()">Voltar</button>
                            <button class="btn btn--radius-2 btn--blue btn-submit enviar" type="submit">Enviar</button>
                            <script>
                                function voltar() {
                                    window.location.href = "../login/index.php";
                                }
                            </script>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Termos -->
    <div class="modal-overlay" id="termsModal">
        <div class="modal-content">
            <div class="modal-header">
                <i class="fa fa-file-pdf-o pdf-icon"></i>
                <h2>Termos de Contrato</h2>
            </div>

            <div class="modal-body">
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    Antes de continuar, você precisa aceitar nossos termos e condições. Clique no link abaixo para ler os termos completos:
                </p>

                <a href="javascript:void(0);" class="terms-link" onclick="abrirTermos()">
                    <i class="fa fa-file-pdf-o"></i>
                    Leia os Termos de Serviço da HelPTech
                </a>

                <div class="checkbox-group">
                    <input type="checkbox" id="acceptTerms" name="acceptTerms">
                    <label for="acceptTerms">
                        Eu li e aceito os <strong>Termos de Contrato</strong> da HelPTech
                    </label>
                </div>

                <div class="checkbox-group">
                    <input type="checkbox" id="acceptPrivacy" name="acceptPrivacy">
                    <label for="acceptPrivacy">
                        Eu li e aceito a <strong>Política de Privacidade</strong> da HelPTech
                    </label>
                </div>

                <div class="error-message" id="errorMessage">
                    ⚠️ Você precisa aceitar os termos para continuar.
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn-cancel" onclick="recusarTermos()">Recusar</button>
                <button type="button" class="btn-accept" id="acceptBtn" onclick="aceitarTermos()" disabled>Aceitar</button>
            </div>
        </div>
    </div>

    <!-- Modal de Sucesso -->
    <div class="modal-overlay" id="successModal">
        <div class="modal-content success-content">
            <div class="success-icon-box">
                <i class="zmdi zmdi-check"></i>
            </div>
            <h2 class="success-title">Cadastro Realizado!</h2>
            <p class="success-desc">
                Seu cadastro foi concluído com sucesso.<br>
                Você será redirecionado para o login em instantes.
            </p>
            <div class="redirect-spinner"></div>
        </div>
    </div>

    <!-- Jquery JS-->
    <script src="vendor/jquery/jquery.min.js"></script>
    <!-- Vendor JS-->
    <script src="vendor/select2/select2.min.js"></script>
    <script src="vendor/datepicker/moment.min.js"></script>
    <script src="vendor/datepicker/daterangepicker.js"></script>

    <!-- Javascript -->
    <script src="js/global.js"></script>

    <script>
        let registroData = null;

        // Interceptar envio do formulário
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Coletar dados do formulário
            registroData = new FormData(this);
            
            // Mostrar modal de termos
            document.getElementById('termsModal').classList.add('show');
        });

        // Habilitar botão de aceitar quando ambos os checkboxes forem marcados
        document.getElementById('acceptTerms').addEventListener('change', verificarCheckboxes);
        document.getElementById('acceptPrivacy').addEventListener('change', verificarCheckboxes);

        function verificarCheckboxes() {
            const acceptTerms = document.getElementById('acceptTerms').checked;
            const acceptPrivacy = document.getElementById('acceptPrivacy').checked;
            const acceptBtn = document.getElementById('acceptBtn');
            const errorMessage = document.getElementById('errorMessage');

            if (acceptTerms && acceptPrivacy) {
                acceptBtn.disabled = false;
                errorMessage.style.display = 'none';
            } else {
                acceptBtn.disabled = true;
            }
        }

        function abrirTermos() {
            // Você pode substituir essa URL pelo caminho real do seu PDF
            const pdfUrl = './termo_contrato.pdf';
            window.open(pdfUrl, '_blank');
        }

        function aceitarTermos() {
            const acceptTerms = document.getElementById('acceptTerms').checked;
            const acceptPrivacy = document.getElementById('acceptPrivacy').checked;

            if (!acceptTerms || !acceptPrivacy) {
                document.getElementById('errorMessage').style.display = 'block';
                return;
            }

            // Limpar erros anteriores
            document.querySelectorAll('.field-error').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.input--style-4').forEach(el => el.classList.remove('input-error'));
            document.getElementById('mainError').style.display = 'none';

            // Enviar o formulário via AJAX
            fetch('script_registro.php', {
                method: 'POST',
                body: registroData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Registro bem-sucedido
                    fecharModal(); // Fecha o modal de termos
                    
                    // Abre o modal de sucesso
                    document.getElementById('successModal').classList.add('show');
                    
                    // Redireciona após 2.5 segundos
                    setTimeout(function() {
                        window.location.href = '../login/index.php';
                    }, 2500);
                } else {
                    // Erro no registro
                    fecharModal();
                    
                    // Exibir erro geral
                    const mainError = document.getElementById('mainError');
                    mainError.innerText = data.message;
                    mainError.style.display = 'block';
                    
                    // Tentar mapear erros para campos específicos
                    const msg = data.message.toLowerCase();
                    
                    if (msg.includes('primeiro nome')) mostrarErroCampo('first_name', 'Primeiro nome é obrigatório');
                    if (msg.includes('sobrenome')) mostrarErroCampo('last_name', 'Sobrenome é obrigatório');
                    if (msg.includes('email')) mostrarErroCampo('email', msg.includes('inválido') ? 'Email inválido' : 'Email já cadastrado ou obrigatório');
                    if (msg.includes('senha')) mostrarErroCampo('password', 'Senha inválida (min 6 caracteres)');
                    if (msg.includes('telefone')) mostrarErroCampo('phone', msg.includes('cadastrado') ? 'Telefone já cadastrado' : 'Telefone é obrigatório');
                    if (msg.includes('nascimento') || msg.includes('birthday')) mostrarErroCampo('birthday', 'Data de nascimento obrigatória');
                    
                    // Auto-hide error after 5 seconds
                    setTimeout(function() {
                        mainError.style.display = 'none';
                    }, 5000);
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                fecharModal();
                alert('Erro ao processar o cadastro. Verifique o console.');
            });
        }

        function mostrarErroCampo(id, mensagem) {
            const input = document.getElementById(id);
            const errorDiv = document.getElementById('error-' + id);
            if (input && errorDiv) {
                input.classList.add('input-error');
                errorDiv.innerText = mensagem;
                errorDiv.style.display = 'block';
            }
        }

        function recusarTermos() {
            document.getElementById('acceptTerms').checked = false;
            document.getElementById('acceptPrivacy').checked = false;
            verificarCheckboxes();
            fecharModal();
        }

        function fecharModal() {
            document.getElementById('termsModal').classList.remove('show');
            registroData = null;
        }

        // Formatação de telefone
        document.getElementById('phone').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            
            if (value.length <= 10) {
                // Formato: (00) 0000-0000
                value = value.replace(/(\d{2})(\d{0,4})(\d{0,4})/, function(match, p1, p2, p3) {
                    let result = '';
                    if (p1) result += '(' + p1;
                    if (p2) result += ') ' + p2;
                    if (p3) result += '-' + p3;
                    return result;
                });
            } else {
                // Formato: (00) 00000-0000
                value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
            
            e.target.value = value;
        });
    </script>

</body>

</html>

