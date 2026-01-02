<?php

namespace Rentopia\Models;

require_once __DIR__ . '/../config/database.php';

class User
{
    private $collection;

    public function __construct()
    {
        $db = getDatabase();
        $this->collection = $db->users;
    }

    public function create($name, $email, $password)
    {
        $insertOneResult = $this->collection->insertOne([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'createdAt' => new \MongoDB\BSON\UTCDateTime(),
        ]);
        return $this->findById($insertOneResult->getInsertedId());
    }

    public function findByEmail($email)
    {
        return $this->collection->findOne(['email' => $email]);
    }

    public function findById($id)
    {
        return $this->collection->findOne(['_id' => new \MongoDB\BSON\ObjectId($id)]);
    }

    public function updateSubscription($userId, $subscriptionData)
    {
        // Add updatedAt timestamp
        $subscriptionData['updatedAt'] = new \MongoDB\BSON\UTCDateTime();

        $this->collection->updateOne(
            ['_id' => new \MongoDB\BSON\ObjectId($userId)],
            ['$set' => ['subscription' => $subscriptionData]]
        );
    }
}
