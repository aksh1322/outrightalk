<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSiteSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->unsignedTinyInteger('is_visible')->default(1)->comment('Is visible in the api response?');
            $table->unsignedTinyInteger('is_required')->default(1)->nullable();
            $table->string('key', 255);
            $table->string('val', 255)->nullable()->collation('utf8_general_ci');
            $table->string('field_label', 255)->nullable()->comment('Field printable name')->collation('utf8_general_ci');
            $table->unsignedTinyInteger('field_type')->default(1)->comment('1=Textbox, 2=Textarea, 3=Email, 4=Number, 5=Dropdown, 6=Radio, 7=Checkbox, 8=Password, 9=File, 10=Switch');
            $table->json('field_options')->nullable()->comment('Option for Dropdown, Radio, Checkbox');
            $table->string('group_name', 25)->default('general');
            $table->string('help_text', 255)->nullable()->collation('utf8_general_ci');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('site_settings');
    }
}
