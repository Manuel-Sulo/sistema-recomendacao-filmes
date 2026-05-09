<?php
// 1. Configurações de Segurança (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// 2. Incluir a conexão
require_once '../config/database.php';

// 3. Receber os dados do Angular
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    try {
        // 4. Procurar o utilizador pelo email
        $query = "SELECT id, nome, email, senha, tipo_utilizador FROM utilizadores WHERE email = :email";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":email", $data->email);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // 5. Verificar se o utilizador existe e se a senha está correta
        if ($user && password_verify($data->password, $user['senha'])) {
            // Removemos a senha do objeto antes de enviar para o frontend por segurança
            unset($user['senha']);
            
            echo json_encode([
                "message" => "Login realizado com sucesso!",
                "user" => $user
            ]);
        } else {
            http_response_code(401); // Erro de Não Autorizado
            echo json_encode(["message" => "E-mail ou senha incorretos."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["message" => "Erro no servidor: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["message" => "Preencha todos os campos."]);
}
?>