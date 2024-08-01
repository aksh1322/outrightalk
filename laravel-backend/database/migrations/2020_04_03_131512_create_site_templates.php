<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSiteTemplates extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('site_templates', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->unsignedTinyInteger('status')->default(1);
            $table->unsignedTinyInteger('template_type')->default(1)->comment('1 = Email, 2 = SMS, 3 = PDF');
            $table->string('template_name', 255)->nullable();
            $table->string('subject', 255)->nullable()->collation('utf8_general_ci');
            $table->longText('template_content')->nullable()->collation('utf8_general_ci');
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
        Schema::dropIfExists('site_templates');
    }
}
