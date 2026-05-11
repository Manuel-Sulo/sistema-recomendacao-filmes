<?php
/**
 * RatingModel — Data access for ratings table
 */
class RatingModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM ratings WHERE user_id = ? ORDER BY rated_at DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function findByUserAndMovie(int $userId, int $tmdbId): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM ratings WHERE user_id = ? AND tmdb_id = ?'
        );
        $stmt->execute([$userId, $tmdbId]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO ratings (user_id, tmdb_id, movie_title, poster_path, release_year, rating, review)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['user_id'], $data['tmdb_id'], $data['movie_title'],
            $data['poster_path'] ?? null, $data['release_year'] ?? null,
            $data['rating'], $data['review'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $userId, int $tmdbId, array $data): bool
    {
        $fields = [];
        $values = [];
        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            $values[] = $value;
        }
        $values[] = $userId;
        $values[] = $tmdbId;
        $stmt = $this->db->prepare(
            'UPDATE ratings SET ' . implode(', ', $fields) . ' WHERE user_id = ? AND tmdb_id = ?'
        );
        return $stmt->execute($values);
    }

    public function delete(int $userId, int $tmdbId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM ratings WHERE user_id = ? AND tmdb_id = ?');
        return $stmt->execute([$userId, $tmdbId]);
    }

    public function deleteById(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM ratings WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function findAll(): array
    {
        $stmt = $this->db->query(
            'SELECT r.*, u.name as user_name FROM ratings r JOIN users u ON u.id = r.user_id ORDER BY r.rated_at DESC'
        );
        return $stmt->fetchAll();
    }

    public function countByUser(int $userId): int
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) as total FROM ratings WHERE user_id = ?');
        $stmt->execute([$userId]);
        return (int) $stmt->fetch()['total'];
    }

    public function getTopRatedGenres(int $userId, int $minRating = 4): array
    {
        $stmt = $this->db->prepare(
            'SELECT tmdb_id FROM ratings WHERE user_id = ? AND rating >= ? ORDER BY rating DESC'
        );
        $stmt->execute([$userId, $minRating]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function getUserMovieIds(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT tmdb_id FROM ratings WHERE user_id = ?');
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function countAll(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) as total FROM ratings');
        return (int) $stmt->fetch()['total'];
    }

    public function findByMovie(int $tmdbId): array
    {
        $stmt = $this->db->prepare(
            'SELECT r.rating, r.review, r.rated_at, u.name as user_name
             FROM ratings r JOIN users u ON u.id = r.user_id
             WHERE r.tmdb_id = ? ORDER BY r.rated_at DESC'
        );
        $stmt->execute([$tmdbId]);
        return $stmt->fetchAll();
    }
}
