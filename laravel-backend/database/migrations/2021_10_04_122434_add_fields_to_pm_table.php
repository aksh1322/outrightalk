<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldsToPmTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pms', function (Blueprint $table) {
            $table->tinyInteger('is_video_on')->default(0)->after('pm_type');
            $table->tinyInteger('is_voice_on')->default(0)->after('is_video_on');
            $table->tinyInteger('is_webcam_on')->default(0)->after('is_voice_on');
            $table->integer('is_initiated_by')->default(0)->after('is_initialize');
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
            //
        });
    }
}
