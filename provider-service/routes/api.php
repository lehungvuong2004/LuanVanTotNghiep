<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HelperController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\AdminProviderController;

Route::prefix('providers')->group(function () {

  // ============================================================
  //  PUBLIC — Không cần token
  // ============================================================

  // Tìm kiếm & xem hồ sơ helper
  Route::get('helpers',          [HelperController::class, 'publicList']);
  Route::get('helpers/{id}',     [HelperController::class, 'publicShow']);
  Route::get('helpers/{id}/status-check', [HelperController::class, 'profileStatusCheck']);
  Route::get('helper-user-ids',  [HelperController::class, 'getHelperUserIds']);

  // Internal — được gọi từ order-service
  Route::post('internal/update-helper-rating', [HelperController::class, 'updateHelperRating']);

  // Danh mục & dịch vụ
  Route::get('service-categories',      [ServiceController::class, 'listCategories']);
  Route::get('service-categories/{id}', [ServiceController::class, 'showCategory']);
  Route::get('services',               [ServiceController::class, 'listServices']);
  Route::get('services/enriched',      [ServiceController::class, 'listServicesEnriched']);
  Route::get('services/{id}',          [ServiceController::class, 'showService']);
  Route::get('services/{id}/helpers',  [ServiceController::class, 'serviceHelpers']);

  // ============================================================
  //  AUTHENTICATED — Yêu cầu JWT token (mọi role)
  // ============================================================
  Route::middleware('jwt.auth')->group(function () {

    // -- Helper: quản lý hồ sơ của mình (role: helper) --
    Route::prefix('helper')->group(function () {
      Route::get('dashboard-stats',      [HelperController::class, 'dashboardStats']);
      Route::get('profile',              [HelperController::class, 'myProfile']);
      Route::post('profile',             [HelperController::class, 'createProfile']);
      Route::put('profile',              [HelperController::class, 'updateProfile']);

      Route::get('skills',               [HelperController::class, 'listSkills']);
      Route::post('skills',              [HelperController::class, 'addSkill']);
      Route::delete('skills/{serviceId}', [HelperController::class, 'removeSkill']);

      Route::get('working-areas',        [HelperController::class, 'listWorkingAreas']);
      Route::post('working-areas',       [HelperController::class, 'addWorkingArea']);
      Route::delete('working-areas/{id}', [HelperController::class, 'removeWorkingArea']);

      Route::get('availability',         [HelperController::class, 'listAvailability']);
      Route::post('availability',        [HelperController::class, 'addAvailability']);
      Route::delete('availability/{id}', [HelperController::class, 'removeAvailability']);

      Route::post('verification',        [HelperController::class, 'submitVerification']);
      Route::get('verification',         [HelperController::class, 'myVerificationStatus']);
    });

    // -- Customer: yêu thích (role: customer) --
    Route::prefix('favorites')->group(function () {
      Route::get('/',                [FavoriteController::class, 'index']);
      Route::post('{helperId}',      [FavoriteController::class, 'store']);
      Route::delete('{helperId}',    [FavoriteController::class, 'destroy']);
      Route::get('{helperId}/check', [FavoriteController::class, 'check']);
    });

    // ============================================================
    //  ADMIN + OPERATOR — phân quyền trong controller
    // ============================================================
    Route::prefix('admin')->group(function () {

      // Helpers management
      Route::get('helpers',               [AdminProviderController::class, 'listHelpers']);
      Route::get('helpers/stats',         [AdminProviderController::class, 'stats']);
      Route::get('helpers/{id}',          [AdminProviderController::class, 'showHelper']);
      Route::patch('helpers/{id}/verify', [AdminProviderController::class, 'verifyHelper']);
      Route::patch('helpers/{id}/status', [AdminProviderController::class, 'toggleHelperStatus']);
      Route::delete('helpers/{id}',       [AdminProviderController::class, 'deleteHelper']);
      Route::post('helpers/bulk-delete',  [AdminProviderController::class, 'bulkDeleteHelpers']);

      // Service Categories (Admin only — enforced in controller)
      Route::get('service-categories',         [ServiceController::class, 'adminListCategories']);
      Route::post('service-categories',        [ServiceController::class, 'createCategory']);
      Route::put('service-categories/{id}',    [ServiceController::class, 'updateCategory']);
      Route::delete('service-categories/{id}', [ServiceController::class, 'deleteCategory']);

      // Services (Admin only — enforced in controller)
      Route::get('services',          [ServiceController::class, 'adminListServices']);
      Route::post('services',         [ServiceController::class, 'createService']);
      Route::put('services/{id}',     [ServiceController::class, 'updateService']);
      Route::delete('services/{id}',  [ServiceController::class, 'deleteService']);
    });
  });
});
