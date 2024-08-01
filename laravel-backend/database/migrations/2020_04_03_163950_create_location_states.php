<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLocationStates extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('location_states', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->bigInteger('country_id')->unsigned();
            $table->unsignedTinyInteger('status')->default(1);
            $table->string('state_code', 5)->nullable();
            $table->string('state_name', 255)->nullable()->collation('utf8_general_ci');
            $table->string('timezone', 50)->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP'));
            $table->softDeletes('deleted_at', 0);

            $table->foreign('country_id')
                ->references('id')
                ->on('location_countries')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('location_states');
    }
}
