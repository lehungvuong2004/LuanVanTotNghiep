<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ImageUploadService
{
    /**
     * Upload an image to Cloudflare R2 (S3) with capacity check, or fallback to local.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $folder
     * @return array
     */
    public function upload($file, string $folder): array
    {
        $bucket = config('filesystems.disks.s3.bucket');
        $key    = config('filesystems.disks.s3.key');

        // Nếu đã cấu hình thông tin Cloudflare R2 (S3) -> Tải lên Cloudflare
        if ($key && $bucket) {
            $s3Disk = Storage::disk('s3');
            
            try {
                $s3Client = $s3Disk->getClient();
                
                // 1. Liệt kê các file trong Bucket để tính tổng dung lượng
                $objects = $s3Client->listObjectsV2([
                    'Bucket' => $bucket,
                ]);

                $totalSize = 0;
                if (isset($objects['Contents'])) {
                    foreach ($objects['Contents'] as $object) {
                        $totalSize += $object['Size']; // Tính bằng Byte
                    }
                }

                // 2. Quy đổi sang GB (1 GB = 1,073,741,824 Bytes)
                $totalGB = $totalSize / (1024 * 1024 * 1024);

                // 3. Nếu vượt quá ngưỡng 9.5 GB, chặn không cho upload
                if ($totalGB > 9.5) {
                    abort(400, 'Bộ nhớ hệ thống Cloudflare R2 đã đầy (vượt ngưỡng 9.5 GB), không thể upload thêm!');
                }
            } catch (\Exception $e) {
                // Log lỗi kiểm tra dung lượng nhưng cho phép tiến hành upload tiếp hoặc ngắt tuỳ bạn cấu hình
                Log::error('Cloudflare R2 capacity check error: ' . $e->getMessage());
                // Nếu muốn nghiêm ngặt chặn khi lỗi check dung lượng, bỏ comment dòng dưới:
                // abort(400, 'Lỗi kết nối bộ lưu trữ Cloudflare R2, không thể kiểm tra dung lượng.');
            }

            // 4. Upload lên R2
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $s3Disk->putFileAs($folder, $file, $filename);
            $url = $s3Disk->url($path);

            return [
                'path' => $path,
                'url'  => $url,
            ];
        }

        // Fallback: Tải lên thư mục Local public nếu chưa cấu hình R2
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
