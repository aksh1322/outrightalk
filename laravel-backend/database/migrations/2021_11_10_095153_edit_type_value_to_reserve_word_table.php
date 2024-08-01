<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class EditTypeValueToReserveWordTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('reserved_words', function (Blueprint $table) {
            \DB::statement("ALTER TABLE `reserved_words` CHANGE `type` `type` ENUM('nickname','email','answer','about','roomname','welcomemsg') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'nickname';");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('reserved_words', function (Blueprint $table) {
            //
        });
    }
}
