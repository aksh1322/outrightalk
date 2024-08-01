<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldToGiftInvitesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('gift_invites', function (Blueprint $table) {
            $table->bigInteger('pack_id')->nullable();

            if(Schema::hasColumn('users', 'email')){
                $table->dropColumn('to_user')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('gift_invites', function (Blueprint $table) {
            $table->dropColumn(['pack_id']);
        });
    }
}
