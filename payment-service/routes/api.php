<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RefundController;

Route::prefix('payments')->group(function () {

    // ============================================================
    //  PUBLIC — VNPay callbacks (no JWT; called by VNPay server)
    // ============================================================
    Route::get('/vnpay/return', [PaymentController::class, 'vnpayReturn']);
    Route::post('/vnpay/ipn',   [PaymentController::class, 'vnpayIpn']);

    // ============================================================
    //  AUTHENTICATED — JWT required for all routes below
    // ============================================================
    Route::middleware('jwt.auth')->group(function () {

        // ============================================================
        //  ADMIN / OPERATOR — Management (Put at top to avoid conflicts)
        // ============================================================
        Route::prefix('admin')->group(function () {
            Route::get('/stats',                 [PaymentController::class, 'stats']);

            // Payments
            Route::get('/',                      [PaymentController::class, 'adminIndex']);
            Route::patch('/{id}/status',         [PaymentController::class, 'adminUpdateStatus']);

            // Refunds
            Route::get('/refunds',               [RefundController::class, 'adminIndex']);
            Route::patch('/refunds/{id}/process',[RefundController::class, 'process']);
        });

        // ---- VNPAY ----
        Route::post('/vnpay/create',    [PaymentController::class, 'createVnpayUrl']);

        // ---- PAYMENTS ----
        Route::post('/helper/earnings-stats', [PaymentController::class, 'helperEarningsStats']);
        // Customer
        Route::get('/',                 [PaymentController::class, 'index']);
        Route::post('/',                [PaymentController::class, 'store']);
        Route::get('/{id}',             [PaymentController::class, 'show']);
        Route::post('/{id}/callback',   [PaymentController::class, 'callback']); // Simulate callback

        // ---- REFUNDS ----
        // Customer
        Route::post('/refunds',         [RefundController::class, 'store']);
        Route::get('/{paymentId}/refunds', [RefundController::class, 'getRefundsByPayment']);
    });
});
