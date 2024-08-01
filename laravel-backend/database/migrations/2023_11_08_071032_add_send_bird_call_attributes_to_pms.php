<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSendBirdCallAttributesToPms extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pms', function (Blueprint $table) {
            $table->string('send_bird_audio_call_room_id')->nullable();
            $table->string('send_bird_video_call_room_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pms', function (Blueprint $table) {
            $table->dropColumns(['send_bird_video_call_room_id','send_bird_audio_call_room_id']);
        });
    }
}
