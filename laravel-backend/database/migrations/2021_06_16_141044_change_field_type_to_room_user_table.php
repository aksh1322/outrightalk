<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeFieldTypeToRoomUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('room_users', function (Blueprint $table) {
            $table->dropColumn(['is_admin']);
        });
        Schema::table('room_users', function (Blueprint $table) {
            $table->tinyInteger('is_admin')->default('0')->comment('0 => Normal User, 1 => ADmin, 2 => Head Admin')->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('room_users', function (Blueprint $table) {
            //
        });
    }
}