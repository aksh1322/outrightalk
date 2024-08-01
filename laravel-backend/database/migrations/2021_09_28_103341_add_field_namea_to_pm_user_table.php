<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldNameaToPmUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pm_users', function (Blueprint $table) {
            $table->string('ip_addr', 255)->nullable()->collation('utf8_general_ci')->after('is_admin');
            $table->string('timezone', 255)->nullable()->collation('utf8_general_ci')->after('ip_addr');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pm_users', function (Blueprint $table) {
            //
        });
    }
}
