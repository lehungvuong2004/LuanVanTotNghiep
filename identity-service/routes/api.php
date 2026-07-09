<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerProfileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\RoleController;

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

// Lấy danh sách banner active (public)
Route::get('banners', [BannerController::class, 'getActiveBanners']);

// Tin tức public
Route::get('news',        [NewsController::class, 'index']);
Route::get('news/{slug}', [NewsController::class, 'show']);

// API nội bộ cho các service khác gọi
Route::post('internal/notifications', [NotificationController::class, 'createInternal']);
Route::post('internal/users/by-ids',  [AuthController::class, 'getUsersByIdsInternal']);
Route::post('internal/customer/profile-status', [CustomerProfileController::class, 'getCustomerProfileStatusInternal']);

Route::middleware('auth:api')->group(function () {
  Route::post('auth/logout',    [AuthController::class, 'logout']);
  Route::get('profile',         [AuthController::class, 'getProfile']);
  Route::put('profile',         [AuthController::class, 'updateProfile']);
  Route::post('profile/avatar', [AuthController::class, 'uploadAvatar']);

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

  //  ADMIN — Chỉ Admin (role_id = 1) — phân quyền trong controller
  Route::prefix('admin')->group(function () {
    // Users
    Route::get('users',              [AuthController::class, 'getUsers']);
    Route::post('users/by-ids',      [AuthController::class, 'getUsersByIds']);
    Route::get('users/search-ids',   [AuthController::class, 'searchUserIds']);
    Route::post('users',             [AuthController::class, 'createUser']);
    Route::get('users/{id}',         [AuthController::class, 'getUser']);
    Route::put('users/{id}',         [AuthController::class, 'updateUser']);
    Route::patch('users/{id}/status', [AuthController::class, 'toggleUserStatus']);
    Route::delete('users/{id}',      [AuthController::class, 'deleteUser']);
    // dasboard
    Route::post('users/bulk-delete', [AuthController::class, 'bulkDeleteUsers']);


    // Notifications — Admin broadcast & manage
    Route::get('notifications',            [NotificationController::class, 'adminIndex']);
    Route::post('notifications/send',      [NotificationController::class, 'send']);
    Route::post('notifications/broadcast', [NotificationController::class, 'broadcast']);

    // Banners — Admin CRUD & Toggle Status
    Route::get('banners',                  [BannerController::class, 'adminIndex']);
    Route::post('banners',                 [BannerController::class, 'store']);
    Route::get('banners/{id}',             [BannerController::class, 'show']);
    Route::put('banners/{id}',             [BannerController::class, 'update']);
    Route::patch('banners/{id}/status',     [BannerController::class, 'toggleStatus']);
    Route::delete('banners/{id}',          [BannerController::class, 'destroy']);

    // News — Admin CRUD & Toggle Status
    Route::get('news',                     [NewsController::class, 'adminIndex']);
    Route::post('news',                    [NewsController::class, 'store']);
    Route::put('news/{id}',               [NewsController::class, 'update']);
    Route::patch('news/{id}/status',       [NewsController::class, 'toggleStatus']);
    Route::delete('news/{id}',             [NewsController::class, 'destroy']);

    // Roles — Admin CRUD
    Route::get('roles',                    [RoleController::class, 'index']);
    Route::post('roles',                   [RoleController::class, 'store']);
    Route::get('roles/{id}',               [RoleController::class, 'show']);
    Route::put('roles/{id}',               [RoleController::class, 'update']);
    Route::delete('roles/{id}',            [RoleController::class, 'destroy']);
  });
});
