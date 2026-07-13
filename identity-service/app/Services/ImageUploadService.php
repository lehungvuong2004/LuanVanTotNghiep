<?php

namespace App\Services;

class ImageUploadService
{
    /**
     * Upload an image to public/uploads/{folder} directory.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $folder
     * @return array
     */
    public function upload($file, string $folder): array
    {
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

        $directory = public_path("uploads/{$folder}");

        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }

        $file->move($directory, $filename);

        $path = "uploads/{$folder}/" . $filename;

        return [
            'path' => $path,
            'url'  => asset($path),
        ];
    }
}
