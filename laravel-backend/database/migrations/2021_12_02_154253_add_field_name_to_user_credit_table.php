<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldNameToUserCreditTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_credits', function (Blueprint $table) {
            $table->enum("credit_type", ['free', 'paid'])->default('free')->after('points');
            $table->softDeletes('deleted_at', 0)->after("updated_at");
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
