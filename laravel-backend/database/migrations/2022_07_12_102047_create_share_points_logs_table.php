<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSharePointsLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('share_points_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_user');
            $table->foreignId('to_user');
            $table->integer('percentage')->nullable();
            $table->tinyInteger('status')->comment('1 for accepted ,2 for rejected')->default(0);
            $table->dateTime('expired_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('share_points_logs');
    }
}
