<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMaterSubscriptionTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('master_subscriptions', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->string('title', 255)->nullable()->collation('utf8_general_ci');
            $table->string('color_title', 255)->nullable()->collation('utf8_general_ci');
            $table->string('color_code', 7)->nullable()->collation('utf8_general_ci');
            $table->integer('room_capacity')->unsigned()->default(0);
            $table->integer('ban_limit')->unsigned()->default(0);
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
        Schema::dropIfExists('master_subscriptions');
    }
}
