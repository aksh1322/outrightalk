<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPrice extends Model
{

    protected $table = 'subscription_prices';

    protected $fillable = [
        'subscription_id',
        'type',
        'is_gift',
        'price',
        'free_credits',
        'sort_order',
        'points',
        'virtual_credits'
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
    ];

    protected $appends = [
        'show_price',
    ];

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_id');
    }

    public function getShowPriceAttribute()
    {
        return \App\Helpers\Helper::price($this->price, 2);
    }


    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
            $this->table . ".*"
        )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['subscription_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".subscription_id", "=", $srch_params['subscription_id']);
            });

        if (isset($srch_params['id'])) {
            return $listing->where($this->table . '.id', '=', $srch_params['id'])
                ->first();
        }

        if (isset($srch_params['count'])) {
            return $listing->count();
        }

        if (isset($srch_params['orderBy'])) {
            $this->orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
            foreach ($this->orderBy as $key => $value) {
                $listing->orderBy($key, $value);
            }
        } else {
            $listing->orderBy($this->table . '.id', 'ASC');
        }

        if ($offset) {
            $listing = $listing->paginate($offset);
        } else {
            $listing = $listing->get();
        }

        return $listing;
    }

    public function getFilters()
    {
        return [];
    }

    public function store($input = [], $id = 0, $request = null)
    {
        $data = null;
        if ($id) {
            $data = $this->getListing(['id' => $id]);

            if (!$data) {
                return \App\Helpers\Helper::resp('Not a valid data', 400);
            }

            $data->update($input);
        } else {
            $data = $this->create($input);
        }
        // $this->uploadIcon($data, $id, $request);
        return \App\Helpers\Helper::resp('Changes has been successfully saved.', 200, $data);

    }

    public function remove($id = null)
    {
        $data = $this->getListing([
            'id' => $id,
        ]);

        if (!$data) {
            return \App\Helpers\Helper::resp('Not a valid data', 400);
        }

        $data->delete();
        return \App\Helpers\Helper::resp('Record has been successfully deleted.', 200, $data);
    }


}
