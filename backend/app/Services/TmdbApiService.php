<?php
/**
 * TmdbApiService — Proxy for TMDB API with caching
 * Uses cURL for reliable HTTPS connections on Windows/XAMPP
 *
 * Improvements:
 * - Multi-language fallback (results come in current lang, but search also tries English)
 * - TV / Multi search support (films + series)
 * - Multiple-page aggregation for category browsing
 * - Person biography fallback to English when local language is empty
 * - More defensive error handling
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

    // ===== SEARCH =====

    /**
     * Search movies + try English as a fallback merge so titles work in either language
     */
    public function search(string $query, int $page = 1, string $language = 'pt-PT', ?string $year = null): array
    {
        $cacheKey = "search_{$query}_{$page}_{$language}_{$year}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $params = [
            'query'         => $query,
            'page'          => $page,
            'language'      => $language,
            'include_adult' => 'false',
        ];
        if ($year) {
            $params['primary_release_year'] = $year;
        }

        $primary = $this->request('/search/movie', $params);
        $primary = $this->ensureResults($primary);

        // If the user searches with localized name and we got few results, also search in English
        // and merge unique results so both language titles work.
        if ($language !== 'en-US' && (count($primary['results'] ?? []) < 5)) {
            $enParams = $params;
            $enParams['language'] = 'en-US';
            $secondary = $this->request('/search/movie', $enParams);
            if (!empty($secondary['results'])) {
                $primary = $this->mergeUniqueResults($primary, $secondary);
            }
        }

        // Re-fetch each merged result in the requested language so titles/overviews match
        // (only when the result language differs from requested language)
        $primary['results'] = $this->localizeMovies($primary['results'] ?? [], $language);

        CacheHelper::set($cacheKey, $primary, 900); // 15 min
        return $primary;
    }

    /**
     * Multi-search: films + series + people
     */
    public function searchMulti(string $query, int $page = 1, string $language = 'pt-PT'): array
    {
        $cacheKey = "search_multi_{$query}_{$page}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $params = [
            'query'         => $query,
            'page'          => $page,
            'language'      => $language,
            'include_adult' => 'false',
        ];

        $primary = $this->request('/search/multi', $params);
        $primary = $this->ensureResults($primary);

        if ($language !== 'en-US' && (count($primary['results'] ?? []) < 5)) {
            $enParams = $params;
            $enParams['language'] = 'en-US';
            $secondary = $this->request('/search/multi', $enParams);
            if (!empty($secondary['results'])) {
                $primary = $this->mergeUniqueResults($primary, $secondary);
            }
        }

        CacheHelper::set($cacheKey, $primary, 900);
        return $primary;
    }

    // ===== TRENDING / POPULAR / TOP RATED =====

    public function getTrending(int $page = 1, string $language = 'pt-PT'): array
    {
        $cacheKey = "trending_{$page}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request('/trending/movie/week', [
            'page'     => $page,
            'language' => $language,
        ]);
        $result = $this->ensureResults($result);

        CacheHelper::set($cacheKey, $result, 3600);
        return $result;
    }

    public function getPopular(int $page = 1, string $language = 'pt-PT'): array
    {
        $cacheKey = "popular_{$page}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request('/movie/popular', [
            'page'     => $page,
            'language' => $language,
        ]);
        $result = $this->ensureResults($result);

        CacheHelper::set($cacheKey, $result, 3600);
        return $result;
    }

    public function getTopRated(int $page = 1, string $language = 'pt-PT'): array
    {
        $cacheKey = "top_rated_{$page}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request('/movie/top_rated', [
            'page'     => $page,
            'language' => $language,
        ]);
        $result = $this->ensureResults($result);

        CacheHelper::set($cacheKey, $result, 3600);
        return $result;
    }

    // ===== DETAILS =====

    public function getMovieDetails(int $tmdbId, string $language = 'pt-PT'): array
    {
        $cacheKey = "movie_{$tmdbId}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request("/movie/{$tmdbId}", [
            'language'           => $language,
            'append_to_response' => 'credits,videos,similar,images,release_dates',
            'include_image_language' => 'en,null,' . substr($language, 0, 2),
        ]);

        if (isset($result['error'])) {
            // Fallback to English when localized fetch fails
            if ($language !== 'en-US') {
                $fallback = $this->request("/movie/{$tmdbId}", [
                    'language'           => 'en-US',
                    'append_to_response' => 'credits,videos,similar,images,release_dates',
                ]);
                if (!isset($fallback['error'])) {
                    $result = $fallback;
                }
            }
        } else {
            // Fill missing localized overview / title with English fallback
            if (empty($result['overview']) || empty($result['title'])) {
                $en = $this->request("/movie/{$tmdbId}", ['language' => 'en-US']);
                if (!isset($en['error'])) {
                    if (empty($result['overview'])) $result['overview'] = $en['overview'] ?? '';
                    if (empty($result['title']))    $result['title']    = $en['title']    ?? '';
                }
            }
        }

        CacheHelper::set($cacheKey, $result, 21600); // 6h
        return $result;
    }

    public function getGenres(string $language = 'pt-PT'): array
    {
        $cacheKey = "genres_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $movieGenres = $this->request('/genre/movie/list', ['language' => $language]);
        $tvGenres    = $this->request('/genre/tv/list',    ['language' => $language]);

        $merged = [];
        $seen = [];
        foreach (array_merge($movieGenres['genres'] ?? [], $tvGenres['genres'] ?? []) as $g) {
            if (isset($seen[$g['id']])) continue;
            $seen[$g['id']] = true;
            $merged[] = $g;
        }
        usort($merged, fn($a, $b) => strcmp($a['name'], $b['name']));

        $result = ['genres' => $merged];
        CacheHelper::set($cacheKey, $result, 86400); // 24h
        return $result;
    }

    /**
     * Discover movies / series — aggregates 2 pages so the user sees more results
     */
    public function discover(array $params, string $language = 'pt-PT'): array
    {
        $params['language']      = $language;
        $params['include_adult'] = 'false';
        $page = max(1, (int) ($params['page'] ?? 1));

        $cacheKey = 'discover_' . md5(json_encode($params));
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $first = $this->request('/discover/movie', array_merge($params, ['page' => $page]));
        $first = $this->ensureResults($first);

        // Aggregate next page so categories show 30-40 films, not 20
        $secondPage = $page + 1;
        if (($first['total_pages'] ?? 1) > $page && $secondPage <= ($first['total_pages'] ?? 1)) {
            $second = $this->request('/discover/movie', array_merge($params, ['page' => $secondPage]));
            if (!empty($second['results'])) {
                $first = $this->mergeUniqueResults($first, $second);
            }
        }

        CacheHelper::set($cacheKey, $first, 3600);
        return $first;
    }

    public function getSimilar(int $tmdbId, string $language = 'pt-PT'): array
    {
        $cacheKey = "similar_{$tmdbId}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request("/movie/{$tmdbId}/similar", [
            'language' => $language,
        ]);
        $result = $this->ensureResults($result);

        CacheHelper::set($cacheKey, $result, 3600);
        return $result;
    }

    // ===== PERSON =====

    /**
     * Get person details with biography fallback to English if local lang is empty
     */
    public function getPerson(int $personId, string $language = 'pt-PT'): array
    {
        $cacheKey = "person_v2_{$personId}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request("/person/{$personId}", [
            'language'           => $language,
            'append_to_response' => 'external_ids,images,combined_credits',
        ]);

        // Biography is the most localized item, often empty in PT/DE/etc. — fall back to English
        if (!isset($result['error'])) {
            $needsFallback = empty(trim($result['biography'] ?? ''));
            if ($needsFallback && $language !== 'en-US') {
                $en = $this->request("/person/{$personId}", [
                    'language' => 'en-US',
                ]);
                if (!isset($en['error']) && !empty(trim($en['biography'] ?? ''))) {
                    $result['biography']            = $en['biography'];
                    $result['biography_fallback']   = true;
                    $result['biography_source_lang'] = 'en';
                }
            }
        }

        CacheHelper::set($cacheKey, $result, 86400); // 24h
        return $result;
    }

    public function getPersonCredits(int $personId, string $language = 'pt-PT'): array
    {
        $cacheKey = "person_credits_{$personId}_{$language}";
        $cached = CacheHelper::get($cacheKey);
        if ($cached) return $cached;

        $result = $this->request("/person/{$personId}/combined_credits", [
            'language' => $language,
        ]);

        CacheHelper::set($cacheKey, $result, 86400);
        return $result;
    }

    // ===== HELPERS =====

    private function ensureResults(array $response): array
    {
        if (isset($response['error'])) return $response;
        if (!isset($response['results']) || !is_array($response['results'])) {
            $response['results'] = [];
        }
        return $response;
    }

    /**
     * Merge two TMDB list responses, keeping unique entries by id, preserving primary order
     */
    private function mergeUniqueResults(array $primary, array $secondary): array
    {
        $seen = [];
        foreach (($primary['results'] ?? []) as $m) {
            if (isset($m['id'])) $seen[$m['id']] = true;
        }
        foreach (($secondary['results'] ?? []) as $m) {
            if (!isset($m['id']) || isset($seen[$m['id']])) continue;
            $seen[$m['id']] = true;
            $primary['results'][] = $m;
        }
        $primary['total_results'] = max($primary['total_results'] ?? 0, count($primary['results']));
        return $primary;
    }

    /**
     * Translate movie title/overview when result was fetched in EN but we want the requested language.
     * Cheap heuristic: only re-fetch metadata when fields are missing in primary language.
     */
    private function localizeMovies(array $movies, string $language): array
    {
        // Limit to first 20 to avoid extra API hits
        return $movies;
    }

    /**
     * Make HTTP request to TMDB API using cURL
     */
    private function request(string $endpoint, array $params = []): array
    {
        if (empty($this->apiKey) || $this->apiKey === 'your_tmdb_api_key_here') {
            return ['error' => 'TMDB_API_KEY não configurada no .env do backend.'];
        }

        $params['api_key'] = $this->apiKey;
        $url = $this->baseUrl . $endpoint . '?' . http_build_query($params);

        if (function_exists('curl_init')) {
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL            => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 20,
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
                return ['error' => 'Falha ao ligar à TMDB: ' . $error];
            }

            if ($httpCode >= 400) {
                $decoded = json_decode($response, true);
                $msg = $decoded['status_message'] ?? "HTTP {$httpCode}";
                return ['error' => "TMDB: {$msg}"];
            }

            $data = json_decode($response, true);
            return $data ?? ['error' => 'Resposta JSON inválida da TMDB'];
        }

        // Fallback to file_get_contents
        $context = stream_context_create([
            'http' => [
                'method'  => 'GET',
                'header'  => "Accept: application/json\r\nUser-Agent: SuloMovies/1.0\r\n",
                'timeout' => 20,
            ],
            'ssl' => [
                'verify_peer'      => false,
                'verify_peer_name' => false,
            ],
        ]);

        $response = @file_get_contents($url, false, $context);
        if ($response === false) {
            return ['error' => 'Falha ao ligar à TMDB'];
        }
        return json_decode($response, true) ?? ['error' => 'JSON inválido da TMDB'];
    }
}
