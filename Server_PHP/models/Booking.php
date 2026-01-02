<?php

namespace Rentopia\Models;

require_once __DIR__ . '/../config/database.php';

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class Booking
{
    private $collection;

    public function __construct()
    {
        $db = getDatabase();
        $this->collection = $db->bookings;
    }

    public function create($data)
    {
        // Convert references to ObjectId
        if (isset($data['place']))
            $data['place'] = new ObjectId($data['place']);
        if (isset($data['user']))
            $data['user'] = new ObjectId($data['user']);

        // Convert dates to UTCDateTime (Expects milliseconds)
        if (isset($data['checkIn'])) {
            $data['checkIn'] = new UTCDateTime(strtotime($data['checkIn']) * 1000);
        }
        if (isset($data['checkOut'])) {
            $data['checkOut'] = new UTCDateTime(strtotime($data['checkOut']) * 1000);
        }

        // Default status: pending_payment (will be updated after successful payment)
        if (!isset($data['status'])) {
            $data['status'] = 'pending_payment';
        }

        $insertOneResult = $this->collection->insertOne($data);
        return $this->findById($insertOneResult->getInsertedId());
    }

    public function findById($id)
    {
        return $this->collection->findOne(['_id' => new ObjectId($id)]);
    }

    public function findByUser($userId)
    {
        // bookings usually sorted by checkIn descending
        return $this->collection->find(
            ['user' => new ObjectId($userId)],
            ['sort' => ['checkIn' => -1]]
        );
    }

    public function findOverlapping($placeId, $checkIn, $checkOut)
    {
        $placeId = new ObjectId($placeId);
        $checkInDate = new UTCDateTime(strtotime($checkIn) * 1000);
        $checkOutDate = new UTCDateTime(strtotime($checkOut) * 1000);

        return $this->collection->find([
            'place' => $placeId,
            'status' => ['$in' => ['confirmed', 'pending_payment']], // Only check active bookings
            '$or' => [
                ['checkIn' => ['$lte' => $checkOutDate], 'checkOut' => ['$gte' => $checkInDate]],
                ['checkIn' => ['$gte' => $checkInDate, '$lte' => $checkOutDate]],
                ['checkOut' => ['$gte' => $checkInDate, '$lte' => $checkOutDate]]
            ]
        ])->toArray();
    }

    public function updateStatus($id, $status)
    {
        $updateData = ['status' => $status];
        if ($status === 'cancelled') {
            $updateData['cancelledAt'] = new UTCDateTime();
        }

        $this->collection->updateOne(
            ['_id' => new ObjectId($id)],
            ['$set' => $updateData]
        );
    }
}
