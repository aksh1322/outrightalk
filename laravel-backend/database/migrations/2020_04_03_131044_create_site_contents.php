<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSiteContents extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('site_contents', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->string('slug', 255)->nullable()->collation('utf8_general_ci');
            $table->string('title', 255)->nullable()->collation('utf8_general_ci');
            $table->text('short_description')->nullable()->collation('utf8_general_ci');
            $table->longText('long_description')->nullable()->collation('utf8_general_ci');
            $table->string('meta_title', 255)->nullable()->collation('utf8_general_ci');
            $table->string('meta_keyword', 255)->nullable()->collation('utf8_general_ci');
            $table->string('meta_description', 255)->nullable()->collation('utf8_general_ci');
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
        Schema::dropIfExists('site_contents');
    }
}
