<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserRoomSettingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_room_settings', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->bigInteger('user_id')->unsigned();
            $table->bigInteger('room_id')->unsigned();
            $table->tinyInteger('autoscrool_text')->default(0);
            $table->tinyInteger('incoming_text_format')->default(0);
            $table->tinyInteger('timestamp')->default(1);
            $table->tinyInteger('nickname_alphabetically')->default(0);
            $table->tinyInteger('disable_dig_sound')->default(1);
            $table->tinyInteger('notify_join_room')->default(0);
            $table->tinyInteger('notify_exit_room')->default(0);
            $table->tinyInteger('notify_start_webcam')->default(0);
            $table->tinyInteger('notify_stop_webcam')->default(0);
            $table->tinyInteger('font')->default(0);
            $table->tinyInteger('change_room_screen')->default(0);
            $table->tinyInteger('mute_incoming_sound')->default(0);
            // $table->timestamps();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP'));
            $table->softDeletes('deleted_at', 0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_room_settings');
    }
}
