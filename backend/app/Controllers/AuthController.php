<?php
/**
 * AuthController — Handles authentication endpoints
 */
class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    /**
     * POST /api/auth/register
     */
    public function register(Request $request): void
    {
        $body = $request->getBody();

        if (!$body || empty($body['name']) || empty($body['email']) || empty($body['password'])) {
            Response::error('Nome, email e password são obrigatórios');
        }

        $result = $this->authService->register($body);
        Response::created($result, 'Registo efetuado com sucesso');
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request): void
    {
        $body = $request->getBody();

        if (!$body || empty($body['email']) || empty($body['password'])) {
            Response::error('Email e password são obrigatórios');
        }

        $result = $this->authService->login($body['email'], $body['password']);
        Response::success($result, 'Login efetuado com sucesso');
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request): void
    {
        // JWT is stateless — logout is handled client-side by removing token
        Response::success(null, 'Logout efetuado com sucesso');
    }

    /**
     * POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request): void
    {
        $body = $request->getBody();

        if (!$body || empty($body['email'])) {
            Response::error('Email é obrigatório');
        }

        $this->authService->forgotPassword($body['email']);
        Response::success(null, 'Se o email existir, receberás instruções de recuperação');
    }

    /**
     * POST /api/auth/reset-password
     */
    public function resetPassword(Request $request): void
    {
        $body = $request->getBody();

        if (!$body || empty($body['token']) || empty($body['password'])) {
            Response::error('Token e nova password são obrigatórios');
        }

        $this->authService->resetPassword($body['token'], $body['password']);
        Response::success(null, 'Password redefinida com sucesso');
    }
}
