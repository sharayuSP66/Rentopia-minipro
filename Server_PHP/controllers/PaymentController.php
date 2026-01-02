<?php

namespace Rentopia\Controllers;

use Razorpay\Api\Api;
use Rentopia\Utils\AuthMiddleware;

class PaymentController
{
    private $api;

    public function __construct()
    {
        // Load keys from ENV
        $keyId = $_ENV['KEY_ID'] ?? '';
        $keySecret = $_ENV['KEY_SECRET'] ?? '';

        if ($keyId && $keySecret) {
            $this->api = new Api($keyId, $keySecret);
        }
    }

    public function createOrder()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $amount = $data['amount'] ?? 0;

        if ($amount <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid amount']);
            return;
        }

        $options = [
            'amount' => (int) ($amount * 100), // Amount in paise - ensure it's an integer
            'currency' => 'INR',
        ];

        try {
            if (!$this->api) {
                throw new \Exception("Razorpay keys not configured");
            }

            $order = $this->api->order->create($options);

            // Convert Razorpay order object to array for proper JSON serialization
            $orderData = [
                'id' => $order->id,
                'entity' => $order->entity ?? 'order',
                'amount' => $order->amount,
                'amount_paid' => $order->amount_paid ?? 0,
                'amount_due' => $order->amount_due ?? $order->amount,
                'currency' => $order->currency,
                'receipt' => $order->receipt ?? null,
                'status' => $order->status ?? 'created',
            ];

            echo json_encode([
                'order' => $orderData,
                'key' => $_ENV['KEY_ID']
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => "Internal Server Error While Creating Booking: " . $e->getMessage()]);
        }
    }

    public function verifyPayment()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $response = $data['response'] ?? [];
        $razorpayOrderId = $response['razorpay_order_id'] ?? '';
        $razorpayPaymentId = $response['razorpay_payment_id'] ?? '';
        $razorpaySignature = $response['razorpay_signature'] ?? '';

        $body = $razorpayOrderId . "|" . $razorpayPaymentId;

        $expectedSignature = hash_hmac('sha256', $body, $_ENV['KEY_SECRET']);

        if ($expectedSignature === $razorpaySignature) {
            http_response_code(200);
            echo json_encode("Signature Valid");
        } else {
            http_response_code(400);
            echo json_encode("Signature Invalid");
        }
    }
}
