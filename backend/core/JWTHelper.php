<?php
/**
 * JWTHelper — Encode/decode JWT without external libraries
 */
class JWTHelper
{
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Generate a JWT token
     */
    public static function encode(array $payload): string
    {
        $secret = Env::get('JWT_SECRET');
        $expiry = (int) Env::get('JWT_EXPIRY', '86400');

        $header = self::base64UrlEncode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]));

        $payload['iat'] = time();
        $payload['exp'] = time() + $expiry;

        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payloadEncoded", $secret, true)
        );

        return "$header.$payloadEncoded.$signature";
    }

    /**
     * Decode and verify a JWT token
     * Returns payload array or null if invalid
     */
    public static function decode(string $token): ?array
    {
        $secret = Env::get('JWT_SECRET');
        $parts  = explode('.', $token);

        if (count($parts) !== 3) return null;

        [$header, $payload, $signature] = $parts;

        // Verify signature
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        );

        if (!hash_equals($expectedSignature, $signature)) return null;

        // Decode payload
        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!$data) return null;

        // Check expiration
        if (isset($data['exp']) && $data['exp'] < time()) return null;

        return $data;
    }
}
