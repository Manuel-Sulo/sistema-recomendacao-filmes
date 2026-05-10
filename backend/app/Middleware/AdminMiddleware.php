<?php
/**
 * AdminMiddleware — Verifies user has admin role
 * Must be used AFTER AuthMiddleware
 */
class AdminMiddleware
{
    public function handle(Request $request): void
    {
        $user = $request->getParam('__user');

        if (!$user || $user['role'] !== 'admin') {
            Response::forbidden('Acesso restrito a administradores');
        }
    }
}
