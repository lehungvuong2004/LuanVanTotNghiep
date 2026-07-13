<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    if (!Schema::hasTable('permissions')) {
      Schema::create('permissions', function (Blueprint $table) {
        $table->integer('id')->autoIncrement();
        $table->string('name', 100)->unique();
        $table->string('module', 50);
        $table->string('description', 191)->nullable();
        $table->timestamp('created_at')->useCurrent();
      });
    }

    if (!Schema::hasTable('role_has_permissions')) {
      Schema::create('role_has_permissions', function (Blueprint $table) {
        $table->integer('role_id');
        $table->integer('permission_id');
        $table->primary(['role_id', 'permission_id']);

        $table->foreign('role_id', 'fk_rhp_role')
          ->references('id')
          ->on('roles')
          ->onDelete('cascade');

        $table->foreign('permission_id', 'fk_rhp_permission')
          ->references('id')
          ->on('permissions')
          ->onDelete('cascade');
      });
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('role_has_permissions');
    Schema::dropIfExists('permissions');
  }
};
