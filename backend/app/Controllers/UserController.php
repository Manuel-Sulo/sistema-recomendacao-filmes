<?php
/**
 * UserController — Profile, preferences and genre management
 */
class UserController
{
    private UserModel $userModel;
    private UserGenreModel $genreModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
        $this->genreModel = new UserGenreModel();
    }

    public function getProfile(Request $request): void
    {
        $user = $request->getParam('__user');
        Response::success($user);
    }

    public function updateProfile(Request $request): void
    {
        $user = $request->getParam('__user');
        $body = $request->getBody();
        $updates = [];
        if (isset($body['name']))  $updates['name']  = htmlspecialchars($body['name']);
        if (isset($body['theme'])) $updates['theme'] = in_array($body['theme'], ['light','dark']) ? $body['theme'] : 'dark';
        if (isset($body['preferred_language'])) $updates['preferred_language'] = in_array($body['preferred_language'], ['pt','en','de','fr','it','ru','ko']) ? $body['preferred_language'] : 'pt';

        if (empty($updates)) Response::error('Nada para atualizar');

        $this->userModel->update($user['id'], $updates);
        $updated = $this->userModel->findById($user['id']);
        unset($updated['password_hash']);
        Response::success($updated, 'Perfil atualizado');
    }

    public function updatePassword(Request $request): void
    {
        $user = $request->getParam('__user');
        $body = $request->getBody();

        if (!$body || empty($body['current_password']) || empty($body['new_password'])) {
            Response::error('Password atual e nova password são obrigatórias');
        }

        $fullUser = $this->userModel->findById($user['id']);
        if (!password_verify($body['current_password'], $fullUser['password_hash'])) {
            Response::error('Password atual incorreta', 401);
        }
        if (strlen($body['new_password']) < 6) {
            Response::error('Nova password deve ter pelo menos 6 caracteres');
        }

        $this->userModel->updatePassword($user['id'], password_hash($body['new_password'], PASSWORD_BCRYPT, ['cost' => 12]));
        Response::success(null, 'Password atualizada');
    }

    public function getGenres(Request $request): void
    {
        $user = $request->getParam('__user');
        Response::success($this->genreModel->findByUser($user['id']));
    }

    public function setGenres(Request $request): void
    {
        $user = $request->getParam('__user');
        $body = $request->getBody();
        if (!$body || !isset($body['genres']) || !is_array($body['genres'])) {
            Response::error('Lista de géneros é obrigatória');
        }

        $this->genreModel->setGenres($user['id'], $body['genres']);
        $this->userModel->setOnboarded($user['id']);
        Response::success(null, 'Géneros guardados');
    }
}
