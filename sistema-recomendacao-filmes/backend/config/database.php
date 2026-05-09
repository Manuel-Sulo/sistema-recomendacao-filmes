<?php
// Configurações da base de dados
$host = "127.0.0.1";
$port = "3307"; // A porta que configuraste no XAMPP
$db_name = "cinexpto_db";
$username = "root";
$password = ""; // No XAMPP a senha por padrão é vazia

try {
    // Criar a conexão usando PDO
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    
    // Configurar o PDO para lançar exceções em caso de erro
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Define o charset para evitar problemas com acentos (Ex: Português)
    $conn->exec("set names utf8");

    // echo "Conexão realizada com sucesso!"; 
} catch(PDOException $exception) {
    echo "Erro na conexão: " . $exception->getMessage();
}
?>