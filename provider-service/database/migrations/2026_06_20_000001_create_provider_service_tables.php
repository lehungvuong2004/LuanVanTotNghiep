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
        Schema::create('helper_profiles', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('user_id')->unique();
            $table->text('bio')->nullable();
            $table->integer('experience_year')->default(0);
            $table->string('gender', 20)->nullable();
            $table->date('birthday')->nullable();
            $table->string('address', 255)->nullable();
            $table->string('status', 30)->default('pending');
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
        });

        Schema::create('helper_working_areas', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('helper_id');
            $table->string('district', 100);
            $table->string('city', 100);

            $table->foreign('helper_id', 'fk_helper_working_areas_helper')
                  ->references('id')
                  ->on('helper_profiles')
                  ->onDelete('cascade');
        });

        Schema::create('helper_verifications', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('helper_id');
            $table->integer('admin_id')->nullable();
            $table->string('status', 30)->default('pending');
            $table->string('note', 191)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('helper_id', 'fk_helper_verifications_helper')
                  ->references('id')
                  ->on('helper_profiles')
                  ->onDelete('cascade');
        });

        Schema::create('service_categories', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->string('name', 100);
            $table->string('description', 500)->nullable();
            $table->string('icon', 255)->nullable();
            $table->string('type', 30)->default('both');
            $table->string('status', 30)->default('active');
        });

        Schema::create('services', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('category_id');
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->decimal('base_price', 18, 2);
            $table->string('price_type', 30)->default('hourly');
            $table->string('status', 30)->default('active');

            $table->foreign('category_id', 'fk_services_categories')
                  ->references('id')
                  ->on('service_categories');
        });

        Schema::create('helper_skills', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('helper_id');
            $table->integer('service_id');

            $table->foreign('helper_id', 'fk_helper_skills_helper')
                  ->references('id')
                  ->on('helper_profiles')
                  ->onDelete('cascade');

            $table->foreign('service_id', 'fk_helper_skills_service')
                  ->references('id')
                  ->on('services')
                  ->onDelete('cascade');

            $table->unique(['helper_id', 'service_id'], 'uq_helper_skills');
        });

        Schema::create('helper_availabilities', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('helper_id');
            $table->date('available_date');
            $table->time('start_time');
            $table->string('status', 30)->default('available');

            $table->foreign('helper_id', 'fk_helper_availabilities_helper')
                  ->references('id')
                  ->on('helper_profiles')
                  ->onDelete('cascade');

            $table->unique(['helper_id', 'available_date', 'start_time'], 'uq_helper_availability');
        });

        Schema::create('favorites', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('customer_id');
            $table->integer('helper_id');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('helper_id', 'fk_favorites_helper')
                  ->references('id')
                  ->on('helper_profiles')
                  ->onDelete('cascade');

            $table->unique(['customer_id', 'helper_id'], 'uq_favorites');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('helper_availabilities');
        Schema::dropIfExists('helper_skills');
        Schema::dropIfExists('services');
        Schema::dropIfExists('service_categories');
        Schema::dropIfExists('helper_verifications');
        Schema::dropIfExists('helper_working_areas');
        Schema::dropIfExists('helper_profiles');
    }
};
