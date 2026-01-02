<?php

require 'vendor/autoload.php';

use Dotenv\Dotenv;

// Load .env
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Handle Static Files for PHP Built-in Server
if (php_sapi_name() === 'cli-server') {
    $url = parse_url($_SERVER['REQUEST_URI']);
    $file = __DIR__ . $url['path'];
    if (is_file($file)) {
        return false;
    }
}

// CORS Headers
$frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:5173';
header("Access-Control-Allow-Origin: " . $frontendUrl);
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Basic Router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove /api prefix if present
$uri = str_replace('/api', '', $uri);

require_once 'controllers/AuthController.php';
require_once 'controllers/PlaceController.php';
require_once 'controllers/BookingController.php';
require_once 'controllers/ReviewController.php';
require_once 'controllers/PaymentController.php';
require_once 'controllers/UploadController.php';
require_once 'controllers/SubscriptionController.php';

use Rentopia\Controllers\AuthController;
use Rentopia\Controllers\PlaceController;
use Rentopia\Controllers\BookingController;
use Rentopia\Controllers\ReviewController;
use Rentopia\Controllers\PaymentController;
use Rentopia\Controllers\UploadController;
use Rentopia\Controllers\SubscriptionController;

$authController = new AuthController();
$placeController = new PlaceController();
$bookingController = new BookingController();
$reviewController = new ReviewController();
$paymentController = new PaymentController();
$uploadController = new UploadController();
$subscriptionController = new SubscriptionController();

// Simple matching (Regex could be better for params, but strict switch for now)

// Handle dynamic routes manually first
if (preg_match('/^\/places\/([a-f0-9]+)\/reviews$/', $uri, $matches)) {
    if ($method === 'GET')
        $reviewController->getPlaceReviews($matches[1]);
    exit();
}
if (preg_match('/^\/places\/([a-f0-9]+)$/', $uri, $matches)) {
    if ($method === 'GET')
        $placeController->getPlaceById($matches[1]);
    exit();
}
if (preg_match('/^\/user-places\/([a-f0-9]+)$/', $uri, $matches)) {
    if ($method === 'POST')
        $placeController->deletePlace($matches[1]);
    exit();
}
if (preg_match('/^\/bookings\/([a-f0-9]+)\/cancel$/', $uri, $matches)) {
    if ($method === 'POST')
        $bookingController->cancelBooking($matches[1]);
    exit();
}
if (preg_match('/^\/bookings\/([a-f0-9]+)\/payment-failed$/', $uri, $matches)) {
    if ($method === 'POST')
        $bookingController->markPaymentFailed($matches[1]);
    exit();
}
if (preg_match('/^\/bookings\/([a-f0-9]+)\/confirm-payment$/', $uri, $matches)) {
    if ($method === 'POST')
        $bookingController->confirmPayment($matches[1]);
    exit();
}
if (preg_match('/^\/bookings\/([a-f0-9]+)\/can-review$/', $uri, $matches)) {
    if ($method === 'GET')
        $reviewController->canReviewBooking($matches[1]);
    exit();
}

switch ($uri) {
    // Auth
    case '/register':
        if ($method === 'POST')
            $authController->register();
        break;
    case '/login':
        if ($method === 'POST')
            $authController->login();
        break;
    case '/profile':
        if ($method === 'GET')
            $authController->profile();
        break;
    case '/logout':
        if ($method === 'POST')
            $authController->logout();
        break;

    // Uploads
    case '/upload-by-link':
        if ($method === 'POST')
            $uploadController->uploadByLink();
        break;
    case '/upload':
        if ($method === 'POST')
            $uploadController->uploadImages();
        break;

    // Places
    case '/places':
        if ($method === 'GET')
            $placeController->getAllPlaces();
        if ($method === 'POST')
            $placeController->createPlace();
        if ($method === 'PUT')
            $placeController->updatePlace();
        break;
    case '/user-places':
        if ($method === 'GET')
            $placeController->getUserPlaces();
        break;

    // Bookings
    case '/bookings':
        if ($method === 'POST')
            $bookingController->createBooking();
        if ($method === 'GET')
            $bookingController->getBookings();
        break;

    // Reviews
    case '/reviews':
        if ($method === 'POST')
            $reviewController->createReview();
        break;
    case '/owner/feedback':
        if ($method === 'GET')
            $reviewController->getOwnerFeedback();
        break;

    // Payments
    case '/placesBooking':
        if ($method === 'POST')
            $paymentController->createOrder();
        break;
    case '/verify':
        if ($method === 'POST')
            $paymentController->verifyPayment();
        break;

    // Subscription
    case '/subscription/order':
        if ($method === 'POST')
            $subscriptionController->createOrder();
        break;
    case '/subscription/verify':
        if ($method === 'POST')
            $subscriptionController->verifyPayment();
        break;

    // Test
    case '/test':
        echo json_encode('test ok');
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Not Found', 'uri' => $uri]);
        break;
}
