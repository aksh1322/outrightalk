<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSendBirdChannelUrlToPmsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pms', function (Blueprint $table) {
            $table->string('send_bird_channel_url')->nullable();
            $table->string('send_bird_channel_name')->nullable();
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
            $table->dropColumn(['send_bird_channel_url','send_bird_channel_name']);
        });
    }
}
