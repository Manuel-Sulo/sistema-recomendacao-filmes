<?php
/**
 * TmdbApiService — Proxy for TMDB API with caching
 * Uses cURL for reliable HTTPS connections on Windows/XAMPP
 */
class TmdbApiService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey  = Env::get('TMDB_API_KEY');
        $this->baseUrl = Env::get('TMDB_BASE_URL', 'https://api.themoviedb.org/3');
    }

    /**
     * Search movies
     */
    public function search(string $query, int $page = 1, string $language = 'pt-PT'): array
    {
        $cacheKey = "search_{$query}_{$page}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request('/search/movie', [
            'query'    => $query,
            'page'     => $page,
            'language' => $language,
        ]);

        CacheHelper::set($cacheKey, $result, 900); // 15 min
        return $result;
    }

    /**
     * Get trending movies
     */
    public function getTrending(int $page = 1, string $language = 'pt-PT'): array
    {
        $cacheKey = "trending_{$page}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request('/trending/movie/day', [
            'page'     => $page,
            'language' => $language,
        ]);

        CacheHelper::set($cacheKey, $result, 3600); // 1h
        return $result;
    }

    /**
     * Get popular movies
     */
    public function getPopular(int $page = 1, string $language = 'pt-PT'): array
    {
        $cacheKey = "popular_{$page}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request('/movie/popular', [
            'page'     => $page,
            'language' => $language,
        ]);

        CacheHelper::set($cacheKey, $result, 3600);
        return $result;
    }

    /**
     * Get top rated movies
     */
    public function getTopRated(int $page = 1, string $language = 'pt-PT'): array
    {
        $cacheKey = "top_rated_{$page}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request('/movie/top_rated', [
            'page'     => $page,
            'language' => $language,
        ]);

        CacheHelper::set($cacheKey, $result, 3600);
        return $result;
    }

    /**
     * Get movie details
     */
    public function getMovieDetails(int $tmdbId, string $language = 'pt-PT'): array
    {
        $cacheKey = "movie_{$tmdbId}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request("/movie/{$tmdbId}", [
            'language'           => $language,
            'append_to_response' => 'credits,videos,similar',
        ]);

        CacheHelper::set($cacheKey, $result, 21600); // 6h
        return $result;
    }

    /**
     * Get genre list
     */
    public function getGenres(string $language = 'pt-PT'): array
    {
        $cacheKey = "genres_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request('/genre/movie/list', [
            'language' => $language,
        ]);

        CacheHelper::set($cacheKey, $result, 86400); // 24h
        return $result;
    }

    /**
     * Discover movies by genre
     */
    public function discover(array $params, string $language = 'pt-PT'): array
    {
        $params['language'] = $language;
        $cacheKey = 'discover_' . md5(json_encode($params));
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request('/discover/movie', $params);

        CacheHelper::set($cacheKey, $result, 3600);
        return $result;
    }

    /**
     * Get similar movies
     */
    public function getSimilar(int $tmdbId, string $language = 'pt-PT'): array
    {
        $cacheKey = "similar_{$tmdbId}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request("/movie/{$tmdbId}/similar", [
            'language' => $language,
        ]);

        CacheHelper::set($cacheKey, $result, 3600);
        return $result;
    }

    /**
     * Make HTTP request to TMDB API using cURL
     * cURL is more reliable than file_get_contents for HTTPS on Windows/XAMPP
     */
    private function request(string $endpoint, array $params = []): array
    {
        $params['api_key'] = $this->apiKey;
        $url = $this->baseUrl . $endpoint . '?' . http_build_query($params);

        // Try cURL first (most reliable on Windows/XAMPP)
        if (function_exists('curl_init')) {
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL            => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 15,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTPHEADER     => [
                    'Accept: application/json',
                    'User-Agent: SuloMovies/1.0',
                ],
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => 0,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error    = curl_error($ch);
            curl_close($ch);

            if ($response === false || $httpCode === 0) {
                return ['error' => 'Failed to connect to TMDB API: ' . $error];
            }

            if ($httpCode >= 400) {
                $decoded = json_decode($response, true);
                $msg = $decoded['status_message'] ?? "HTTP {$httpCode}";
                return ['error' => "TMDB API error: {$msg}"];
            }

            $data = json_decode($response, true);
            return $data ?? ['error' => 'Invalid JSON response from TMDB'];
        }

        // Fallback to file_get_contents with SSL context options
        $context = stream_context_create([
            'http' => [
                'method'  => 'GET',
                'header'  => "Accept: application/json\r\nUser-Agent: SuloMovies/1.0\r\n",
                'timeout' => 15,
            ],
            'ssl' => [
                'verify_peer'      => false,
                'verify_peer_name' => false,
            ],
        ]);

        $response = @file_get_contents($url, false, $context);

        if ($response === false) {
            return ['error' => 'Failed to connect to TMDB API'];
        }

        return json_decode($response, true) ?? ['error' => 'Invalid JSON from TMDB'];
    }
}
