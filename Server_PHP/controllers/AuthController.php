<?php

namespace Rentopia\Controllers;

use Rentopia\Models\User;
use Rentopia\Utils\MongoSerializer;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function register()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($name) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing fields']);
            return;
        }

        try {
            $existingUser = $this->userModel->findByEmail($email);
            if ($existingUser) {
                http_response_code(409);
                echo json_encode(['error' => 'Email already registered']);
                return;
            }

            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            $user = $this->userModel->create($name, $email, $hashedPassword);

            echo json_encode(MongoSerializer::serialize($user));
        } catch (\Exception $e) {
            http_response_code(422);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $user = $this->userModel->findByEmail($email);

        if ($user && password_verify($password, $user->password)) {
            $payload = [
                'email' => $user->email,
                'id' => (string) $user->_id
            ];

            $jwtSecret = $_ENV['JWT_SECRET'] ?? 'your_default_secret';
            $token = JWT::encode($payload, $jwtSecret, 'HS256');

            // Set cookie (mimicking res.cookie)
            setcookie('token', $token, [
                'expires' => time() + 86400, // 1 day
                'path' => '/',
                'domain' => '', // Adjust if needed
                'secure' => true, // Assuming HTTPS or localhost with secure flag
                'httponly' => true,
                'samesite' => 'None'
            ]);

            echo json_encode(MongoSerializer::serialize($user));
        } else {
            http_response_code(422);
            echo json_encode('pass not ok');
        }
    }

    public function profile()
    {
        $token = $_COOKIE['token'] ?? null;
        if ($token) {
            try {
                $jwtSecret = $_ENV['JWT_SECRET'] ?? 'your_default_secret';
                $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));

                $user = $this->userModel->findById($decoded->id);
                if ($user) {
                    echo json_encode([
                        'name' => $user->name,
                        'email' => $user->email,
                        '_id' => (string) $user->_id,
                        'subscription' => $user->subscription ?? null
                    ]);
                } else {
                    echo json_encode(null);
                }
            } catch (\Exception $e) {
                echo json_encode(null);
            }
        } else {
            echo json_encode(null);
        }
    }

    public function logout()
    {
        setcookie('token', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None'
        ]);
        echo json_encode(true);
    }
}
