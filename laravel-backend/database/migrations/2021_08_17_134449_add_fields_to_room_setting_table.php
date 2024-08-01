<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldsToRoomSettingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('room_settings', function (Blueprint $table) {
            $table->tinyInteger('give_mic_to_all')->after('disable_invitation')->default(0);
            $table->tinyInteger('remove_all_mics')->after('give_mic_to_all')->default(0);
            $table->tinyInteger('simultaneous_mics')->after('remove_all_mics')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('room_settings', function (Blueprint $table) {
            //
        });
    }
}
