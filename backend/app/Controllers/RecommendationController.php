<?php
/**
 * RecommendationController — Hybrid recommendation engine
 */
class RecommendationController
{
    private TmdbApiService $tmdb;
    private RatingModel $ratingModel;
    private UserGenreModel $genreModel;
    private FavoriteModel $favoriteModel;
    private WatchlistModel $watchlistModel;
    private WatchedModel $watchedModel;

    public function __construct()
    {
        $this->tmdb           = new TmdbApiService();
        $this->ratingModel    = new RatingModel();
        $this->genreModel     = new UserGenreModel();
        $this->favoriteModel  = new FavoriteModel();
        $this->watchlistModel = new WatchlistModel();
        $this->watchedModel   = new WatchedModel();
    }

    public function index(Request $request): void
    {
        $user = $request->getParam('__user');
        $lang = ($user['preferred_language'] === 'en') ? 'en-US' : 'pt-PT';

        // Get all user movie IDs to exclude
        $excludeIds = array_unique(array_merge(
            $this->ratingModel->getUserMovieIds($user['id']),
            $this->favoriteModel->getUserMovieIds($user['id']),
            $this->watchlistModel->getUserMovieIds($user['id']),
            $this->watchedModel->getUserMovieIds($user['id'])
        ));

        // 1. Content-Based: Discover by top genres
        $topGenres = $this->genreModel->getTopGenreIds($user['id'], 5);
        $contentMovies = [];

        if (!empty($topGenres)) {
            foreach (array_slice($topGenres, 0, 3) as $genreId) {
                $discovered = $this->tmdb->discover([
                    'with_genres' => $genreId,
                    'sort_by'     => 'vote_average.desc',
                    'vote_count.gte' => 100,
                    'page'        => 1,
                ], $lang);

                if (isset($discovered['results'])) {
                    foreach ($discovered['results'] as $movie) {
                        if (!in_array($movie['id'], $excludeIds)) {
                            $movie['_source'] = 'content_based';
                            $contentMovies[$movie['id']] = $movie;
                        }
                    }
                }
            }
        }

        // 2. TMDB Similar (from top rated movies)
        $topRatedIds = $this->ratingModel->getTopRatedGenres($user['id'], 4);
        $similarMovies = [];

        foreach (array_slice($topRatedIds, 0, 3) as $tmdbId) {
            $similar = $this->tmdb->getSimilar((int)$tmdbId, $lang);
            if (isset($similar['results'])) {
                foreach (array_slice($similar['results'], 0, 5) as $movie) {
                    if (!in_array($movie['id'], $excludeIds) && !isset($contentMovies[$movie['id']])) {
                        $movie['_source'] = 'tmdb_similar';
                        $similarMovies[$movie['id']] = $movie;
                    }
                }
            }
        }

        // 3. Fallback: Trending (cold start)
        $fallbackMovies = [];
        if (empty($contentMovies) && empty($similarMovies)) {
            $trending = $this->tmdb->getTrending(1, $lang);
            if (isset($trending['results'])) {
                foreach ($trending['results'] as $movie) {
                    if (!in_array($movie['id'], $excludeIds)) {
                        $movie['_source'] = 'trending_fallback';
                        $fallbackMovies[$movie['id']] = $movie;
                    }
                }
            }
        }

        // Merge and deduplicate
        $all = array_merge(array_values($contentMovies), array_values($similarMovies), array_values($fallbackMovies));

        // Sort by vote_average desc
        usort($all, fn($a, $b) => ($b['vote_average'] ?? 0) <=> ($a['vote_average'] ?? 0));

        Response::success(array_slice($all, 0, 20));
    }

    public function byGenre(Request $request): void
    {
        $user    = $request->getParam('__user');
        $genreId = (int) $request->getParam('genre_id');
        $lang    = ($user['preferred_language'] === 'en') ? 'en-US' : 'pt-PT';

        $result = $this->tmdb->discover([
            'with_genres'    => $genreId,
            'sort_by'        => 'popularity.desc',
            'vote_count.gte' => 50,
            'page'           => 1,
        ], $lang);

        Response::success($result);
    }
}
