<?php
/**
 * UserGenreModel — Data access for user_genre_preferences
 */
class UserGenreModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM user_genre_preferences WHERE user_id = ? ORDER BY weight DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function setGenres(int $userId, array $genres): void
    {
        // Clear existing manual genres
        $stmt = $this->db->prepare("DELETE FROM user_genre_preferences WHERE user_id = ? AND source = 'manual'");
        $stmt->execute([$userId]);

        // Insert new ones
        $insert = $this->db->prepare(
            'INSERT INTO user_genre_preferences (user_id, genre_id, genre_name, source, weight) VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE genre_name = VALUES(genre_name), weight = VALUES(weight)'
        );
        foreach ($genres as $genre) {
            $insert->execute([
                $userId,
                $genre['id'],
                $genre['name'],
                'manual',
                1.00,
            ]);
        }
    }

    public function incrementWeight(int $userId, int $genreId, string $genreName, float $amount = 0.1): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO user_genre_preferences (user_id, genre_id, genre_name, source, weight)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE weight = LEAST(weight + ?, 2.00)'
        );
        $stmt->execute([$userId, $genreId, $genreName, 'inferred', $amount, $amount]);
    }

    public function decrementWeight(int $userId, int $genreId, float $amount = 0.05): void
    {
        $stmt = $this->db->prepare(
            'UPDATE user_genre_preferences SET weight = GREATEST(weight - ?, 0.00) WHERE user_id = ? AND genre_id = ?'
        );
        $stmt->execute([$amount, $userId, $genreId]);
    }

    public function getTopGenreIds(int $userId, int $limit = 5): array
    {
        $stmt = $this->db->prepare(
            'SELECT genre_id FROM user_genre_preferences WHERE user_id = ? AND weight > 0.5 ORDER BY weight DESC LIMIT ?'
        );
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
