<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCdns extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cdns', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->unsignedTinyInteger('status')->default(1);
            $table->string('cdn_path', 255);
            $table->string('cdn_root', 255);
            $table->string('location_type', 10)->default('public')->nullable()->comment('public or s3');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cdns');
    }
}
