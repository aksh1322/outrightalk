<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVirtualGiftCreditTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('virtual_gift_credits', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->string('credit_type', 255)->nullable();
            $table->decimal('price', 8, 2)->nullable();
            $table->integer('paid_credit')->default(0);
            $table->integer('free_credit')->default(0);
            $table->integer('expire_in_months')->default(0);
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
        Schema::dropIfExists('virtual_gift_credits');
    }
}
