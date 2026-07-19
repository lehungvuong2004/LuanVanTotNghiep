<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerProfileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\MessageController;

//  PUBLIC — Không cần token
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

// contact
Route::post('contacts', [ContactController::class, 'store']);

// API nội bộ cho các service khác gọi
Route::post('internal/notifications', [NotificationController::class, 'createInternal']);
Route::post('internal/users/by-ids',  [AuthController::class, 'getUsersByIdsInternal']);
Route::post('internal/customer/profile-status', [CustomerProfileController::class, 'getCustomerProfileStatusInternal']);

Route::middleware('auth:api')->group(function () {
  Route::post('auth/logout',    [AuthController::class, 'logout']);
  Route::get('me',              [AuthController::class, 'me']);
  Route::get('profile',         [AuthController::class, 'getProfile']);
  Route::put('profile',         [AuthController::class, 'updateProfile']);
  Route::post('profile/avatar', [AuthController::class, 'uploadAvatar']);

  // -- Customer Profile & Addresses (role: customer) --
  Route::prefix('customer')->group(function () {
    Route::get('profile',                      [CustomerProfileController::class, 'getProfile'])->middleware('permission:customer_profile.view');
    Route::put('profile',                      [CustomerProfileController::class, 'updateProfile'])->middleware('permission:customer_profile.update');
    Route::get('addresses',                    [CustomerProfileController::class, 'listAddresses'])->middleware('permission:customer_addresses.view');
    Route::post('addresses',                   [CustomerProfileController::class, 'addAddress'])->middleware('permission:customer_addresses.create');
    Route::put('addresses/{id}',               [CustomerProfileController::class, 'updateAddress'])->middleware('permission:customer_addresses.update');
    Route::delete('addresses/{id}',            [CustomerProfileController::class, 'deleteAddress'])->middleware('permission:customer_addresses.delete');
    Route::patch('addresses/{id}/default',     [CustomerProfileController::class, 'setDefaultAddress'])->middleware('permission:customer_addresses.update');
  });

  // -- Notifications (Customer & Helper xem của mình) --
  Route::prefix('notifications')->group(function () {
    Route::get('/',                  [NotificationController::class, 'index'])->middleware('permission:notifications.view');
    Route::patch('{id}/read',        [NotificationController::class, 'markRead'])->middleware('permission:notifications.view');
    Route::patch('read-all',         [NotificationController::class, 'markAllRead'])->middleware('permission:notifications.view');
    Route::delete('{id}',            [NotificationController::class, 'destroy'])->middleware('permission:notifications.view');
  });

  // -- Messages (Chat 1-1) --
  Route::prefix('messages')->group(function () {
    Route::post('/',                  [MessageController::class, 'send'])->middleware('permission:messages.send');
    Route::get('conversations',       [MessageController::class, 'getConversations'])->middleware('permission:messages.view');
    Route::get('{userId}',            [MessageController::class, 'getHistory'])->middleware('permission:messages.view');
    Route::put('read/{userId}',       [MessageController::class, 'markRead'])->middleware('permission:messages.view');
    Route::delete('{id}',             [MessageController::class, 'destroy'])->middleware('permission:messages.delete');
  });





  //  ADMIN — Quản trị viên & Nhân viên (áp dụng kiểm tra Permission)
  Route::prefix('admin')->middleware('admin')->group(function () {
    // Users Management
    Route::get('users',              [AuthController::class, 'getUsers'])->middleware('permission:users.view');
    Route::post('users/by-ids',      [AuthController::class, 'getUsersByIds'])->middleware('permission:users.view');
    Route::get('users/search-ids',   [AuthController::class, 'searchUserIds'])->middleware('permission:users.view');
    Route::get('users/{id}',         [AuthController::class, 'getUser'])->middleware('permission:users.view');
    Route::post('users',             [AuthController::class, 'createUser'])->middleware('permission:users.create');
    Route::post('users/upload',      [AuthController::class, 'uploadUserAvatar'])->middleware('permission:users.update');
    Route::put('users/{id}',         [AuthController::class, 'updateUser'])->middleware('permission:users.update');
    Route::patch('users/{id}/status', [AuthController::class, 'toggleUserStatus'])->middleware('permission:users.lock');
    Route::delete('users/{id}',      [AuthController::class, 'deleteUser'])->middleware('permission:users.delete');
    Route::post('users/bulk-delete', [AuthController::class, 'bulkDeleteUsers'])->middleware('permission:users.delete');

    // Notifications Management
    Route::get('notifications',            [NotificationController::class, 'adminIndex'])->middleware('permission:notifications.view');
    Route::post('notifications/send',      [NotificationController::class, 'send'])->middleware('permission:notifications.send');
    Route::post('notifications/broadcast', [NotificationController::class, 'broadcast'])->middleware('permission:notifications.send');

    // Banners Management
    Route::get('banners',                  [BannerController::class, 'adminIndex'])->middleware('permission:banners.view');
    Route::get('banners/{id}',             [BannerController::class, 'show'])->middleware('permission:banners.view');
    Route::post('banners',                 [BannerController::class, 'store'])->middleware('permission:banners.create');
    Route::post('banners/upload',          [BannerController::class, 'uploadImage'])->middleware('permission:banners.update');
    Route::put('banners/{id}',             [BannerController::class, 'update'])->middleware('permission:banners.update');
    Route::patch('banners/{id}/status',     [BannerController::class, 'toggleStatus'])->middleware('permission:banners.update');
    Route::delete('banners/{id}',          [BannerController::class, 'destroy'])->middleware('permission:banners.delete');

    // News Management
    Route::get('news',                     [NewsController::class, 'adminIndex'])->middleware('permission:news.view');
    Route::post('news',                    [NewsController::class, 'store'])->middleware('permission:news.create');
    Route::post('news/upload',             [NewsController::class, 'uploadImage'])->middleware('permission:news.update');
    Route::put('news/{id}',               [NewsController::class, 'update'])->middleware('permission:news.update');
    Route::patch('news/{id}/status',       [NewsController::class, 'toggleStatus'])->middleware('permission:news.update');
    Route::delete('news/{id}',             [NewsController::class, 'destroy'])->middleware('permission:news.delete');

    // Roles Management
    Route::get('roles',                    [RoleController::class, 'index'])->middleware('permission:roles.view');
    Route::get('roles/{id}',               [RoleController::class, 'show'])->middleware('permission:roles.view');
    Route::post('roles',                   [RoleController::class, 'store'])->middleware('permission:roles.create');
    Route::put('roles/{id}',               [RoleController::class, 'update'])->middleware('permission:roles.update');
    Route::delete('roles/{id}',            [RoleController::class, 'destroy'])->middleware('permission:roles.delete');

    // Permissions Management
    Route::get('permissions',              [PermissionController::class, 'index'])->middleware('permission:permissions.view');
    Route::get('permissions/{id}',         [PermissionController::class, 'show'])->middleware('permission:permissions.view');
    Route::post('permissions',             [PermissionController::class, 'store'])->middleware('permission:permissions.create');
    Route::put('permissions/{id}',         [PermissionController::class, 'update'])->middleware('permission:permissions.update');
    Route::delete('permissions/{id}',      [PermissionController::class, 'destroy'])->middleware('permission:permissions.delete');

    // Activity Logs Management
    Route::get('activity-logs',            [ActivityLogController::class, 'index'])->middleware('permission:activity_logs.view');
    Route::delete('activity-logs/{id}',    [ActivityLogController::class, 'destroy'])->middleware('permission:activity_logs.view');
    Route::delete('activity-logs-clear',   [ActivityLogController::class, 'clear'])->middleware('permission:activity_logs.view');

    // Contacts Management
    Route::get('contacts',               [ContactController::class, 'index'])->middleware('permission:contacts.view');
    Route::patch('contacts/{id}/process', [ContactController::class, 'process'])->middleware('permission:contacts.process');
    Route::delete('contacts/{id}',       [ContactController::class, 'destroy'])->middleware('permission:contacts.delete');

    // Messages Management
    Route::get('messages',               [MessageController::class, 'adminIndex'])->middleware('permission:messages.view');
    Route::delete('messages/{id}',       [MessageController::class, 'adminDestroy'])->middleware('permission:messages.delete');
  });
});
