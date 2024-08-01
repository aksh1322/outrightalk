<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStyleFieldToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('font_color')->default('#000000')->after('curr_loc_lon');
            $table->string('font_family')->default('MonteCarlo');
            $table->string('font_size')->default('30px');
            $table->string('text_decoration')->default('Underline');
            $table->string('font_weight')->default('bold');
            $table->string('font_style')->default('italic');
            $table->boolean('save_default_room_settings')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('font_color');
            $table->dropColumn('font_family');
            $table->dropColumn('font_size');
            $table->dropColumn('text_decoration');
            $table->dropColumn('font_weight');
            $table->dropColumn('font_style');
            $table->dropColumn('save_default_room_settings');
        });
    }
}