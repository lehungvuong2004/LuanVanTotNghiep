<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('google', [AuthController::class, 'googleLogin']);
    // phải được xác định bằng token.
    Route::middleware('auth:api')->group(function () {
        Route::get('users', [AuthController::class, 'getUsers']);
    });
});