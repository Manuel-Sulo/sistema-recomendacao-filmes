<?php
/**
 * Router — Lightweight HTTP router
 * Maps METHOD + URI pattern → Controller::method
 */
class Router
{
    private array $routes = [];
    private array $middlewares = [];

    /**
     * Register a route
     */
    public function add(string $method, string $pattern, string $controller, string $action, array $middleware = []): void
    {
        $this->routes[] = [
            'method'     => strtoupper($method),
            'pattern'    => $pattern,
            'controller' => $controller,
            'action'     => $action,
            'middleware'  => $middleware,
        ];
    }

    public function get(string $pattern, string $controller, string $action, array $middleware = []): void
    {
        $this->add('GET', $pattern, $controller, $action, $middleware);
    }

    public function post(string $pattern, string $controller, string $action, array $middleware = []): void
    {
        $this->add('POST', $pattern, $controller, $action, $middleware);
    }

    public function put(string $pattern, string $controller, string $action, array $middleware = []): void
    {
        $this->add('PUT', $pattern, $controller, $action, $middleware);
    }

    public function delete(string $pattern, string $controller, string $action, array $middleware = []): void
    {
        $this->add('DELETE', $pattern, $controller, $action, $middleware);
    }

    /**
     * Resolve a request to a route
     */
    public function resolve(Request $request): void
    {
        $method = $request->getMethod();
        $uri    = $request->getUri();

        // Handle preflight OPTIONS
        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;

            $params = $this->matchPattern($route['pattern'], $uri);
            if ($params === false) continue;

            // Set params on request
            $request->setParams($params);

            // Execute middleware
            foreach ($route['middleware'] as $middlewareClass) {
                $mw = new $middlewareClass();
                $mw->handle($request);
            }

            // Execute controller action
            $controller = new $route['controller']();
            $action     = $route['action'];
            $controller->$action($request);
            return;
        }

        Response::notFound('Route not found: ' . $method . ' ' . $uri);
    }

    /**
     * Match a URI pattern like /api/movies/{id} against a URI
     * Returns params array or false
     */
    private function matchPattern(string $pattern, string $uri)
    {
        // Convert pattern to regex
        $regex = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $pattern);
        $regex = '#^' . $regex . '$#';

        if (preg_match($regex, $uri, $matches)) {
            // Extract named params
            $params = [];
            foreach ($matches as $key => $value) {
                if (is_string($key)) {
                    $params[$key] = $value;
                }
            }
            return $params;
        }
        return false;
    }
}
