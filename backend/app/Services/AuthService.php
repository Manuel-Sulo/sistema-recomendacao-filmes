<?php
/**
 * AuthService — Business logic for authentication
 */
class AuthService
{
    private UserModel $userModel;
    private PasswordResetModel $resetModel;

    public function __construct()
    {
        $this->userModel  = new UserModel();
        $this->resetModel = new PasswordResetModel();
    }

    public function register(array $data): array
    {
        // Check if email exists
        if ($this->userModel->findByEmail($data['email'])) {
            Response::error('Este email já está registado', 409);
        }

        // Validate
        if (empty($data['name']) || strlen($data['name']) < 2) {
            Response::error('Nome deve ter pelo menos 2 caracteres');
        }
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Email inválido');
        }
        if (empty($data['password']) || strlen($data['password']) < 6) {
            Response::error('Password deve ter pelo menos 6 caracteres');
        }

        $userId = $this->userModel->create([
            'name'          => htmlspecialchars($data['name']),
            'email'         => strtolower(trim($data['email'])),
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]),
        ]);

        $user  = $this->userModel->findById($userId);
        $token = JWTHelper::encode(['user_id' => $userId, 'role' => $user['role']]);

        return [
            'token' => $token,
            'user'  => $this->sanitizeUser($user),
        ];
    }

    public function login(string $email, string $password): array
    {
        $user = $this->userModel->findByEmail(strtolower(trim($email)));

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::error('Credenciais inválidas', 401);
        }

        if (!$user['is_active']) {
            Response::error('Conta desativada', 403);
        }

        $token = JWTHelper::encode(['user_id' => $user['id'], 'role' => $user['role']]);

        return [
            'token' => $token,
            'user'  => $this->sanitizeUser($user),
        ];
    }

    public function forgotPassword(string $email): void
    {
        $user = $this->userModel->findByEmail(strtolower(trim($email)));

        // Always return success to prevent email enumeration
        if (!$user) return;

        $token = bin2hex(random_bytes(32));
        $this->resetModel->create($user['id'], $token);

        // In production, send email here
        // For development, token is stored in DB and can be retrieved
    }

    public function resetPassword(string $token, string $newPassword): void
    {
        if (strlen($newPassword) < 6) {
            Response::error('Password deve ter pelo menos 6 caracteres');
        }

        $resetToken = $this->resetModel->findValidToken($token);

        if (!$resetToken) {
            Response::error('Token inválido ou expirado', 400);
        }

        $hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        $this->userModel->updatePassword($resetToken['user_id'], $hash);
        $this->resetModel->markUsed($resetToken['id']);
    }

    private function sanitizeUser(array $user): array
    {
        unset($user['password_hash']);
        return $user;
    }
}
