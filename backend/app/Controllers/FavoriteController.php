<?php
/**
 * FavoriteController — CRUD for user favorites
 */
class FavoriteController
{
    private FavoriteModel $model;

    public function __construct() { $this->model = new FavoriteModel(); }

    public function index(Request $request): void
    {
        $user = $request->getParam('__user');
        Response::success($this->model->findByUser($user['id']));
    }

    public function store(Request $request): void
    {
        $user = $request->getParam('__user');
        $body = $request->getBody();
        if (!$body || empty($body['tmdb_id'])) Response::error('tmdb_id é obrigatório');

        if ($this->model->exists($user['id'], (int)$body['tmdb_id'])) {
            Response::error('Filme já está nos favoritos', 409);
        }

        $id = $this->model->create([
            'user_id'      => $user['id'],
            'tmdb_id'      => (int) $body['tmdb_id'],
            'movie_title'  => $body['movie_title'] ?? 'Unknown',
            'poster_path'  => $body['poster_path'] ?? null,
            'release_year' => $body['release_year'] ?? null,
        ]);
        Response::created(['id' => $id], 'Adicionado aos favoritos');
    }

    public function destroy(Request $request): void
    {
        $user   = $request->getParam('__user');
        $tmdbId = (int) $request->getParam('tmdb_id');
        $this->model->delete($user['id'], $tmdbId);
        Response::success(null, 'Removido dos favoritos');
    }
}
