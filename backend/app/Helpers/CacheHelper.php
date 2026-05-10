<?php
/**
 * CacheHelper — File-based cache for TMDB API responses
 */
class CacheHelper
{
    private static string $cacheDir = __DIR__ . '/../../storage/cache/';

    public static function get(string $key): ?array
    {
        $file = self::getFilePath($key);
        if (!file_exists($file)) return null;

        $data = json_decode(file_get_contents($file), true);
        if (!$data || !isset($data['expires_at'])) return null;

        if ($data['expires_at'] < time()) {
            unlink($file);
            return null;
        }

        return $data['value'];
    }

    public static function set(string $key, $value, int $ttlSeconds = 3600): void
    {
        $dir = self::$cacheDir;
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $data = [
            'value'      => $value,
            'expires_at' => time() + $ttlSeconds,
            'created_at' => date('Y-m-d H:i:s'),
        ];

        file_put_contents(self::getFilePath($key), json_encode($data));
    }

    public static function delete(string $key): void
    {
        $file = self::getFilePath($key);
        if (file_exists($file)) unlink($file);
    }

    public static function clear(): void
    {
        $dir = self::$cacheDir;
        if (!is_dir($dir)) return;

        $files = glob($dir . '*.json');
        foreach ($files as $file) {
            unlink($file);
        }
    }

    private static function getFilePath(string $key): string
    {
        return self::$cacheDir . md5($key) . '.json';
    }
}
