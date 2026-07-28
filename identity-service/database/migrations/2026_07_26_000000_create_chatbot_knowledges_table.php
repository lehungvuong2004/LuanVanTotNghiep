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
        Schema::create('chatbot_knowledges', function (Blueprint $table) {
            $table->id();
            $table->string('keyword', 100)->nullable()->index();
            $table->text('question');
            $table->text('content');
            $table->integer('created_by')->nullable();
            $table->timestamps();

            $table->foreign('created_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chatbot_knowledges');
    }
};
