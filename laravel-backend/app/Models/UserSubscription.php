<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserSubscription extends Model
{

    use SoftDeletes;

    protected $table = 'user_subscriptions';

    protected $fillable = [
        'custom_subscription_id',
        'subscription_id',
        'user_id',
        'room_id',
        'subscription_plan_id',
        'type',
        'renew_at',
        'customer',
        'subscription_price_id',
        'is_closed',
        'on_hold',
        'reactivate_at',
        'is_gift',
        'expire_at'
    ];

    public $orderBy = [];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $appends = [
        'renew_date',
        'reactivate_date',
        'expire_date'
    ];

    public function planInfo()
    {
        return $this->hasOne(SubscriptionPlan::class, 'id', 'subscription_plan_id');
    }

    public function priceInfo()
    {
        return $this->hasOne(SubscriptionPrice::class, 'id', 'subscription_price_id');
    }

    public function feature()
    {
        return $this->hasMany(SubscriptionFeature::class, 'subscription_id', 'subscription_plan_id');
    }

    public function getRenewDateAttribute()
    {
        return \App\Helpers\Helper::showdate($this->renew_at);
    }

    public function getReactivateDateAttribute()
    {
        return \App\Helpers\Helper::showdate($this->reactivate_at);
    }

    public function getExpireDateAttribute()
    {
        return \App\Helpers\Helper::showdate($this->expire_at);
    }

}
