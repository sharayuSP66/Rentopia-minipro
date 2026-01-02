<?php

namespace Rentopia\Models;

require_once __DIR__ . '/../config/database.php';

use MongoDB\BSON\ObjectId;

class Place
{
    private $collection;

    public function __construct()
    {
        $db = getDatabase();
        $this->collection = $db->places;
    }

    public function create($data)
    {
        // Convert owner to ObjectId if currently string
        if (isset($data['owner']) && !($data['owner'] instanceof ObjectId)) {
            $data['owner'] = new ObjectId($data['owner']);
        }

        $insertOneResult = $this->collection->insertOne($data);
        return $this->findById($insertOneResult->getInsertedId());
    }

    public function findById($id)
    {
        return $this->collection->findOne(['_id' => new ObjectId($id)]);
    }

    public function findByOwner($ownerId)
    {
        return $this->collection->find(['owner' => new ObjectId($ownerId)]);
    }

    public function findAll()
    {
        return $this->collection->find();
    }

    public function update($id, $data)
    {
        // Don't update _id
        unset($data['_id']);
        // Don't update owner (usually) or ensure it's ObjectId
        if (isset($data['owner'])) {
            // ensure ObjectId or remove if we don't want to update it
            unset($data['owner']);
        }

        $this->collection->updateOne(
            ['_id' => new ObjectId($id)],
            ['$set' => $data]
        );
    }

    public function delete($id)
    {
        return $this->collection->deleteOne(['_id' => new ObjectId($id)]);
    }
}
