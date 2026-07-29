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
    Schema::create('roles', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->string('name', 50)->unique();
      $table->string('description', 191)->nullable();
    });

    Schema::create('users', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->integer('role_id');
      $table->string('full_name', 100);
      $table->string('email', 191)->unique();
      $table->string('phone', 20)->nullable();
      $table->string('password', 255)->nullable();
      $table->string('avatar', 191)->nullable();
      $table->string('status', 30)->default('active');
      $table->string('google_id', 191)->nullable()->unique();
      $table->string('provider', 30)->default('local');
      $table->timestamp('created_at')->useCurrent();
      $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();

      $table->foreign('role_id', 'fk_users_roles')->references('id')->on('roles');
    });

    Schema::create('user_tokens', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->integer('user_id');
      $table->string('refresh_token', 191)->unique();
      $table->dateTime('refresh_token_expires_at');
      $table->timestamp('created_at')->useCurrent();

      $table->foreign('user_id', 'fk_user_tokens_users')
        ->references('id')
        ->on('users')
        ->onDelete('cascade');
    });

    Schema::create('contacts', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->string('full_name', 100);
      $table->string('phone', 20)->nullable();
      $table->string('email', 191)->nullable();
      $table->text('message');
      $table->string('status', 30)->default('pending');
      $table->integer('processed_by')->nullable();
      $table->dateTime('processed_at')->nullable();
      $table->timestamp('created_at')->useCurrent();

      $table->foreign('processed_by', 'fk_contacts_processed_by')
        ->references('id')
        ->on('users');
    });

    Schema::create('news', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->string('title', 150);
      $table->string('slug', 191)->unique();
      $table->string('thumbnail', 255)->nullable();
      $table->string('summary', 500)->nullable();
      $table->text('content');
      $table->string('status', 30)->default('draft');
      $table->integer('created_by')->nullable();
      $table->timestamp('created_at')->useCurrent();
      $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();

      $table->foreign('created_by', 'fk_news_created_by')
        ->references('id')
        ->on('users');
    });

    Schema::create('customer_profiles', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->integer('user_id')->unique();
      $table->string('gender', 20)->nullable();
      $table->date('birthday')->nullable();
      $table->string('note', 191)->nullable();
      $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();

      $table->foreign('user_id', 'fk_customer_profiles_users')
        ->references('id')
        ->on('users')
        ->onDelete('cascade');
    });

    Schema::create('cities', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->string('name', 100)->unique();
    });

    Schema::create('districts', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->integer('city_id');
      $table->string('name', 100);
      $table->unique(['city_id', 'name'], 'uq_id_city_district');
      $table->foreign('city_id')->references('id')->on('cities')->onDelete('cascade');
    });

    Schema::create('customer_addresses', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->integer('customer_id');
      $table->string('address', 255);
      $table->integer('city_id');
      $table->integer('district_id');
      $table->tinyInteger('is_default')->default(0);
      $table->timestamp('created_at')->useCurrent();

      $table->foreign('customer_id', 'fk_customer_addresses_customer')
        ->references('id')
        ->on('customer_profiles')
        ->onDelete('cascade');

      $table->foreign('city_id', 'fk_customer_addresses_city')
        ->references('id')
        ->on('cities');

      $table->foreign('district_id', 'fk_customer_addresses_district')
        ->references('id')
        ->on('districts');
    });

    Schema::create('notifications', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->integer('user_id');
      $table->string('title', 150)->nullable();
      $table->string('message', 1000)->nullable();
      $table->string('type', 50)->nullable();
      $table->tinyInteger('is_read')->default(0);
      $table->timestamp('created_at')->useCurrent();

      $table->foreign('user_id', 'fk_notifications_users')
        ->references('id')
        ->on('users')
        ->onDelete('cascade');
    });

    Schema::create('messages', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->integer('sender_id');
      $table->integer('receiver_id');
      $table->text('message');
      $table->string('message_type', 30)->default('text');
      $table->string('attachment', 255)->nullable();
      $table->tinyInteger('is_read')->default(0);
      $table->tinyInteger('sender_deleted')->default(0);
      $table->tinyInteger('receiver_deleted')->default(0);
      $table->timestamp('created_at')->useCurrent();

      $table->foreign('sender_id', 'fk_messages_sender')
        ->references('id')
        ->on('users')
        ->onDelete('cascade');

      $table->foreign('receiver_id', 'fk_messages_receiver')
        ->references('id')
        ->on('users')
        ->onDelete('cascade');
    });

    Schema::create('banners', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->string('title', 150)->nullable();
      $table->string('image', 255)->nullable();
      $table->string('link', 255)->nullable();
      $table->string('status', 30)->default('active');
      $table->integer('created_by')->nullable();
      $table->timestamp('created_at')->useCurrent();
      $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();

      $table->foreign('created_by', 'fk_banners_created_by')
        ->references('id')
        ->on('users');
    });

    Schema::create('activity_logs', function (Blueprint $table) {
      $table->integer('id')->autoIncrement();
      $table->integer('user_id');
      $table->string('action', 100)->nullable();
      $table->string('description', 1000)->nullable();
      $table->timestamp('created_at')->useCurrent();

      $table->foreign('user_id', 'fk_activity_logs_users')
        ->references('id')
        ->on('users');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('activity_logs');
    Schema::dropIfExists('banners');
    Schema::dropIfExists('messages');
    Schema::dropIfExists('notifications');
    Schema::dropIfExists('customer_addresses');
    Schema::dropIfExists('districts');
    Schema::dropIfExists('cities');
    Schema::dropIfExists('customer_profiles');
    Schema::dropIfExists('news');
    Schema::dropIfExists('contacts');
    Schema::dropIfExists('user_tokens');
    Schema::dropIfExists('users');
    Schema::dropIfExists('roles');
  }
};
