<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RefundController;

Route::prefix('payments')->group(function () {

    // ============================================================
    //  AUTHENTICATED — JWT required for all routes below
    // ============================================================
    Route::middleware('jwt.auth')->group(function () {

        // ---- PAYMENTS ----
        // Customer
        Route::post('/',                [PaymentController::class, 'store']);
        Route::get('/{id}',             [PaymentController::class, 'show']);
        Route::post('/{id}/callback',   [PaymentController::class, 'callback']); // Simulate callback

        // ---- REFUNDS ----
        // Customer
        Route::post('/refunds',         [RefundController::class, 'store']);
        Route::get('/{paymentId}/refunds', [RefundController::class, 'getRefundsByPayment']);

        // ============================================================
        //  ADMIN / OPERATOR — Management
        // ============================================================
        Route::prefix('admin')->group(function () {
            
            // Payments
            Route::get('/',                      [PaymentController::class, 'adminIndex']);
            Route::patch('/{id}/status',         [PaymentController::class, 'adminUpdateStatus']);

            // Refunds
            Route::get('/refunds',               [RefundController::class, 'adminIndex']);
            Route::patch('/refunds/{id}/process',[RefundController::class, 'process']);
        });
    });
});
