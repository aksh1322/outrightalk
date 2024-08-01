<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWalletTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->refrences('id')->on('wallets');
            $table->foreignId('user_id')->references('id')->on('users');
            $table->double('amount')->default(0);
            $table->tinyInteger('type')->comment('1 for credit 2 for debit');
            $table->string('transaction_id')->nullable();
            $table->json('transaction_resposne')->nullable();
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
        Schema::dropIfExists('wallet_transactions');
    }
}
