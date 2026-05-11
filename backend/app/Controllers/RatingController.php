<?php
/**
 * RatingController — CRUD for user ratings
 */
class RatingController
{
    private RatingModel $model;

    public function __construct()
    {
        $this->model = new RatingModel();
    }

    public function index(Request $request): void
    {
        $user = $request->getParam('__user');
        Response::success($this->model->findByUser($user['id']));
    }

    public function store(Request $request): void
    {
        $user = $request->getParam('__user');
        $body = $request->getBody();

        if (!$body || empty($body['tmdb_id']) || !isset($body['rating'])) {
            Response::error('tmdb_id e rating são obrigatórios');
        }
        $rating = (int) $body['rating'];
        if ($rating < 1 || $rating > 5) {
            Response::error('Rating deve ser entre 1 e 5');
        }

        // Check if already rated
        if ($this->model->findByUserAndMovie($user['id'], $body['tmdb_id'])) {
            Response::error('Já avaliaste este filme. Usa PUT para atualizar.', 409);
        }

        $id = $this->model->create([
            'user_id'      => $user['id'],
            'tmdb_id'      => (int) $body['tmdb_id'],
            'movie_title'  => $body['movie_title'] ?? 'Unknown',
            'poster_path'  => $body['poster_path'] ?? null,
            'release_year' => $body['release_year'] ?? null,
            'rating'       => $rating,
            'review'       => $body['review'] ?? null,
        ]);

        // Update genre preferences based on rating
        $this->updateGenreWeights($user['id'], (int) $body['tmdb_id'], $rating);

        Response::created(['id' => $id], 'Avaliação criada');
    }

    public function update(Request $request): void
    {
        $user   = $request->getParam('__user');
        $tmdbId = (int) $request->getParam('tmdb_id');
        $body   = $request->getBody();

        $updates = [];
        if (isset($body['rating'])) {
            $r = (int) $body['rating'];
            if ($r < 1 || $r > 5) Response::error('Rating deve ser entre 1 e 5');
            $updates['rating'] = $r;
        }
        if (array_key_exists('review', $body)) {
            $updates['review'] = $body['review'];
        }
        if (empty($updates)) Response::error('Nada para atualizar');

        $this->model->update($user['id'], $tmdbId, $updates);
        if (isset($updates['rating'])) {
            $this->updateGenreWeights($user['id'], $tmdbId, $updates['rating']);
        }
        Response::success(null, 'Avaliação atualizada');
    }

    public function destroy(Request $request): void
    {
        $user   = $request->getParam('__user');
        $tmdbId = (int) $request->getParam('tmdb_id');
        $this->model->delete($user['id'], $tmdbId);
        Response::success(null, 'Avaliação removida');
    }

    private function updateGenreWeights(int $userId, int $tmdbId, int $rating): void
    {
        $tmdb  = new TmdbApiService();
        $movie = $tmdb->getMovieDetails($tmdbId);
        $genreModel = new UserGenreModel();

        if (isset($movie['genres'])) {
            foreach ($movie['genres'] as $genre) {
                if ($rating >= 4) {
                    $genreModel->incrementWeight($userId, $genre['id'], $genre['name']);
                } elseif ($rating <= 2) {
                    $genreModel->decrementWeight($userId, $genre['id']);
                }
            }
        }
    }

    public function getByMovie(Request $request): void
    {
        $tmdbId = (int) $request->getParam('tmdb_id');
        $ratings = $this->model->findByMovie($tmdbId);
        Response::success($ratings);
    }
}
