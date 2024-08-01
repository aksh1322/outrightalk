<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $table = 'site_settings';
    public $timestamps = false;
    
    protected $fillable = [
        'key',
        'val',
        'field_label',
        'field_type',
        'field_options',
        'group_name',
        'is_required',
        'is_visible'
    ];

    protected $appends = [
        'field_type_details'
    ];

    public static $fieldTypes = [
        '1'   => 'text',
        '2'   => 'textarea',
        '3'   => 'email',
        '4'   => 'number',
        '5'   => 'select',
        '6'   => 'radio',
        '7'   => 'checkbox',
        '8'   => 'password',
        '9'   => 'file',
        '10'  => 'switch'
    ];

    public $orderBy = [];

    public function getFieldTypeDetailsAttribute()
    {
        return self::$fieldTypes[$this->field_type];
    }

    public function getFieldOptionsAttribute($value)
    {
        if($value){
            return json_decode($value);
        }
        return null;
    }


    public static function makeCacheSetting($value='')
    {
        $filePath   = base_path('bootstrap/cache/settings.php');
        $settings   = self::get()->toArray();
        $settings   = \App\Helpers\Helper::makeSimpleArray($settings, 'key,val');
        file_put_contents($filePath, json_encode($settings));
        \Artisan::call('config:cache');
    }

    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*"
            )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
				return $q->with($srch_params['with']);
			})
            ->when(isset($srch_params['title']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".title", "LIKE", "%{$srch_params['title']}%");
            })
            ->when(isset($srch_params['status']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".status", $srch_params['status']);
            });

        if (isset($srch_params['slug'])) {
            return $listing->where($this->table . '.slug', '=', $srch_params['slug'])
                ->first();
        }
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
            $listing->orderBy($this->table . '.id', 'DESC');
        }

        if ($offset) {
            $listing = $listing->paginate($offset);
        } else {
            $listing = $listing->get();
        }

        return $listing;
    }
}
