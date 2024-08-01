<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRoomBannedUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('room_banned_users', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->bigInteger('room_id');
            $table->bigInteger('user_id');
            $table->timestamp('banned_date')->nullable();
            $table->tinyInteger('is_unlimited_banned')->default(0);
            $table->text('message')->nullable()->collation('utf8_general_ci');
            $table->bigInteger('added_by')->default(0);
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
        Schema::dropIfExists('room_banned_users');
    }
}
