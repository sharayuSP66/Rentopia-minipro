<?php

namespace Rentopia\Controllers;

use Rentopia\Models\Review;
use Rentopia\Models\User;
use Rentopia\Models\Booking;
use Rentopia\Models\Place;
use Rentopia\Utils\AuthMiddleware;
use Rentopia\Utils\MongoSerializer;

class ReviewController
{
    private $reviewModel;

    public function __construct()
    {
        $this->reviewModel = new Review();
    }

    public function createReview()
    {
        $userData = AuthMiddleware::authorize();
        $data = json_decode(file_get_contents('php://input'), true);

        $bookingId = $data['booking'] ?? null;
        $rating = $data['rating'] ?? null;
        $comment = $data['comment'] ?? '';

        // Validate required fields
        if (!$bookingId || !$rating) {
            http_response_code(400);
            echo json_encode(['error' => 'Booking ID and rating are required']);
            return;
        }

        // Validate rating range
        if ($rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(['error' => 'Rating must be between 1 and 5']);
            return;
        }

        // Check if booking exists and belongs to user
        $bookingModel = new Booking();
        $booking = $bookingModel->findById($bookingId);

        if (!$booking) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
            return;
        }

        $bookingData = MongoSerializer::serialize($booking);

        // Verify booking belongs to this user
        if ($bookingData['user'] !== $userData->id) {
            http_response_code(403);
            echo json_encode(['error' => 'You can only review your own bookings']);
            return;
        }

        // Check if checkout date has passed
        $checkOutDate = strtotime($bookingData['checkOut']);
        if ($checkOutDate > time()) {
            http_response_code(400);
            echo json_encode(['error' => 'You can only submit feedback after checkout']);
            return;
        }

        // Check if booking was confirmed (not cancelled)
        if ($bookingData['status'] !== 'confirmed') {
            http_response_code(400);
            echo json_encode(['error' => 'You can only review confirmed bookings']);
            return;
        }

        // Check if review already exists for this booking
        $existingReview = $this->reviewModel->findByBooking($bookingId);
        if ($existingReview) {
            http_response_code(400);
            echo json_encode(['error' => 'You have already submitted feedback for this booking']);
            return;
        }

        // Create the review with all fields
        // Extract place ID - handle both populated object and plain string ID
        $placeId = is_array($bookingData['place']) ? $bookingData['place']['_id'] : $bookingData['place'];

        $reviewData = [
            'user' => $userData->id,
            'place' => $placeId,
            'booking' => $bookingId,
            'rating' => (int) $rating,
            'comment' => $comment,
            // Optional sub-ratings
            'cleanliness' => isset($data['cleanliness']) ? (int) $data['cleanliness'] : null,
            'communication' => isset($data['communication']) ? (int) $data['communication'] : null,
            'location' => isset($data['location']) ? (int) $data['location'] : null,
            'value' => isset($data['value']) ? (int) $data['value'] : null,
        ];

        // Remove null sub-ratings
        $reviewData = array_filter($reviewData, function ($value) {
            return $value !== null;
        });

        $review = $this->reviewModel->create($reviewData);
        echo json_encode(MongoSerializer::serialize($review));
    }

    public function getPlaceReviews($placeId)
    {
        $reviews = $this->reviewModel->findByPlace($placeId)->toArray();

        // Populate User
        $userModel = new User();

        $result = [];
        foreach ($reviews as $review) {
            $serialized = MongoSerializer::serialize($review);

            // Populate user name
            if (isset($serialized['user'])) {
                $user = $userModel->findById($serialized['user']);
                if ($user) {
                    $serialized['user'] = [
                        '_id' => (string) $user['_id'],
                        'name' => $user['name']
                    ];
                }
            }

            $result[] = $serialized;
        }

        echo json_encode($result);
    }

    public function getOwnerFeedback()
    {
        $userData = AuthMiddleware::authorize();

        // Get all places owned by this user
        $placeModel = new Place();
        $places = $placeModel->findByOwner($userData->id)->toArray();

        if (empty($places)) {
            echo json_encode([
                'places' => [],
                'totalReviews' => 0,
                'averageRating' => 0
            ]);
            return;
        }

        // Get place IDs
        $placeIds = array_map(function ($place) {
            return (string) $place['_id'];
        }, $places);

        // Get all reviews for these places
        $reviews = $this->reviewModel->findByPlaces($placeIds)->toArray();

        // Populate user info for each review
        $userModel = new User();
        $serializedReviews = [];
        foreach ($reviews as $review) {
            $serialized = MongoSerializer::serialize($review);
            if (isset($serialized['user'])) {
                $user = $userModel->findById($serialized['user']);
                if ($user) {
                    $serialized['user'] = [
                        '_id' => (string) $user['_id'],
                        'name' => $user['name']
                    ];
                }
            }
            $serializedReviews[] = $serialized;
        }

        // Group reviews by place and calculate stats
        $placeData = [];
        foreach ($places as $place) {
            $serializedPlace = MongoSerializer::serialize($place);
            $placeId = $serializedPlace['_id'];
            $placeReviews = array_filter($serializedReviews, function ($review) use ($placeId) {
                return $review['place'] === $placeId;
            });

            $placeReviews = array_values($placeReviews); // Re-index array
            $reviewCount = count($placeReviews);
            $avgRating = $reviewCount > 0
                ? round(array_sum(array_column($placeReviews, 'rating')) / $reviewCount, 1)
                : 0;

            $placeData[] = [
                'place' => [
                    '_id' => $placeId,
                    'title' => $serializedPlace['title'] ?? 'Unnamed Property',
                    'address' => $serializedPlace['address'] ?? '',
                    'photos' => $serializedPlace['photos'] ?? []
                ],
                'reviews' => $placeReviews,
                'reviewCount' => $reviewCount,
                'averageRating' => $avgRating
            ];
        }

        // Calculate overall stats
        $totalReviews = count($serializedReviews);
        $overallAvg = $totalReviews > 0
            ? round(array_sum(array_column($serializedReviews, 'rating')) / $totalReviews, 1)
            : 0;

        echo json_encode([
            'places' => $placeData,
            'totalReviews' => $totalReviews,
            'averageRating' => $overallAvg
        ]);
    }

    public function canReviewBooking($bookingId)
    {
        $userData = AuthMiddleware::authorize();

        $bookingModel = new Booking();
        $booking = $bookingModel->findById($bookingId);

        if (!$booking) {
            echo json_encode(['canReview' => false, 'reason' => 'Booking not found']);
            return;
        }

        $bookingData = MongoSerializer::serialize($booking);

        // Check ownership
        if ($bookingData['user'] !== $userData->id) {
            echo json_encode(['canReview' => false, 'reason' => 'Not your booking']);
            return;
        }

        // Check if checkout passed
        $checkOutDate = strtotime($bookingData['checkOut']);
        if ($checkOutDate > time()) {
            echo json_encode(['canReview' => false, 'reason' => 'Checkout date not passed']);
            return;
        }

        // Check if confirmed
        if ($bookingData['status'] !== 'confirmed') {
            echo json_encode(['canReview' => false, 'reason' => 'Booking not confirmed']);
            return;
        }

        // Check if already reviewed
        $existingReview = $this->reviewModel->findByBooking($bookingId);
        if ($existingReview) {
            echo json_encode([
                'canReview' => false,
                'reason' => 'Already reviewed',
                'review' => MongoSerializer::serialize($existingReview)
            ]);
            return;
        }

        echo json_encode(['canReview' => true]);
    }
}
