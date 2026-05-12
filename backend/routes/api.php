<?php
/**
 * API Routes — All endpoint definitions
 */

$auth  = [AuthMiddleware::class];
$admin = [AuthMiddleware::class, AdminMiddleware::class];

// === AUTH (Public) ===
$router->post('/api/auth/register',        'AuthController', 'register');
$router->post('/api/auth/login',           'AuthController', 'login');
$router->post('/api/auth/logout',          'AuthController', 'logout', $auth);
$router->post('/api/auth/forgot-password', 'AuthController', 'forgotPassword');
$router->post('/api/auth/reset-password',  'AuthController', 'resetPassword');

// === USER PROFILE ===
$router->get('/api/user/profile',   'UserController', 'getProfile',     $auth);
$router->put('/api/user/profile',   'UserController', 'updateProfile',  $auth);
$router->put('/api/user/password',  'UserController', 'updatePassword', $auth);
$router->get('/api/user/genres',    'UserController', 'getGenres',      $auth);
$router->post('/api/user/genres',   'UserController', 'setGenres',      $auth);
$router->get('/api/user/stats',     'UserController', 'getStats',       $auth);

// === MOVIES (TMDB Proxy) ===
$router->get('/api/movies/trending',            'MovieController', 'trending',  $auth);
$router->get('/api/movies/popular',             'MovieController', 'popular',   $auth);
$router->get('/api/movies/top-rated',           'MovieController', 'topRated',  $auth);
$router->get('/api/movies/search',              'MovieController', 'search',    $auth);
$router->get('/api/movies/discover',            'MovieController', 'discover',  $auth);
$router->get('/api/movies/genres',              'MovieController', 'genres',    $auth);
$router->get('/api/movies/{tmdb_id}',           'MovieController', 'details',   $auth);
$router->get('/api/movies/{tmdb_id}/similar',   'MovieController', 'similar',   $auth);

// === RECOMMENDATIONS ===
$router->get('/api/recommendations',                    'RecommendationController', 'index',   $auth);
$router->get('/api/recommendations/by-genre/{genre_id}','RecommendationController', 'byGenre', $auth);

// === RATINGS ===
$router->get('/api/ratings',             'RatingController', 'index',   $auth);
$router->get('/api/ratings/movie/{tmdb_id}', 'RatingController', 'getByMovie', $auth);
$router->post('/api/ratings',            'RatingController', 'store',   $auth);
$router->put('/api/ratings/{tmdb_id}',   'RatingController', 'update',  $auth);
$router->delete('/api/ratings/{tmdb_id}','RatingController', 'destroy', $auth);

// === WATCHLIST ===
$router->get('/api/watchlist',              'WatchlistController', 'index',   $auth);
$router->post('/api/watchlist',             'WatchlistController', 'store',   $auth);
$router->delete('/api/watchlist/{tmdb_id}', 'WatchlistController', 'destroy', $auth);

// === FAVORITES ===
$router->get('/api/favorites',              'FavoriteController', 'index',   $auth);
$router->post('/api/favorites',             'FavoriteController', 'store',   $auth);
$router->delete('/api/favorites/{tmdb_id}', 'FavoriteController', 'destroy', $auth);

// === HISTORY ===
$router->get('/api/history',              'HistoryController', 'index',   $auth);
$router->post('/api/history',             'HistoryController', 'store',   $auth);
$router->delete('/api/history/{tmdb_id}', 'HistoryController', 'destroy', $auth);

// === EXPORT ===
$router->get('/api/export/{type}', 'ExportController', 'export', $auth);

// === ACTORS / PERSONS ===
$router->get('/api/person/{id}', 'MovieController', 'person', $auth);
$router->get('/api/person/{id}/movie_credits', 'MovieController', 'personCredits', $auth);

// === AI MATCHMAKER ===
$router->post('/api/ai/match', 'AiController', 'match', $auth);

// === ADMIN ===
$router->get('/api/admin/users',          'AdminController', 'users',        $admin);
$router->put('/api/admin/users/{id}',     'AdminController', 'updateUser',   $admin);
$router->delete('/api/admin/users/{id}',  'AdminController', 'deleteUser',   $admin);
$router->get('/api/admin/ratings',        'AdminController', 'ratings',      $admin);
$router->delete('/api/admin/ratings/{id}','AdminController', 'deleteRating', $admin);
$router->get('/api/admin/stats',          'AdminController', 'stats',        $admin);
