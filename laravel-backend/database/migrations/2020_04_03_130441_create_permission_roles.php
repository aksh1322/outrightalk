<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePermissionRoles extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('permission_roles', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->bigInteger('pid')->unsigned()->comment('permission id');
            $table->bigInteger('rid')->unsigned()->comment('role id');

            $table->index([
                'pid',
                'rid'
            ]);

            // $table->foreign('pid')
            //     ->references('id')
            //     ->on('permissions')
            //     // ->onUpdate('cascade')
            //     ->onDelete('cascade');
            
            // $table->foreign('rid')
            //     ->references('id')
            //     ->on('roles')
            //     // ->onUpdate('cascade')
            //     ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('permission_roles');
    }
}
