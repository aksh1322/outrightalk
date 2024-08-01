<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLocationCities extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('location_cities', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->bigInteger('country_id')->unsigned();
            $table->bigInteger('state_id')->unsigned();
            $table->unsignedTinyInteger('status')->default(1);
            $table->string('city_code', 5)->nullable();
            $table->string('city_name', 255)->nullable()->collation('utf8_general_ci');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP'));
            $table->softDeletes('deleted_at', 0);

            // $table->foreignId('country_id')->constrained('location_countries')->onDelete('cascade');
            // $table->foreignId('state_id')->constrained('location_states')->onDelete('cascade');
            $table->index([
                'country_id',
                'state_id'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('location_cities');
    }
}
