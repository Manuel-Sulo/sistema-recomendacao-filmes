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
        $user = $request->getParam('__user');
        $lang = $user['preferred_language'] ?? 'pt';
        return self::$langMap[$lang] ?? 'pt-PT';
    }

    public function trending(Request $request): void
    {
        $page = (int) $request->getQueryParam('page', 1);
        Response::success($this->tmdb->getTrending($page, $this->getLang($request)));
    }

    public function popular(Request $request): void
    {
        $page = (int) $request->getQueryParam('page', 1);
        Response::success($this->tmdb->getPopular($page, $this->getLang($request)));
    }

    public function topRated(Request $request): void
    {
        $page = (int) $request->getQueryParam('page', 1);
        Response::success($this->tmdb->getTopRated($page, $this->getLang($request)));
    }

    public function search(Request $request): void
    {
        $query = $request->getQueryParam('q', '');
        $page  = (int) $request->getQueryParam('page', 1);
        if (empty($query)) Response::error('Parâmetro de pesquisa "q" é obrigatório');
        Response::success($this->tmdb->search($query, $page, $this->getLang($request)));
    }

    public function discover(Request $request): void
    {
        $params = [];
        if ($g = $request->getQueryParam('genre'))  $params['with_genres'] = $g;
        if ($y = $request->getQueryParam('year'))   $params['primary_release_year'] = $y;
        if ($s = $request->getQueryParam('sort'))    $params['sort_by'] = $s;
        $params['page'] = (int) $request->getQueryParam('page', 1);
        Response::success($this->tmdb->discover($params, $this->getLang($request)));
    }

    public function details(Request $request): void
    {
        $tmdbId = (int) $request->getParam('tmdb_id');
        $user   = $request->getParam('__user');
        $movie  = $this->tmdb->getMovieDetails($tmdbId, $this->getLang($request));

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
        Response::success($this->tmdb->getSimilar($tmdbId, $this->getLang($request)));
    }

    public function genres(Request $request): void
    {
        Response::success($this->tmdb->getGenres($this->getLang($request)));
    }
}
