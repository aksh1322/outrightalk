<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldNameToPlayVideoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('play_videos', function (Blueprint $table) {
            $table->tinyInteger('is_accepted')->default(0)->after('room_id')->comment('0 => Nothing, 1 => Accepted, 2 => Rejected');
            $table->timestamp('accepted_at')->default(0)->after('is_accepted');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('play_videos', function (Blueprint $table) {
            //
        });
    }
}
