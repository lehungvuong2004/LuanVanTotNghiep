<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\JobPostController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ReportController;

Route::prefix('orders')->group(function () {

    // ============================================================
    //  PUBLIC — No authentication required
    // ============================================================
    Route::get('job-posts',             [JobPostController::class, 'index']);
    Route::get('job-posts/{id}',        [JobPostController::class, 'show']);
    Route::get('reviews/helper/{helperId}', [ReviewController::class, 'helperReviews']);

    // ============================================================
    //  AUTHENTICATED — JWT required for all routes below
    // ============================================================
    Route::middleware('jwt.auth')->group(function () {

        // ---- BOOKINGS ----

        // Customer
        Route::post('bookings',                      [BookingController::class, 'store']);
        Route::get('bookings',                       [BookingController::class, 'myBookings']);
        Route::get('bookings/{id}',                  [BookingController::class, 'show']);
        Route::patch('bookings/{id}/cancel',         [BookingController::class, 'cancel']);
        Route::post('bookings/{id}/review',          [BookingController::class, 'review']);

        // Helper
        Route::get('helper/bookings',                [BookingController::class, 'helperBookings']);
        Route::patch('helper/bookings/{id}/accept',  [BookingController::class, 'accept']);
        Route::patch('helper/bookings/{id}/reject',  [BookingController::class, 'reject']);
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
        Route::post('job-posts/{id}/review',                    [JobPostController::class, 'review']);

        // Helper
        Route::get('helper/job-posts',              [JobPostController::class, 'helperBrowse']);
        Route::post('helper/job-posts/{id}/apply',  [JobPostController::class, 'apply']);
        Route::get('helper/applications',           [JobPostController::class, 'myApplications']);
        Route::patch('helper/applications/{id}/withdraw', [JobPostController::class, 'withdraw']);

        // ---- REPORTS ----
        Route::post('reports',              [ReportController::class, 'store']);

        // ============================================================
        //  ADMIN / OPERATOR — Management (role enforced per controller)
        // ============================================================
        Route::prefix('admin')->group(function () {

            // Bookings
            Route::get('bookings',               [BookingController::class, 'adminIndex']);
            Route::get('bookings/{id}',          [BookingController::class, 'adminShow']);
            Route::patch('bookings/{id}/status', [BookingController::class, 'adminUpdateStatus']);

            // Job Posts
            Route::get('job-posts',               [JobPostController::class, 'adminIndex']);
            Route::get('job-posts/{id}',          [JobPostController::class, 'adminShow']);
            Route::patch('job-posts/{id}/status', [JobPostController::class, 'adminUpdateStatus']);
            Route::delete('job-posts/{id}',       [JobPostController::class, 'adminDestroy']);

            // Reviews
            Route::get('reviews',                 [ReviewController::class, 'adminIndex']);
            Route::delete('reviews/{id}',         [ReviewController::class, 'adminDestroy']);

            // Reports
            Route::get('reports',                 [ReportController::class, 'adminIndex']);
            Route::get('reports/{id}',            [ReportController::class, 'adminShow']);
            Route::patch('reports/{id}/process',  [ReportController::class, 'process']);
        });
    });
});
