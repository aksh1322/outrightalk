<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddEnumValueToRoomUserTable extends Migration
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
            $table->enum('is_admin', ['0', '1', '2', '3'])->default('3')->comment('0 => Normal User, 1 => Head Admin, 2 => Admin, 3 => Owner')->after('user_id');
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