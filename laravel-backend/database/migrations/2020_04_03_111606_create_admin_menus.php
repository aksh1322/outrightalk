<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdminMenus extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('admin_menus', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->unsignedBigInteger('parent_id')->default(0)->comment('Parent row id');
            $table->smallInteger('display_order')->unsigned()->default(0);
            $table->unsignedTinyInteger('status')->default(1);
            $table->string('class', 50)->nullable()->comment('Controller class name');
            $table->string('method', 50)->nullable()->comment('Controller method name');
            $table->string('menu')->nullable();
            $table->string('url', 255)->nullable();
            $table->string('icon', 30)->nullable();
            $table->json('query_params')->nullable();
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
        Schema::dropIfExists('admin_menus');
    }
}
