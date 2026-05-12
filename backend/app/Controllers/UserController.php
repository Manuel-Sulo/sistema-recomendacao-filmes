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
    public function getStats(Request $request): void
    {
        $user = $request->getParam('__user');
        
        // Count history
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT COUNT(*) as total_movies, COUNT(DISTINCT tmdb_id) as unique_movies FROM watch_history WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $historyStats = $stmt->fetch();

        // Get favorite genres
        $stmt = $db->prepare('SELECT genre_name FROM user_genre_preferences WHERE user_id = ? ORDER BY weight DESC LIMIT 3');
        $stmt->execute([$user['id']]);
        $topGenres = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Get ratings count
        $stmt = $db->prepare('SELECT COUNT(*) FROM ratings WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $ratingsCount = (int) $stmt->fetchColumn();

        // Calculate fake hours based on history count (approx 120 mins per movie)
        $totalHours = floor((int)$historyStats['total_movies'] * 2);

        $vibe = 'Explorador Casual';
        if ($totalHours > 50) $vibe = 'Cinéfilo Dedicado';
        if ($totalHours > 200) $vibe = 'Mestre da Sétima Arte';

        Response::success([
            'total_movies' => (int) $historyStats['total_movies'],
            'total_hours'  => $totalHours,
            'ratings_given' => $ratingsCount,
            'top_genres'   => $topGenres,
            'vibe'         => $vibe
        ]);
    }
}
