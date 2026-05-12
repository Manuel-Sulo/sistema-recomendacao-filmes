<?php
/**
 * Front Controller — Bootstrap entry point
 * All requests are routed through this file via .htaccess
 */

// Error reporting (development)
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Autoload core
$basePath = dirname(__DIR__);
require_once $basePath . '/core/Env.php';
require_once $basePath . '/core/Database.php';
require_once $basePath . '/core/Request.php';
require_once $basePath . '/core/Response.php';
require_once $basePath . '/core/JWTHelper.php';
require_once $basePath . '/core/Router.php';

// Load environment
Env::load($basePath);

// Autoload middleware
require_once $basePath . '/app/Middleware/CorsMiddleware.php';
require_once $basePath . '/app/Middleware/AuthMiddleware.php';
require_once $basePath . '/app/Middleware/AdminMiddleware.php';

// Autoload models
require_once $basePath . '/app/Models/UserModel.php';
require_once $basePath . '/app/Models/PasswordResetModel.php';
require_once $basePath . '/app/Models/RatingModel.php';
require_once $basePath . '/app/Models/FavoriteModel.php';
require_once $basePath . '/app/Models/WatchlistModel.php';
require_once $basePath . '/app/Models/WatchedModel.php';
require_once $basePath . '/app/Models/UserGenreModel.php';

// Autoload helpers
require_once $basePath . '/app/Helpers/CacheHelper.php';

// Autoload services
require_once $basePath . '/app/Services/AuthService.php';
require_once $basePath . '/app/Services/TmdbApiService.php';

// Autoload controllers
require_once $basePath . '/app/Controllers/AuthController.php';
require_once $basePath . '/app/Controllers/UserController.php';
require_once $basePath . '/app/Controllers/MovieController.php';
require_once $basePath . '/app/Controllers/RatingController.php';
require_once $basePath . '/app/Controllers/FavoriteController.php';
require_once $basePath . '/app/Controllers/WatchlistController.php';
require_once $basePath . '/app/Controllers/HistoryController.php';
require_once $basePath . '/app/Controllers/RecommendationController.php';
require_once $basePath . '/app/Controllers/ExportController.php';
require_once $basePath . '/app/Controllers/AdminController.php';
require_once $basePath . '/app/Controllers/AiController.php';

// Apply CORS
CorsMiddleware::handle();

// Set JSON content type
header('Content-Type: application/json; charset=utf-8');

// Create router and load routes
$router = new Router();
require_once $basePath . '/routes/api.php';

// Resolve request
$request = new Request();
$router->resolve($request);
