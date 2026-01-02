<?php

namespace Rentopia\Controllers;

use Rentopia\Models\User;
use Rentopia\Utils\Mailer;
use Razorpay\Api\Api;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class SubscriptionController
{
    private $userModel;
    private $razorpay;

    public function __construct()
    {
        $this->userModel = new User();

        // Try both possible env variable names for compatibility
        $keyId = $_ENV['RAZORPAY_KEY_ID'] ?? $_ENV['KEY_ID'] ?? '';
        $keySecret = $_ENV['RAZORPAY_KEY_SECRET'] ?? $_ENV['KEY_SECRET'] ?? '';

        if (!empty($keyId) && !empty($keySecret)) {
            $this->razorpay = new Api($keyId, $keySecret);
        }
    }

    private function getUserIdFromToken()
    {
        $token = $_COOKIE['token'] ?? null;
        if (!$token)
            return null;

        try {
            $jwtSecret = $_ENV['JWT_SECRET'] ?? 'your_default_secret';
            $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));
            return $decoded->id;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function createOrder()
    {
        // Check if Razorpay is configured
        if (!$this->razorpay) {
            http_response_code(500);
            echo json_encode(['error' => 'Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env']);
            return;
        }

        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        try {
            // Plan definitions (could be DB driven later)
            // 500 INR = 50000 paise
            $amount = 50000;

            $orderData = [
                'receipt' => 'rcpt_' . $userId . '_' . time(),
                'amount' => $amount,
                'currency' => 'INR',
                'notes' => ['plan' => 'annual_listing']
            ];

            $order = $this->razorpay->order->create($orderData);

            // Include the key_id so frontend uses the same key
            $keyId = $_ENV['RAZORPAY_KEY_ID'] ?? $_ENV['KEY_ID'] ?? '';

            echo json_encode([
                'id' => $order['id'],
                'amount' => $order['amount'],
                'currency' => $order['currency'],
                'key_id' => $keyId
            ]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Razorpay Error: ' . $e->getMessage()]);
        }
    }

    public function verifyPayment()
    {
        // Check if Razorpay is configured
        if (!$this->razorpay) {
            http_response_code(500);
            echo json_encode(['error' => 'Payment gateway not configured.']);
            return;
        }

        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        $razorpayOrderId = $data['razorpay_order_id'] ?? '';
        $razorpayPaymentId = $data['razorpay_payment_id'] ?? '';
        $razorpaySignature = $data['razorpay_signature'] ?? '';

        if (empty($razorpayOrderId) || empty($razorpayPaymentId) || empty($razorpaySignature)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing payment details']);
            return;
        }

        try {
            // Verify Signature
            $attributes = [
                'razorpay_order_id' => $razorpayOrderId,
                'razorpay_payment_id' => $razorpayPaymentId,
                'razorpay_signature' => $razorpaySignature
            ];

            $this->razorpay->utility->verifyPaymentSignature($attributes);

            // Payment valid, update user
            $subscriptionData = [
                'status' => 'active',
                'plan' => 'annual_listing',
                'paymentId' => $razorpayPaymentId,
                // Valid for 1 year
                'expiry' => new \MongoDB\BSON\UTCDateTime((time() + (365 * 24 * 60 * 60)) * 1000)
            ];

            $this->userModel->updateSubscription($userId, $subscriptionData);

            // Send Email
            $user = $this->userModel->findById($userId);
            if ($user && isset($user->email)) {
                $mailer = new Mailer();
                $mailer->sendSubscriptionConfirmation($user->email, $user->name, 'Annual Listing Plan', '500.00');
            }

            echo json_encode(['success' => true]);

        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Payment verification failed: ' . $e->getMessage()]);
        }
    }
}
