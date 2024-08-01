<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGiftInvitesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('gift_invites', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('from_user');
            $table->bigInteger('sticker_id')->nullable();
            $table->bigInteger('to_user');
            $table->bigInteger('entity_id')->nullable();
            $table->timestamp('invited_at')->default(now());
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('gift_invites');
    }
}
