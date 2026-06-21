<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerProfileController;
use App\Http\Controllers\NotificationController;

// ============================================================
//  PUBLIC — Không cần token
// ============================================================
Route::prefix('auth')->group(function () {
  Route::post('login',          [AuthController::class, 'login']);
  Route::post('register',       [AuthController::class, 'register']);
  Route::post('google',         [AuthController::class, 'googleLogin']);
  Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
  Route::post('verify-otp',     [AuthController::class, 'verifyOtp']);
  Route::post('reset-password', [AuthController::class, 'resetPassword']);
  Route::post('refresh',        [AuthController::class, 'refreshToken']);
});
Route::middleware('auth:api')->group(function () {
  Route::post('auth/logout',    [AuthController::class, 'logout']);
  Route::get('profile',         [AuthController::class, 'getProfile']);
  Route::put('profile',         [AuthController::class, 'updateProfile']);

  // -- Customer Profile & Addresses (role: customer) --
  Route::prefix('customer')->group(function () {
    Route::get('profile',                      [CustomerProfileController::class, 'getProfile']);
    Route::put('profile',                      [CustomerProfileController::class, 'updateProfile']);
    Route::get('addresses',                    [CustomerProfileController::class, 'listAddresses']);
    Route::post('addresses',                   [CustomerProfileController::class, 'addAddress']);
    Route::put('addresses/{id}',               [CustomerProfileController::class, 'updateAddress']);
    Route::delete('addresses/{id}',            [CustomerProfileController::class, 'deleteAddress']);
    Route::patch('addresses/{id}/default',     [CustomerProfileController::class, 'setDefaultAddress']);
  });

  // -- Notifications (Customer & Helper xem của mình) --
  Route::prefix('notifications')->group(function () {
    Route::get('/',                  [NotificationController::class, 'index']);
    Route::patch('{id}/read',        [NotificationController::class, 'markRead']);
    Route::patch('read-all',         [NotificationController::class, 'markAllRead']);
    Route::delete('{id}',            [NotificationController::class, 'destroy']);
  });

  // ============================================================
  //  ADMIN — Chỉ Admin (role_id = 1) — phân quyền trong controller
  // ============================================================
  Route::prefix('admin')->group(function () {

    // Users
    Route::get('users',              [AuthController::class, 'getUsers']);
    Route::post('users',             [AuthController::class, 'createUser']);
    Route::get('users/{id}',         [AuthController::class, 'getUser']);
    Route::put('users/{id}',         [AuthController::class, 'updateUser']);
    Route::patch('users/{id}/status', [AuthController::class, 'toggleUserStatus']);
    Route::delete('users/{id}',      [AuthController::class, 'deleteUser']);

    // Notifications — Admin broadcast & manage
    Route::get('notifications',            [NotificationController::class, 'adminIndex']);
    Route::post('notifications/send',      [NotificationController::class, 'send']);
    Route::post('notifications/broadcast', [NotificationController::class, 'broadcast']);
  });
});
