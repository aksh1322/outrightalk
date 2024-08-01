<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStyleFieldToUserRoomSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_room_settings', function (Blueprint $table) {
            $table->string('font_color')->default('#000000')->after('lock_mic')->change();
            $table->string('font_family')->default('MonteCarlo')->change();
            $table->string('font_size')->default('30px')->change();
            $table->string('text_decoration')->default('Underline')->change();
            $table->string('font_weight')->default('bold')->change();
            $table->string('font_style')->default('italic')->change();
            $table->boolean('save_default_room_settings')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_room_settings', function (Blueprint $table) {
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