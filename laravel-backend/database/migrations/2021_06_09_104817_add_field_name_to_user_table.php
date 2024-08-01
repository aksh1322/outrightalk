<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldNameToUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('dob')->nullable()->after('remember_token');
            $table->tinyInteger('gender')->default(0)->unsigned()->after('dob');
            $table->integer('country')->default(0)->unsigned()->after('gender');
            $table->string('state', 100)->nullable()->collation('utf8_general_ci')->after('country');
            $table->text('about')->nullable()->collation('utf8_general_ci')->after('state');
            $table->integer('question')->default(0)->unsigned()->after('about');
            $table->string('answer', 255)->collation('utf8_general_ci')->nullable()->after('question');
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
