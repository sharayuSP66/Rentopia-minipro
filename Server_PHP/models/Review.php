<?php

namespace Rentopia\Models;

require_once __DIR__ . '/../config/database.php';

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class Review
{
    private $collection;

    public function __construct()
    {
        $db = getDatabase();
        $this->collection = $db->reviews;
    }

    public function create($data)
    {
        if (isset($data['place']))
            $data['place'] = new ObjectId($data['place']);
        if (isset($data['user']))
            $data['user'] = new ObjectId($data['user']);
        if (isset($data['booking']))
            $data['booking'] = new ObjectId($data['booking']);

        $data['createdAt'] = new UTCDateTime();

        $insertOneResult = $this->collection->insertOne($data);
        return $this->findById($insertOneResult->getInsertedId());
    }

    public function findById($id)
    {
        return $this->collection->findOne(['_id' => new ObjectId($id)]);
    }

    public function findByPlace($placeId)
    {
        return $this->collection->find(
            ['place' => new ObjectId($placeId)],
            ['sort' => ['createdAt' => -1]]
        );
    }

    public function findByBooking($bookingId)
    {
        return $this->collection->findOne(['booking' => new ObjectId($bookingId)]);
    }

    public function findByPlaces($placeIds)
    {
        // Convert string place IDs to ObjectId
        $objectIds = array_map(function ($id) {
            return new ObjectId($id);
        }, $placeIds);

        return $this->collection->find(
            ['place' => ['$in' => $objectIds]],
            ['sort' => ['createdAt' => -1]]
        );
    }
}
