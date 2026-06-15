<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('google', [AuthController::class, 'googleLogin']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    // phải được xác định bằng token.
    Route::middleware('auth:api')->group(function () {
        Route::get('users', [AuthController::class, 'getUsers']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::put('users/{id}', [AuthController::class, 'updateUser']);
        Route::delete('users/{id}', [AuthController::class, 'deleteUser']);
    });
});