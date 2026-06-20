<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->string('booking_code', 50)->nullable()->unique();
            $table->integer('customer_id');
            $table->integer('helper_id')->nullable();
            $table->integer('address_id');
            $table->date('booking_date');
            $table->time('start_time');
            $table->decimal('total_price', 18, 2);
            $table->string('status', 30)->default('pending');
            $table->string('note', 500)->nullable();
            $table->integer('cancel_by')->nullable();
            $table->string('cancel_reason', 500)->nullable();
            $table->string('refund_status', 30)->default('none');
            $table->timestamp('created_at')->useCurrent();
        });
        DB::statement("ALTER TABLE bookings ADD CONSTRAINT chk_bookings_total_price CHECK (total_price >= 0)");

        Schema::create('booking_services', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('booking_id');
            $table->integer('service_id');
            $table->decimal('price', 18, 2);
            $table->integer('duration_hours');
            $table->integer('quantity')->default(1);
            $table->integer('service_order')->default(1);
            $table->string('note', 500)->nullable();

            $table->foreign('booking_id', 'fk_booking_services_booking')
                  ->references('id')
                  ->on('bookings')
                  ->onDelete('cascade');

            $table->unique(['booking_id', 'service_id', 'service_order'], 'uq_booking_services');
        });
        DB::statement("ALTER TABLE booking_services ADD CONSTRAINT chk_booking_services_price CHECK (price >= 0)");
        DB::statement("ALTER TABLE booking_services ADD CONSTRAINT chk_booking_services_quantity CHECK (quantity > 0)");
        DB::statement("ALTER TABLE booking_services ADD CONSTRAINT chk_booking_services_duration CHECK (duration_hours in (2, 4, 6, 8))");

        Schema::create('booking_status_histories', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('booking_id');
            $table->string('old_status', 30)->nullable();
            $table->string('new_status', 30);
            $table->integer('changed_by');
            $table->string('note', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('booking_id', 'fk_booking_status_histories_booking')
                  ->references('id')
                  ->on('bookings')
                  ->onDelete('cascade');
        });

        Schema::create('booking_work_logs', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('booking_id');
            $table->integer('helper_id');
            $table->dateTime('checkin_time')->nullable();
            $table->dateTime('checkout_time')->nullable();
            $table->string('status', 30)->default('not_started');
            $table->string('note', 500)->nullable();

            $table->foreign('booking_id', 'fk_booking_work_logs_booking')
                  ->references('id')
                  ->on('bookings')
                  ->onDelete('cascade');
        });

        Schema::create('job_posts', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('customer_id');
            $table->integer('category_id')->nullable();
            $table->integer('selected_helper_id')->nullable();
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->decimal('salary', 18, 2)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('district', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('working_time', 255)->nullable();
            $table->string('status', 30)->default('pending');
            $table->dateTime('expired_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
        DB::statement("ALTER TABLE job_posts ADD CONSTRAINT chk_job_posts_salary CHECK (salary is null or salary >= 0)");

        Schema::create('job_post_services', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('job_post_id');
            $table->integer('service_id');

            $table->foreign('job_post_id', 'fk_job_post_services_post')
                  ->references('id')
                  ->on('job_posts')
                  ->onDelete('cascade');

            $table->unique(['job_post_id', 'service_id'], 'uq_job_post_services');
        });

        Schema::create('job_applications', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('job_post_id');
            $table->integer('helper_id');
            $table->string('message', 500)->nullable();
            $table->decimal('proposed_price', 18, 2)->nullable();
            $table->string('status', 30)->default('pending');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('job_post_id', 'fk_job_applications_post')
                  ->references('id')
                  ->on('job_posts')
                  ->onDelete('cascade');

            $table->unique(['job_post_id', 'helper_id'], 'uq_job_applications');
        });
        DB::statement("ALTER TABLE job_applications ADD CONSTRAINT chk_job_applications_price CHECK (proposed_price is null or proposed_price >= 0)");

        Schema::create('reviews', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('booking_id')->nullable();
            $table->integer('job_post_id')->nullable();
            $table->integer('customer_id');
            $table->integer('helper_id');
            $table->integer('rating');
            $table->string('comment', 1000)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('booking_id', 'fk_reviews_booking')
                  ->references('id')
                  ->on('bookings')
                  ->onDelete('set null');

            $table->foreign('job_post_id', 'fk_reviews_job_post')
                  ->references('id')
                  ->on('job_posts')
                  ->onDelete('set null');
        });
        DB::statement("ALTER TABLE reviews ADD CONSTRAINT chk_reviews_rating CHECK (rating between 1 and 5)");

        Schema::create('reports', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('booking_id')->nullable();
            $table->integer('job_post_id')->nullable();
            $table->integer('report_by');
            $table->integer('reported_user_id')->nullable();
            $table->string('reason', 1000)->nullable();
            $table->string('status', 30)->default('pending');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('booking_id', 'fk_reports_booking')
                  ->references('id')
                  ->on('bookings')
                  ->onDelete('set null');

            $table->foreign('job_post_id', 'fk_reports_job_post')
                  ->references('id')
                  ->on('job_posts')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('job_post_services');
        Schema::dropIfExists('job_posts');
        Schema::dropIfExists('booking_work_logs');
        Schema::dropIfExists('booking_status_histories');
        Schema::dropIfExists('booking_services');
        Schema::dropIfExists('bookings');
    }
};
