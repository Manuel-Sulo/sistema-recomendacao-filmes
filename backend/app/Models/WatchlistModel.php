<?php
/**
 * WatchlistModel — Data access for watchlist table
 */
class WatchlistModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findByUser(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC');
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function exists(int $userId, int $tmdbId): bool
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM watchlist WHERE user_id = ? AND tmdb_id = ?');
        $stmt->execute([$userId, $tmdbId]);
        return (int) $stmt->fetchColumn() > 0;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO watchlist (user_id, tmdb_id, movie_title, poster_path, release_year) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['user_id'], $data['tmdb_id'], $data['movie_title'],
            $data['poster_path'] ?? null, $data['release_year'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function delete(int $userId, int $tmdbId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM watchlist WHERE user_id = ? AND tmdb_id = ?');
        return $stmt->execute([$userId, $tmdbId]);
    }

    public function getUserMovieIds(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT tmdb_id FROM watchlist WHERE user_id = ?');
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
