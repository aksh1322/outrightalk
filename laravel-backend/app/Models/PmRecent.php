<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

//use Illuminate\Database\Eloquent\SoftDeletes;

class PmRecent extends Model
{

    //use SoftDeletes;

    protected $table = "pm_recents";

    protected $fillable = [
        'user_id',
        'for_user_id',
        'third_user_id',
        'pm_id',
        'is_closed'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
            $this->table . ".*"
        )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['for_user_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".third_user_id", "=", $srch_params['for_user_id'])
                    ->orWhere($this->table . ".for_user_id", "=", $srch_params['for_user_id'])
                    ->orWhere($this->table . ".user_id", "=", $srch_params['for_user_id']);
            });

        if (isset($srch_params['id'])) {
            return $listing->where($this->table . '.id', '=', $srch_params['id'])
                ->first();
        }

        if (isset($srch_params['count'])) {
            return $listing->count();
        }

        if (isset($srch_params['groupBy'])) {
            $sub = self::select('pm_id', \DB::raw('MAX(created_at) AS max_date'))
                ->where(function ($q) use ($srch_params) {
                    $q->where($this->table . ".third_user_id", "=", $srch_params['for_user_id'])
                        ->orWhere($this->table . ".for_user_id", "=", $srch_params['for_user_id'])
                        ->orWhere($this->table . ".user_id", "=", $srch_params['for_user_id']);
                })->groupBy($srch_params['groupBy']);
            //dd($sub);
            $listing->join(\DB::raw("({$sub->toSql()}) max_table"), function ($join) {
                $join->on('max_table.pm_id', '=', $this->table . '.pm_id')
                    ->on('max_table.max_date', '=', $this->table . '.created_at');
            })->addBinding($sub->getBindings(), 'join');

        }

        if (isset($srch_params['orderBy'])) {
            $this->orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
            foreach ($this->orderBy as $key => $value) {
                $listing->orderBy($key, $value);
            }
        } else {
            $listing->orderBy($this->table . '.id', 'DESC');
        }

        if (isset($srch_params['get_sql']) && $srch_params['get_sql']) {
            return [
                $listing->toSql(),
                $listing->getBindings(),
            ];
        }

        if ($offset) {
            $listing = $listing->paginate($offset);
        } else {
            $listing = $listing->get();
        }

        $filtered = $listing->filter(function ($item) use ($srch_params) {

            $closedData = $item->is_closed ? json_decode($item->is_closed) : null;

            $collection = collect($closedData);

            return $collection && ($collection[$srch_params['for_user_id']] == false);

        })->values();

        //dd($filtered);

        return $filtered;
    }

    public function userInfo()
    {
        return $this->hasOne(User::class, 'id', 'user_id')
            ->with([
                'customizeNickname' => function ($q) {
                    $q->where('user_id', \Auth::user()->id);
                },
            ]);
    }

    public function forUserInfo()
    {
        return $this->hasOne(User::class, 'id', 'for_user_id')
            ->with([
                'customizeNickname' => function ($q) {
                    $q->where('user_id', \Auth::user()->id);
                },
            ]);
    }

    public function pmInfo()
    {
        return $this->hasOne(Pm::class, 'id', 'pm_id');
    }


}
