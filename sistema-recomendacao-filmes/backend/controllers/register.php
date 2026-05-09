<?php
// 1. Configurações de Segurança (CORS) para permitir que o Angular (porta 4200) aceda ao PHP
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// 2. Incluir a conexão com a base de dados
require_once '../config/database.php';

// 3. Receber os dados enviados pelo Angular (formato JSON)
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nome) && !empty($data->email) && !empty($data->password)) {
    try {
        // 4. Encriptar a senha por segurança (Requisito de Engenharia de Software)
        $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

        // 5. Preparar o comando SQL para inserir na tabela 'utilizadores'
        $query = "INSERT INTO utilizadores (nome, email, senha) VALUES (:nome, :email, :senha)";
        $stmt = $conn->prepare($query);

        // 6. Ligar os valores com segurança contra SQL Injection
        $stmt->bindParam(":nome", $data->nome);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":senha", $password_hash);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Utilizador registado com sucesso!"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["message" => "Erro ao registar: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["message" => "Dados incompletos."]);
}
?>