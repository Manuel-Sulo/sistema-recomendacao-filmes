<?php
/**
 * PasswordResetModel — Data access for password_reset_tokens
 */
class PasswordResetModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function create(int $userId, string $token, int $expiryMinutes = 60): bool
    {
        // Invalidate old tokens
        $this->invalidateForUser($userId);

        $stmt = $this->db->prepare(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))'
        );
        return $stmt->execute([$userId, $token, $expiryMinutes]);
    }

    public function findValidToken(string $token): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT prt.*, u.email FROM password_reset_tokens prt
             JOIN users u ON u.id = prt.user_id
             WHERE prt.token = ? AND prt.used = 0 AND prt.expires_at > NOW()'
        );
        $stmt->execute([$token]);
        return $stmt->fetch() ?: null;
    }

    public function markUsed(int $id): bool
    {
        $stmt = $this->db->prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?');
        return $stmt->execute([$id]);
    }

    private function invalidateForUser(int $userId): void
    {
        $stmt = $this->db->prepare('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0');
        $stmt->execute([$userId]);
    }
}
