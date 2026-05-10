<?php
/**
 * WatchedModel — Data access for watch_history table
 */
class WatchedModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findByUser(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM watch_history WHERE user_id = ? ORDER BY watched_at DESC');
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function exists(int $userId, int $tmdbId): bool
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM watch_history WHERE user_id = ? AND tmdb_id = ?');
        $stmt->execute([$userId, $tmdbId]);
        return (int) $stmt->fetchColumn() > 0;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO watch_history (user_id, tmdb_id, movie_title, poster_path, release_year) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['user_id'], $data['tmdb_id'], $data['movie_title'],
            $data['poster_path'] ?? null, $data['release_year'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function delete(int $userId, int $tmdbId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM watch_history WHERE user_id = ? AND tmdb_id = ?');
        return $stmt->execute([$userId, $tmdbId]);
    }

    public function getUserMovieIds(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT tmdb_id FROM watch_history WHERE user_id = ?');
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
