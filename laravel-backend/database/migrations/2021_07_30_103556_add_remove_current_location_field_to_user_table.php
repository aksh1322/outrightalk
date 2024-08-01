<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRemoveCurrentLocationFieldToUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['curr_loc_lat', 'curr_loc_lon']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->decimal('curr_loc_lat', 10,8)->nullable()->after('last_seen');
            $table->decimal('curr_loc_lon', 11,8)->nullable()->after('curr_loc_lat');
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
            //
        });
    }
}
