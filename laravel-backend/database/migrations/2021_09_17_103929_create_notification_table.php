<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotificationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->bigInteger('from_user_id')->default(0)->unsigned();
            $table->bigInteger('to_user_id')->default(0)->unsigned();
            $table->string('type', 255)->nullable();
            $table->string('message', 255)->nullable()->collation('utf8_general_ci');
            $table->bigInteger('entity_id')->default(0)->unsigned();
            $table->bigInteger('group_id')->default(0)->unsigned();
            $table->tinyInteger('is_accepted')->default(0)->unsigned();
            $table->timestamp('expire_at')->nullable();
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
        Schema::dropIfExists('notifications');
    }
}
