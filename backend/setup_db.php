<?php
/**
 * Database Setup Script — Run this once to create the database and tables
 * Access via: http://localhost/EngSof-lab4/backend/setup_db.php
 */

$host = 'localhost';
$port = '3307';
$user = 'root';
$pass = '';

try {
    // Connect without database
    $pdo = new PDO("mysql:host=$host;port=$port", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    echo "✅ Conectado ao MySQL<br><br>";

    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS movie_recommender CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✅ Base de dados 'movie_recommender' criada<br>";

    // Switch to database
    $pdo->exec("USE movie_recommender");

    // Create tables
    $tables = [
        "CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin','user') NOT NULL DEFAULT 'user',
            preferred_language VARCHAR(10) NOT NULL DEFAULT 'pt',
            theme ENUM('light','dark') NOT NULL DEFAULT 'dark',
            onboarded TINYINT(1) NOT NULL DEFAULT 0,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB",

        "CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB",

        "CREATE TABLE IF NOT EXISTS user_genre_preferences (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            genre_id INT NOT NULL,
            genre_name VARCHAR(50) NOT NULL,
            source ENUM('manual','inferred') NOT NULL DEFAULT 'manual',
            weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_user_genre (user_id, genre_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB",

        "CREATE TABLE IF NOT EXISTS ratings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            tmdb_id INT NOT NULL,
            movie_title VARCHAR(255) NOT NULL,
            poster_path VARCHAR(255),
            release_year YEAR,
            rating TINYINT UNSIGNED NOT NULL,
            review TEXT,
            rated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_user_movie (user_id, tmdb_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB",

        "CREATE TABLE IF NOT EXISTS watchlist (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            tmdb_id INT NOT NULL,
            movie_title VARCHAR(255) NOT NULL,
            poster_path VARCHAR(255),
            release_year YEAR,
            added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_user_movie_wl (user_id, tmdb_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB",

        "CREATE TABLE IF NOT EXISTS favorites (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            tmdb_id INT NOT NULL,
            movie_title VARCHAR(255) NOT NULL,
            poster_path VARCHAR(255),
            release_year YEAR,
            added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_user_movie_fav (user_id, tmdb_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB",

        "CREATE TABLE IF NOT EXISTS watch_history (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            tmdb_id INT NOT NULL,
            movie_title VARCHAR(255) NOT NULL,
            poster_path VARCHAR(255),
            release_year YEAR,
            watched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_user_movie_hist (user_id, tmdb_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB",

        "CREATE TABLE IF NOT EXISTS export_logs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            report_type VARCHAR(100) NOT NULL,
            format ENUM('csv','pdf') NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB",
    ];

    foreach ($tables as $i => $sql) {
        $pdo->exec($sql);
        echo "✅ Tabela " . ($i + 1) . "/8 criada<br>";
    }

    // Seed admin user
    $adminHash = password_hash('admin123', PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (name, email, password_hash, role, onboarded) VALUES (?, ?, ?, 'admin', 1)");
    $stmt->execute(['Administrador', 'admin@movierecommender.ao', $adminHash]);
    echo "<br>✅ Admin criado (admin@movierecommender.ao / admin123)<br>";

    // Seed test user
    $userHash = password_hash('user123', PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt->execute(['Utilizador Teste', 'user@movierecommender.ao', $userHash]);
    echo "✅ User teste criado (user@movierecommender.ao / user123)<br>";

    echo "<br><b>🎬 Setup completo! Base de dados pronta.</b>";

} catch (PDOException $e) {
    echo "❌ Erro: " . $e->getMessage();
}
