<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserPmSettingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_pm_settings', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->bigInteger('user_id')->unsigned();
            $table->bigInteger('pm_id')->unsigned();
            $table->tinyInteger('autoscrool_text')->default(1);
            $table->tinyInteger('timestamp')->default(1);
            $table->tinyInteger('disable_dig_sound')->default(1);
            $table->tinyInteger('font')->default(0);
            $table->tinyInteger('change_pm_screen')->default(0);
            $table->tinyInteger('push_to_talk')->default(1);
            $table->tinyInteger('lock_mic')->default(0);
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
        Schema::dropIfExists('user_pm_settings');
    }
}
