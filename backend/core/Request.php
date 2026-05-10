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
        // Remove possible base paths
        $basePaths = ['/EngSof-lab4/backend/public', '/EngSof-lab4/backend'];
        foreach ($basePaths as $basePath) {
            if (strpos($uri, $basePath) === 0) {
                $uri = substr($uri, strlen($basePath));
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
        $auth = $this->getHeader('authorization');
        if ($auth && strpos($auth, 'Bearer ') === 0) {
            return substr($auth, 7);
        }
        return null;
    }
}
