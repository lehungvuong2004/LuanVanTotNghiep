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
        Schema::create('payments', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('booking_id')->nullable();
            $table->integer('job_post_id')->nullable();
            $table->string('payment_method', 30)->nullable();
            $table->string('transaction_code', 100)->nullable();
            $table->decimal('amount', 18, 2)->nullable();
            $table->decimal('gross_amount', 18, 2)->nullable();
            $table->integer('commission_rate')->nullable();
            $table->decimal('commission_amount', 18, 2)->nullable();
            $table->decimal('earned_amount', 18, 2)->nullable();
            $table->string('status', 30)->default('pending');
            $table->dateTime('paid_at')->nullable();
            $table->dateTime('released_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
        DB::statement("ALTER TABLE payments ADD CONSTRAINT chk_payments_amount CHECK (amount is null or amount >= 0)");

        Schema::create('refunds', function (Blueprint $table) {
            $table->integer('id')->autoIncrement();
            $table->integer('payment_id');
            $table->decimal('amount', 18, 2)->nullable();
            $table->string('reason', 500)->nullable();
            $table->string('status', 30)->default('pending');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('payment_id', 'fk_refunds_payment')
                  ->references('id')
                  ->on('payments')
                  ->onDelete('cascade');
        });
        DB::statement("ALTER TABLE refunds ADD CONSTRAINT chk_refunds_amount CHECK (amount is null or amount >= 0)");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('payments');
    }
};
