<?php

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

function getDatabase()
{
    $uri = $_ENV['MONGO_URL'] ?? 'mongodb://localhost:27017/placebooking';
    try {
        $client = new Client($uri);
        return $client->selectDatabase('test');
    } catch (Exception $e) {
        die("Error connecting to database: " . $e->getMessage());
    }
}
