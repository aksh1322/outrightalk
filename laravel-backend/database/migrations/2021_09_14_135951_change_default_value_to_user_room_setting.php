<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeDefaultValueToUserRoomSetting extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \DB::statement('ALTER TABLE `user_room_settings` CHANGE `autoscrool_text` `autoscrool_text` TINYINT NOT NULL DEFAULT 1;');
        \DB::statement('ALTER TABLE `user_room_settings` CHANGE `incoming_text_format` `incoming_text_format` TINYINT NOT NULL DEFAULT 1;');
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
