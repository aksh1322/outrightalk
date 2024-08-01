<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserBadgePointTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_badge_point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_badge_point_table_id');
            $table->foreignId('user_badge_table_id');
            $table->double('amount')->nullable();
            $table->integer('points')->nullable();
            $table->tinyInteger('type')->comment('1 for credit , 2 for debit');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_badge_point_transactions');
    }
}
