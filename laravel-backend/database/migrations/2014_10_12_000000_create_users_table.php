<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->unsignedTinyInteger('status')->default(0)->comment('0=registered, 1=active, 2=blocked');
            $table->unsignedTinyInteger('verified')->default(0);
            $table->string('username', 255)->comment('username');
            $table->string('first_name', 255)->nullable()->collation('utf8_general_ci');
            $table->string('last_name', 255)->nullable()->collation('utf8_general_ci');
            $table->string('email', 255)->nullable()->collation('utf8_general_ci');
            $table->string('phone', 25)->nullable();
            $table->string('password')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            // $table->timestamps();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP'));
            $table->softDeletes('deleted_at', 0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
