<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\SendFileUser;

class SendFile extends Model
{
    use HasFactory;
    protected $guarded= [];

    public function shareFiles(){
        return $this->hasMany(SendFileUser::class);
    }
}
