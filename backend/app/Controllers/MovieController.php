<?php
/**
 * MovieController — Handles movie-related endpoints (TMDB proxy)
 */
class MovieController
{
    private TmdbApiService $tmdb;

    /** Map of app language codes to TMDB language codes */
    private static array $langMap = [
        'pt' => 'pt-PT',
        'en' => 'en-US',
        'de' => 'de-DE',
        'ru' => 'ru-RU',
        'it' => 'it-IT',
        'ko' => 'ko-KR',
        'fr' => 'fr-FR',
    ];

    public function __construct()
    {
        $this->tmdb = new TmdbApiService();
    }

    private function getLang(Request $request): string
    {
        $lang = $request->getQueryParam('lang');
        if (!$lang) {
            $user = $request->getParam('__user');
            $lang = $user['preferred_language'] ?? 'pt';
        }
        return self::$langMap[$lang] ?? 'pt-PT';
    }

    private function handleTmdbResponse(array $response): void
    {
        if (isset($response['error'])) {
            Response::error($response['error'], 502);
        }
        Response::success($response);
    }

    public function trending(Request $request): void
    {
        $page = (int) $request->getQueryParam('page', 1);
        $this->handleTmdbResponse($this->tmdb->getTrending($page, $this->getLang($request)));
    }

    public function popular(Request $request): void
    {
        $page = (int) $request->getQueryParam('page', 1);
        $this->handleTmdbResponse($this->tmdb->getPopular($page, $this->getLang($request)));
    }

    public function topRated(Request $request): void
    {
        $page = (int) $request->getQueryParam('page', 1);
        $this->handleTmdbResponse($this->tmdb->getTopRated($page, $this->getLang($request)));
    }

    public function search(Request $request): void
    {
        $query = trim((string) $request->getQueryParam('q', ''));
        $page  = (int) $request->getQueryParam('page', 1);
        $year  = $request->getQueryParam('year', null);
        $type  = $request->getQueryParam('type', 'movie'); // movie | multi

        if (empty($query)) Response::error('Parâmetro de pesquisa "q" é obrigatório');

        $lang = $this->getLang($request);

        if ($type === 'multi') {
            $result = $this->tmdb->searchMulti($query, $page, $lang);
        } else {
            $result = $this->tmdb->search($query, $page, $lang, $year);
        }

        $this->handleTmdbResponse($result);
    }

    public function discover(Request $request): void
    {
        $params = [];
        if ($g = $request->getQueryParam('genre'))  $params['with_genres'] = $g;
        if ($y = $request->getQueryParam('year'))   $params['primary_release_year'] = $y;
        // Default sort: vote count + popularity to surface relevant titles
        $params['sort_by']           = $request->getQueryParam('sort', 'popularity.desc');
        $params['vote_count.gte']    = 50;  // exclude obscure titles
        $params['page']              = (int) $request->getQueryParam('page', 1);
        $this->handleTmdbResponse($this->tmdb->discover($params, $this->getLang($request)));
    }

    public function details(Request $request): void
    {
        $tmdbId = (int) $request->getParam('tmdb_id');
        $user   = $request->getParam('__user');

        if ($tmdbId <= 0) {
            Response::error('ID inválido', 400);
        }

        $movie  = $this->tmdb->getMovieDetails($tmdbId, $this->getLang($request));

        if (isset($movie['error'])) {
            Response::error($movie['error'], 404);
        }

        // Attach user-specific data
        $ratingModel    = new RatingModel();
        $favoriteModel  = new FavoriteModel();
        $watchlistModel = new WatchlistModel();
        $watchedModel   = new WatchedModel();

        $movie['user_rating']      = $ratingModel->findByUserAndMovie($user['id'], $tmdbId);
        $movie['is_favorite']      = $favoriteModel->exists($user['id'], $tmdbId);
        $movie['in_watchlist']     = $watchlistModel->exists($user['id'], $tmdbId);
        $movie['is_watched']       = $watchedModel->exists($user['id'], $tmdbId);

        Response::success($movie);
    }

    public function similar(Request $request): void
    {
        $tmdbId = (int) $request->getParam('tmdb_id');
        $this->handleTmdbResponse($this->tmdb->getSimilar($tmdbId, $this->getLang($request)));
    }

    public function person(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $this->handleTmdbResponse($this->tmdb->getPerson($id, $this->getLang($request)));
    }

    public function personCredits(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $this->handleTmdbResponse($this->tmdb->getPersonCredits($id, $this->getLang($request)));
    }

    public function genres(Request $request): void
    {
        $this->handleTmdbResponse($this->tmdb->getGenres($this->getLang($request)));
    }
}
