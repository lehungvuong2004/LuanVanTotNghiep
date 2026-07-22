<?php

require __DIR__ . '/../identity-service/vendor/autoload.php';
$app = require_once __DIR__ . '/../identity-service/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Storage;
use App\Services\ImageUploadService;

echo "--- TESTING IDENTITY SERVICE R2 CONFIG --- \n";
echo "Bucket: " . config('filesystems.disks.s3.bucket') . "\n";
echo "Key: " . config('filesystems.disks.s3.key') . "\n";
echo "Endpoint: " . config('filesystems.disks.s3.endpoint') . "\n";
echo "Path style: " . (config('filesystems.disks.s3.use_path_style_endpoint') ? 'true' : 'false') . "\n";

try {
    $service = new ImageUploadService();
    // Simulate fake file upload
    $tempFile = sys_get_temp_dir() . '/r2_test_' . time() . '.png';
    file_put_contents($tempFile, 'fake image content');
    
    $uploadedFile = new \Illuminate\Http\UploadedFile(
        $tempFile,
        'r2_test.png',
        'image/png',
        null,
        true
    );

    $res = $service->upload($uploadedFile, 'banners');
    echo "UPLOAD SUCCESSFUL!\n";
    echo "Path: " . $res['path'] . "\n";
    echo "URL: " . $res['url'] . "\n";

} catch (\Throwable $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
