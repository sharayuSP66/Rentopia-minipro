<?php

namespace Rentopia\Utils;

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class MongoSerializer
{
    /**
     * Serialize a MongoDB document to a frontend-friendly format
     * Converts ObjectId to string, UTCDateTime to ISO string
     */
    public static function serialize($document)
    {
        if ($document === null) {
            return null;
        }

        // If it's an array or iterable, process each item
        if (is_array($document) || $document instanceof \Traversable) {
            $result = [];
            foreach ($document as $key => $value) {
                $result[$key] = self::serializeValue($value);
            }
            return $result;
        }

        return self::serializeValue($document);
    }

    /**
     * Serialize a single value
     */
    private static function serializeValue($value)
    {
        if ($value instanceof ObjectId) {
            return (string) $value;
        }

        if ($value instanceof UTCDateTime) {
            return $value->toDateTime()->format('c');
        }

        if ($value instanceof \MongoDB\Model\BSONDocument) {
            return self::serialize($value->getArrayCopy());
        }

        if ($value instanceof \MongoDB\Model\BSONArray) {
            return self::serialize($value->getArrayCopy());
        }

        if (is_array($value)) {
            return self::serialize($value);
        }

        return $value;
    }

    /**
     * Serialize an array of MongoDB documents
     */
    public static function serializeMany($documents)
    {
        $result = [];
        foreach ($documents as $doc) {
            $result[] = self::serialize($doc);
        }
        return $result;
    }
}
