<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRoomSettingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('room_settings', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->bigInteger('room_id')->unsigned();
            $table->integer('under_age_id')->unsigned()->default(0);
            $table->tinyInteger('under_age_not_allowed')->unsigned()->default(0);
            $table->integer('under_age_range_id')->unsigned()->default(0);
            $table->tinyInteger('under_age_range_allowed')->unsigned()->default(0);
            $table->tinyInteger('disable_hyperlinks')->unsigned()->default(0);
            $table->tinyInteger('anti_flood')->unsigned()->default(0);
            $table->tinyInteger('red_dot_newcomers')->unsigned()->default(0);
            $table->timestamp('admin_meeting_date')->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP'));
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('room_settings');
    }
}
