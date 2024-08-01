<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldNamesToUserRoomSettingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_room_settings', function (Blueprint $table) {
            $table->tinyInteger('push_to_talk')->default(1)->after('mute_incoming_sound');
            $table->tinyInteger('lock_mic')->default(0)->after('push_to_talk');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_room_settings', function (Blueprint $table) {
            //
        });
    }
}
