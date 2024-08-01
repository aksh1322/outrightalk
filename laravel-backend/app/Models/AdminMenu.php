<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminMenu extends Model
{
    public $timestamps  = false;
    protected $table    = 'admin_menus';
    protected $fillable = [
        'parent_id',
        'display_order',
        'status',
        'class',
        'method',
        'query_params',
        'menu',
        'url',
        'icon',
    ];
    private $parent_rec = array();

    public $orderBy = [];

    public $statuses = [
        0=> [
            'id' => 0,
            'name' => 'Disabled',
            'badge' => 'warning'
        ],
        1=> [
            'id' => 1,
            'name' => 'Enabled',
            'badge' => 'success'
        ],
    ];

    public function getFilters($country = 0, $state = 0)
    {
        $status         = \App\Helpers\Helper::makeSimpleArray($this->statuses, 'id,name');
        return [
            'reset' => route('menus.index'),
            'fields' => [
                'menu'          => [
                    'type'      => 'text',
                    'label'     => 'Name'
                ],
                'status'     => [
                    'type'       => 'select',
                    'label'      => 'Status',
                    'attributes' => [
                        'id' => 'select-status',
                    ],
                    'options'    => $status,
                ],
            ]
        ];
    }

    public function childs()
    {
        return $this->hasMany('App\Models\AdminMenu','parent_id');
    }

    public function getQueryParamsAttribute($value) {
        return (array)json_decode($value);
    }

    public function getListing($srch_params = [], $offset = 0) {
		$listing = self::select(
				$this->table . ".*"
			)
			->when(isset($srch_params['with']), function ($q) use ($srch_params) {
				return $q->with($srch_params['with']);
			})
			->when(isset($srch_params['menu']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".menu", "LIKE", "%{$srch_params['menu']}%");
			})
			->when(isset($srch_params['parent_id']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".parent_id", $srch_params['parent_id']);
			})
			->when(isset($srch_params['status']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".status", $srch_params['status']);
			});

		if (isset($srch_params['id'])) {
			return $listing->where($this->table . '.id', '=', $srch_params['id'])
				->first();
		}

		if (isset($srch_params['count'])) {
			return $listing->count();
		}

		if (isset($srch_params['orderBy'])) {
			$orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
			foreach ($orderBy as $key => $value) {
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

    public static function getMenu($pid = 0)
    {
        $menu = self::select()
            ->where([
                'status'    => '1',
                'parent_id' => $pid,
            ])
            ->orderBy('display_order', 'ASC')
            ->get();

        if (empty($menu)) {
            return false;
        }

        $menu     = $menu->toArray();
        $menus    = array();
        foreach ($menu as $key => $val) {
            if ($val['class'] && $val['method']) {
                $permission = \App\Models\Permission::checkPermission($val['class'], $val['method']);
                if ($permission) {
                    $menus[$key]                = $val;
                    $menus[$key]['child']       = self::getMenu($val['id']);
                }
            } else {
                $menus[$key]                    = $val;
                $menus[$key]['child']           = self::getMenu($val['id']);
            }
        }

        return $menus;
    }


    public function getParentMenu($id)
    {
        $p = $this->__getPreviousRecord($id);
        return $this->parent_rec;
    }

    private function __getPreviousRecord($id = 0)
    {
        $cat = self::where('id', $id)->first();

        if (!$cat) {
            $this->parent_rec = array_reverse($this->parent_rec);
            return false;
        }

        $this->parent_rec[] = $cat->toArray();
        $this->__getPreviousRecord($cat->parent_id);
    }
}
