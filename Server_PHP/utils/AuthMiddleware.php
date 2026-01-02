<?php

namespace Rentopia\Utils;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware
{
    public static function authorize()
    {
        $token = $_COOKIE['token'] ?? null;
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }

        try {
            $jwtSecret = $_ENV['JWT_SECRET'] ?? 'your_default_secret';
            $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));
            return $decoded;
        } catch (\Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Invalid token']);
            exit();
        }
    }
}
