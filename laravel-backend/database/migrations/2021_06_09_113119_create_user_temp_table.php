<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserTempTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_temp', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->string('uid', 255)->nullable();
            $table->string('nickname', 255)->nullable()->collation('utf8_general_ci');
            $table->string('password', 255)->nullable()->collation('utf8_general_ci');
            $table->date('dob')->nullable();
            $table->tinyInteger('dob_visible')->nullable();
            $table->integer('gender')->nullable();
            $table->tinyInteger('gender_visible')->nullable();
            $table->integer('country')->nullable();
            $table->tinyInteger('country_visible')->nullable();
            $table->string('state', 255)->nullable()->collation('utf8_general_ci');
            $table->tinyInteger('state_visible')->nullable();
            $table->string('email', 255)->nullable()->collation('utf8_general_ci');
            $table->tinyInteger('email_visible')->nullable();
            $table->text('about')->nullable()->collation('utf8_general_ci');
            $table->tinyInteger('about_visible')->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP'));
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_temp');
    }
}
