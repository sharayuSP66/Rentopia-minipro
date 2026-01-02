<?php

namespace Rentopia\Controllers;

use Rentopia\Models\Booking;
use Rentopia\Utils\AuthMiddleware;
use Rentopia\Utils\MongoSerializer;

class BookingController
{
    private $bookingModel;

    public function __construct()
    {
        $this->bookingModel = new Booking();
    }

    public function createBooking()
    {
        $userData = AuthMiddleware::authorize();
        $data = json_decode(file_get_contents('php://input'), true);

        $place = $data['place'] ?? null;
        $checkIn = $data['checkIn'] ?? null;
        $checkOut = $data['checkOut'] ?? null;
        $numberOfGuests = $data['numberOfGuests'] ?? null;
        $name = $data['name'] ?? null;
        $phone = $data['phone'] ?? null;
        $price = $data['price'] ?? null;

        // Check for overlaps
        $overlapping = $this->bookingModel->findOverlapping($place, $checkIn, $checkOut);

        if (count($overlapping) > 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Property is not available for the selected dates']);
            return;
        }

        $bookingData = [
            'place' => $place,
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
            'numberOfGuests' => $numberOfGuests,
            'name' => $name,
            'phone' => $phone,
            'price' => $price,
            'user' => $userData->id
        ];

        $booking = $this->bookingModel->create($bookingData);
        echo json_encode(MongoSerializer::serialize($booking));
    }

    public function getBookings()
    {
        $userData = AuthMiddleware::authorize();
        $bookings = $this->bookingModel->findByUser($userData->id)->toArray();

        // Populate 'place' for each booking
        $placeModel = new \Rentopia\Models\Place();

        $result = [];
        foreach ($bookings as $booking) {
            $serialized = MongoSerializer::serialize($booking);

            // Populate place details
            if (isset($serialized['place'])) {
                $place = $placeModel->findById($serialized['place']);
                $serialized['place'] = MongoSerializer::serialize($place);
            }

            $result[] = $serialized;
        }

        echo json_encode($result);
    }

    public function cancelBooking($id)
    {
        $userData = AuthMiddleware::authorize();
        $booking = $this->bookingModel->findById($id);

        if ($booking) {
            $bookingData = MongoSerializer::serialize($booking);
            if ($bookingData['user'] === $userData->id) {
                $this->bookingModel->updateStatus($id, 'cancelled');
                $updatedBooking = $this->bookingModel->findById($id);
                echo json_encode(MongoSerializer::serialize($updatedBooking));
            } else {
                http_response_code(403);
                echo json_encode('Unauthorized');
            }
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
        }
    }

    public function markPaymentFailed($id)
    {
        $userData = AuthMiddleware::authorize();
        $booking = $this->bookingModel->findById($id);

        if ($booking) {
            $bookingData = MongoSerializer::serialize($booking);
            if ($bookingData['user'] === $userData->id) {
                $this->bookingModel->updateStatus($id, 'payment_failed');
                echo json_encode(['success' => true]);
            } else {
                http_response_code(403);
                echo json_encode(['error' => 'Unauthorized']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
        }
    }

    public function confirmPayment($id)
    {
        $userData = AuthMiddleware::authorize();
        $booking = $this->bookingModel->findById($id);

        if ($booking) {
            $bookingData = MongoSerializer::serialize($booking);
            if ($bookingData['user'] === $userData->id) {
                // Update booking status to confirmed
                $this->bookingModel->updateStatus($id, 'confirmed');

                // Send email notifications
                try {
                    require_once __DIR__ . '/../utils/Mailer.php';
                    $mailer = new \Rentopia\Utils\Mailer();

                    // Get user details
                    $userModel = new \Rentopia\Models\User();
                    $user = $userModel->findById($userData->id);

                    // Get place details and owner info
                    $placeModel = new \Rentopia\Models\Place();
                    $placeId = $bookingData['place']['_id'] ?? $bookingData['place'];
                    $place = $placeModel->findById($placeId);
                    $placeData = MongoSerializer::serialize($place);

                    // Get owner details
                    $ownerId = $placeData['owner'] ?? null;
                    $owner = $ownerId ? $userModel->findById($ownerId) : null;

                    // Prepare booking data with ID
                    $bookingData['_id'] = $id;

                    // Send payment confirmation to user
                    if ($user && isset($user['email'])) {
                        $mailer->sendPaymentConfirmationToUser(
                            $user['email'],
                            $user['name'] ?? 'Guest',
                            $bookingData,
                            $placeData,
                            ['amount' => $bookingData['price'], 'status' => 'confirmed']
                        );
                    }

                    // Send booking notification to property owner
                    if ($owner && isset($owner['email'])) {
                        $mailer->sendBookingNotificationToOwner(
                            $owner['email'],
                            $owner['name'] ?? 'Property Owner',
                            $bookingData,
                            $placeData
                        );
                    }
                } catch (\Exception $e) {
                    // Log error but don't fail the payment confirmation
                    error_log("Email notification error: " . $e->getMessage());
                }

                echo json_encode(['success' => true]);
            } else {
                http_response_code(403);
                echo json_encode(['error' => 'Unauthorized']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
        }
    }
}
