<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\JobPostController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ReportController;

Route::prefix('orders')->group(function () {

  Route::get('job-posts',             [JobPostController::class, 'index']);
  Route::get('job-posts/{id}',        [JobPostController::class, 'show']);
  Route::get('reviews/helper/{helperId}', [ReviewController::class, 'helperReviews']);
  Route::post('internal/bookings/update-payment-status', [BookingController::class, 'updatePaymentStatus']);
  Route::post('internal/job-posts/update-payment-status', [JobPostController::class, 'updatePaymentStatus']);

  // Internal APIs cho cross-service calls
  Route::post('internal/service-review-stats', [ReviewController::class, 'serviceReviewStats']);
  Route::post('internal/reviews-by-helpers', [ReviewController::class, 'reviewsByHelpers']);

  Route::middleware('jwt.auth')->group(function () {

    // Customer
    Route::post('bookings',                      [BookingController::class, 'store']);
    Route::get('bookings',                       [BookingController::class, 'myBookings']);
    Route::get('bookings/{id}',                  [BookingController::class, 'show']);
    Route::patch('bookings/{id}/cancel',         [BookingController::class, 'cancel']);
    Route::post('bookings/{id}/review',          [BookingController::class, 'review']);
    Route::post('reviews',                       [ReviewController::class, 'customerCreate']);
    Route::put('reviews/{id}',                   [ReviewController::class, 'customerUpdate']);
    Route::delete('reviews/{id}',                [ReviewController::class, 'customerDestroy']);

    // Helper
    Route::get('helper/stats',                   [BookingController::class, 'helperStats']);
    Route::get('helper/bookings',                [BookingController::class, 'helperBookings']);
    Route::patch('helper/bookings/{id}/accept',  [BookingController::class, 'accept']);
    Route::patch('helper/bookings/{id}/reject',  [BookingController::class, 'reject']);
    Route::post('helper/bookings/{id}/start-moving', [BookingController::class, 'startMoving']);
    Route::post('helper/bookings/{id}/checkin',  [BookingController::class, 'checkin']);
    Route::post('helper/bookings/{id}/checkout', [BookingController::class, 'checkout']);

    // ---- JOB POSTS ----

    // Customer
    Route::get('my/job-posts',                              [JobPostController::class, 'myPosts']);
    Route::post('job-posts',                                [JobPostController::class, 'store']);
    Route::put('job-posts/{id}',                            [JobPostController::class, 'update']);
    Route::patch('job-posts/{id}/close',                    [JobPostController::class, 'close']);
    Route::delete('job-posts/{id}',                         [JobPostController::class, 'destroy']);
    Route::get('job-posts/{id}/applications',               [JobPostController::class, 'applications']);
    Route::patch('job-posts/{id}/select/{helperId}',        [JobPostController::class, 'selectHelper']);
    Route::patch('job-posts/{id}/reject/{helperId}',        [JobPostController::class, 'rejectHelper']);
    Route::post('job-posts/{id}/review',                    [JobPostController::class, 'review']);

    // Helper
    Route::get('helper/job-posts',              [JobPostController::class, 'helperBrowse']);
    Route::post('helper/job-posts/{id}/apply',  [JobPostController::class, 'apply']);
    Route::get('helper/applications',           [JobPostController::class, 'myApplications']);
    Route::patch('helper/applications/{id}/withdraw', [JobPostController::class, 'withdraw']);
    Route::patch('helper/applications/{id}/respond',  [JobPostController::class, 'respondToSelection']);

    // ---- REPORTS ----
    Route::post('reports',              [ReportController::class, 'store']);

    Route::prefix('admin')->group(function () {

      // Dashboard Overview
      Route::get('dashboard-overview',     [BookingController::class, 'dashboardOverview']);

      // Bookings
      Route::get('bookings',               [BookingController::class, 'adminIndex']);
      Route::get('bookings/{id}',          [BookingController::class, 'adminShow']);
      Route::patch('bookings/{id}/status', [BookingController::class, 'adminUpdateStatus']);

      // Job Posts
      Route::get('job-posts',               [JobPostController::class, 'adminIndex'])->middleware('permission:job_posts.view');
      Route::get('job-posts/{id}',          [JobPostController::class, 'adminShow'])->middleware('permission:job_posts.view');
      Route::patch('job-posts/{id}/status', [JobPostController::class, 'adminUpdateStatus'])->middleware('permission:job_posts.approve');
      Route::delete('job-posts/{id}',       [JobPostController::class, 'adminDestroy'])->middleware('permission:job_posts.delete');

      // Reviews
      Route::get('reviews',                 [ReviewController::class, 'adminIndex'])->middleware('permission:reviews.view');
      Route::post('reviews',                [ReviewController::class, 'adminCreate'])->middleware('permission:reviews.create');
      Route::put('reviews/{id}',            [ReviewController::class, 'adminUpdate'])->middleware('permission:reviews.update');
      Route::delete('reviews/{id}',         [ReviewController::class, 'adminDestroy'])->middleware('permission:reviews.update');

      // Reports
      Route::get('reports',                 [ReportController::class, 'adminIndex']);
      Route::delete('reports/bulk-delete',  [ReportController::class, 'bulkDestroy']);
      Route::get('reports/{id}',            [ReportController::class, 'adminShow']);
      Route::patch('reports/{id}/process',  [ReportController::class, 'process']);
      Route::delete('reports/{id}',         [ReportController::class, 'destroy']);
    });
  });
});
