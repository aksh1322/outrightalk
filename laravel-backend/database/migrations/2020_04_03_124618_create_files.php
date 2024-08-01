<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFiles extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('files', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->unsignedBigInteger('entity_id')->default(0);
            $table->unsignedTinyInteger('entity_type')->default(0);
            $table->unsignedBigInteger('cdn_id')->default(0);
            $table->string('file_name', 50)->nullable()->collation('utf8_general_ci');
            $table->string('file_name_original', 255)->nullable()->collation('utf8_general_ci');
            $table->string('file_ext', 6)->nullable()->collation('utf8_general_ci');
            $table->string('file_mime', 255)->nullable();
            $table->string('location', 50)->nullable()->comment('file uri/location on server or s3');
            $table->string('file_size', 10)->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP'));
            $table->softDeletes('deleted_at', 0);

            $table->index([
                'entity_id'
            ]);

            $table->foreign('cdn_id')
                ->references('id')
                ->on('cdns')
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
        Schema::dropIfExists('files');
    }
}
