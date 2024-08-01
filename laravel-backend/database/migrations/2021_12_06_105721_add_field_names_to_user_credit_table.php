<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldNamesToUserCreditTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_credits', function (Blueprint $table) {
            $table->enum('process', ['add', 'deduct'])->default('add')->after('credit_type');
            $table->integer('point_redeemed')->default(0)->after('points');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_credits', function (Blueprint $table) {
            //
        });
    }
}
