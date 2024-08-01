<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserBadge extends Model
{
    use HasFactory ,SoftDeletes;

    protected $guarded = [
        'id',
    ];

    protected $appends = [
        'expiry_date',
    ];

    public function currentBadge()
    {
        return $this->belongsTo(Badge::class,'current_badge_id');
    }

    public function nextBadge()
    {
        return $this->belongsTo(Badge::class,'next_badge_id');
    }

    public function getExpiryDateAttribute(){

        return Carbon::parse($this->updated_at)->addMonth(1)->format('m-d-Y');

    }

}
