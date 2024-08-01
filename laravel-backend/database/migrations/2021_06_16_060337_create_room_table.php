<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRoomTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->tinyInteger('text_enabled')->default(0);
            $table->tinyInteger('video_enabled')->default(0);
            $table->tinyInteger('voice_enabled')->default(0);
            $table->tinyInteger('locked_room')->default(0);
            $table->integer('room_type_id')->unsigned();
            $table->integer('group_id')->unsigned();
            $table->integer('room_category_id')->unsigned();
            $table->integer('language_id')->unsigned();
            $table->string('room_name', 255)->nullable()->collation('utf8_general_ci');
            $table->string('topic', 255)->nullable()->collation('utf8_general_ci');            
            $table->string('banner_url', 255)->nullable()->collation('utf8_general_ci');         
            $table->string('loackword', 20)->nullable()->collation('utf8_general_ci');
            $table->string('admin_code', 15)->nullable()->collation('utf8_general_ci');
            $table->string('room_password', 20)->nullable()->collation('utf8_general_ci');
            $table->enum('post_url', ['Admin', 'HeadAdmin', 'Public'])->default('Admin');
            $table->text('welcome_message')->nullable()->collation('utf8_general_ci');
            $table->text('filter_words')->nullable()->collation('utf8_general_ci');
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
        Schema::dropIfExists('rooms');
    }
}
