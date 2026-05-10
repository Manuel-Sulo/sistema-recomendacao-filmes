<?php
/**
 * AuthMiddleware — Validates JWT token and injects user into request
 */
class AuthMiddleware
{
    public function handle(Request $request): void
    {
        $token = $request->getBearerToken();

        if (!$token) {
            Response::unauthorized('Token não fornecido');
        }

        $payload = JWTHelper::decode($token);

        if (!$payload || !isset($payload['user_id'])) {
            Response::unauthorized('Token inválido ou expirado');
        }

        // Verify user exists and is active
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT id, name, email, role, preferred_language, theme, onboarded, is_active FROM users WHERE id = ?');
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();

        if (!$user || !$user['is_active']) {
            Response::unauthorized('Utilizador não encontrado ou inativo');
        }

        // Inject user into request params
        $params = $request->getParams();
        $params['__user'] = $user;
        $request->setParams($params);
    }
}
