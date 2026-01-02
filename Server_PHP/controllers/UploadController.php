<?php

namespace Rentopia\Controllers;

use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;

class UploadController
{
    private $cloudinary;

    public function __construct()
    {
        // Configure Cloudinary
        Configuration::instance([
            'cloud' => [
                'cloud_name' => $_ENV['CLOUDINARY_CLOUD_NAME'] ?? '',
                'api_key' => $_ENV['CLOUDINARY_API_KEY'] ?? '',
                'api_secret' => $_ENV['CLOUDINARY_API_SECRET'] ?? '',
            ],
            'url' => [
                'secure' => true
            ]
        ]);
    }

    public function uploadByLink()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $link = $data['link'] ?? '';

        if (empty($link)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing link']);
            return;
        }

        $newName = 'photo' . time() . '.jpg';
        $tmpPath = sys_get_temp_dir() . '/' . $newName;

        try {
            // Download image
            $content = file_get_contents($link);
            if ($content === false) {
                throw new \Exception("Failed to download image");
            }
            file_put_contents($tmpPath, $content);

            // Upload to Cloudinary
            $uploadApi = new \Cloudinary\Api\Upload\UploadApi();
            $result = $uploadApi->upload($tmpPath, [
                'folder' => 'your_upload_folder',
                'public_id' => $newName,
                'resource_type' => 'auto'
            ]);

            // Clean up
            unlink($tmpPath);

            echo json_encode($result['secure_url']);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal Server Error: ' . $e->getMessage()]);
        }
    }

    public function uploadImages()
    {
        $uploadedFiles = [];

        if (!isset($_FILES['photos'])) {
            echo json_encode([]);
            return;
        }

        $files = $_FILES['photos'];

        // Check if it's a single file upload (not array) vs multiple files
        if (!is_array($files['name'])) {
            // Single file
            $tmpName = $files['tmp_name'];
            $originalName = $files['name'];
            $error = $files['error'];
            $size = $files['size'];

            // Skip if no file uploaded or there's an error
            if ($error !== UPLOAD_ERR_OK || $size === 0 || empty($tmpName)) {
                echo json_encode([]);
                return;
            }

            if (is_uploaded_file($tmpName)) {
                try {
                    $uniqueName = pathinfo($originalName, PATHINFO_FILENAME) . '_' . time();
                    $uploadApi = new \Cloudinary\Api\Upload\UploadApi();
                    $result = $uploadApi->upload($tmpName, [
                        'folder' => 'your_upload_folder',
                        'public_id' => $uniqueName,
                        'resource_type' => 'auto'
                    ]);
                    $uploadedFiles[] = $result['secure_url'];
                } catch (\Exception $e) {
                    // Log error
                    error_log("Cloudinary upload error: " . $e->getMessage());
                }
            }
        } else {
            // Multiple files
            $fileCount = count($files['name']);

            for ($i = 0; $i < $fileCount; $i++) {
                $tmpName = $files['tmp_name'][$i];
                $originalName = $files['name'][$i];
                $error = $files['error'][$i];
                $size = $files['size'][$i];

                // Skip if no file or error
                if ($error !== UPLOAD_ERR_OK || $size === 0 || empty($tmpName) || empty($originalName)) {
                    continue;
                }

                if (is_uploaded_file($tmpName)) {
                    try {
                        $uniqueName = pathinfo($originalName, PATHINFO_FILENAME) . '_' . time() . '_' . $i;
                        $uploadApi = new \Cloudinary\Api\Upload\UploadApi();
                        $result = $uploadApi->upload($tmpName, [
                            'folder' => 'your_upload_folder',
                            'public_id' => $uniqueName,
                            'resource_type' => 'auto'
                        ]);
                        $uploadedFiles[] = $result['secure_url'];
                    } catch (\Exception $e) {
                        // Log error, skip file
                        error_log("Cloudinary upload error for file $originalName: " . $e->getMessage());
                    }
                }
            }
        }

        echo json_encode($uploadedFiles);
    }
}
