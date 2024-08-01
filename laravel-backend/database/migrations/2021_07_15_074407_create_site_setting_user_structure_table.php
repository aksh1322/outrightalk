<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSiteSettingUserStructureTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('site_setting_user_structures', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->unsignedTinyInteger('field_type')->default(1)->comment('1=Textbox, 2=Textarea, 3=Email, 4=Number, 5=Dropdown, 6=Radio, 7=Checkbox, 8=Password, 9=File, 10=Boolean');
            $table->unsignedTinyInteger('display_order')->default(0);
            $table->string('key', 255);
            $table->string('default_val', 255)->nullable()->collation('utf8_general_ci')->comment('Default value');
            $table->string('field_label', 255)->nullable()->comment('Field printable name')->collation('utf8_general_ci');
            $table->string('field_help', 255)->nullable()->comment('Field help')->collation('utf8_general_ci');
            $table->json('field_options')->nullable()->comment('Option for Dropdown, Radio, Checkbox');
            $table->string('group_name', 50)->default('general');
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
        Schema::dropIfExists('site_setting_user_structures');
    }
}
