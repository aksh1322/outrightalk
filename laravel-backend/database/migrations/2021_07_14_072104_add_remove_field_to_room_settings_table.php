<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRemoveFieldToRoomSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('room_settings', function (Blueprint $table) {
            $table->dropColumn(['under_age_id']);
        });

        Schema::table('room_settings', function (Blueprint $table) {
            $table->integer('under_age')->unsigned()->default(0)->after('room_id');
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
