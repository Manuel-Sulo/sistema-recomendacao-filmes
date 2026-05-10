<?php
/**
 * AdminController — Admin-only operations
 */
class AdminController
{
    private UserModel $userModel;
    private RatingModel $ratingModel;

    public function __construct()
    {
        $this->userModel  = new UserModel();
        $this->ratingModel = new RatingModel();
    }

    public function users(Request $request): void
    {
        Response::success($this->userModel->findAll());
    }

    public function updateUser(Request $request): void
    {
        $id   = (int) $request->getParam('id');
        $body = $request->getBody();
        $updates = [];
        if (isset($body['role']) && in_array($body['role'], ['admin','user'])) $updates['role'] = $body['role'];
        if (isset($body['is_active'])) $updates['is_active'] = $body['is_active'] ? 1 : 0;
        if (empty($updates)) Response::error('Nada para atualizar');
        $this->userModel->update($id, $updates);
        Response::success(null, 'Utilizador atualizado');
    }

    public function deleteUser(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $this->userModel->deactivate($id);
        Response::success(null, 'Utilizador desativado');
    }

    public function ratings(Request $request): void
    {
        Response::success($this->ratingModel->findAll());
    }

    public function deleteRating(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $this->ratingModel->deleteById($id);
        Response::success(null, 'Avaliação removida');
    }

    public function stats(Request $request): void
    {
        Response::success([
            'total_users'   => $this->userModel->countAll(),
            'total_ratings' => $this->ratingModel->countAll(),
        ]);
    }
}
