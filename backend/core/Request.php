<?php
/**
 * Request — HTTP request abstraction
 */
class Request
{
    private string $method;
    private string $uri;
    private array  $params;
    private array  $query;
    private ?array $body;
    private array  $headers;

    public function __construct()
    {
        $this->method  = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $this->uri     = $this->parseUri();
        $this->query   = $_GET;
        $this->body    = $this->parseBody();
        $this->headers = $this->parseHeaders();
        $this->params  = [];
    }

    private function parseUri(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';

        // Auto-detect base path from SCRIPT_NAME (works on WAMP, XAMPP, any Apache)
        // SCRIPT_NAME will be e.g. "/srf-movies/backend/public/index.php"
        // We extract the directory part as the base path to strip from REQUEST_URI
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $basePath = rtrim(dirname($scriptName), '/\\');

        // Also support configured base paths for backwards compatibility
        $basePaths = array_filter([
            $basePath,
            Env::get('APP_BASE_PATH', ''),
        ]);

        foreach ($basePaths as $bp) {
            if ($bp && strpos($uri, $bp) === 0) {
                $uri = substr($uri, strlen($bp));
                break;
            }
        }

        // Remove query string
        $uri = strtok($uri, '?');
        // Normalize
        $uri = '/' . trim($uri, '/');
        return $uri;
    }

    private function parseBody(): ?array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            return json_decode($raw, true) ?? [];
        }
        return $_POST ?: null;
    }

    private function parseHeaders(): array
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $name = str_replace('_', '-', substr($key, 5));
                $headers[strtolower($name)] = $value;
            }
        }
        return $headers;
    }

    public function getMethod(): string { return $this->method; }
    public function getUri(): string    { return $this->uri; }
    public function getQuery(): array   { return $this->query; }
    public function getBody(): ?array   { return $this->body; }
    public function getHeaders(): array { return $this->headers; }
    public function getParams(): array  { return $this->params; }

    public function getHeader(string $name): ?string
    {
        return $this->headers[strtolower($name)] ?? null;
    }

    public function getQueryParam(string $key, $default = null)
    {
        return $this->query[$key] ?? $default;
    }

    public function getBodyParam(string $key, $default = null)
    {
        return $this->body[$key] ?? $default;
    }

    public function getParam(string $key, $default = null)
    {
        return $this->params[$key] ?? $default;
    }

    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    public function getBearerToken(): ?string
    {
        // Try standard header first
        $auth = $this->getHeader('authorization');

        // Fallback: Apache mod_rewrite puts it in REDIRECT_HTTP_AUTHORIZATION
        if (!$auth && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        // Fallback: apache_request_headers() (works with mod_php)
        if (!$auth && function_exists('apache_request_headers')) {
            $apacheHeaders = apache_request_headers();
            $auth = $apacheHeaders['Authorization'] ?? $apacheHeaders['authorization'] ?? null;
        }

        if ($auth && strpos($auth, 'Bearer ') === 0) {
            return substr($auth, 7);
        }
        return null;
    }
}
