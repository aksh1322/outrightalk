<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRoles extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		Schema::create('roles', function (Blueprint $table) {
			$table->bigIncrements('id')->unsigned();
			$table->unsignedBigInteger('pid')->default(0)->comment('Parent role id');
			$table->unsignedBigInteger('user_id')->default(0)->comment('Role created by');
			$table->unsignedTinyInteger('status')->default(1);
			$table->unsignedTinyInteger('level')->default(0);
			$table->string('slug', 255)->nullable()->collation('utf8_general_ci');
			$table->string('title', 255)->nullable()->collation('utf8_general_ci');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::dropIfExists('roles');
	}
}
