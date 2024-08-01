<?php

namespace App\Models;

use App\Helpers\Helper;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class Permission extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'permissions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'p_type',
        'class',
        'method',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    public function getFilters()
    {
        return [
            'reset' => route('permissions.index'),
            'fields' => [
                'p_type'        => [
                    'type'      => 'text',
                    'label'     => 'Permission Type'
                ],
                'class'         => [
                    'type'      => 'text',
                    'label'     => 'Module'
                ],
                'method'        => [
                    'type'      => 'text',
                    'label'     => 'Function'
                ]
            ]
        ];
    }

    public $orderBy = [];

    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
            $this->table . ".*"
            )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
				return $q->with($srch_params['with']);
			})
            ->when((isset($srch_params['role_id']) || isset($srch_params['role_id_in'])), function($q) use($srch_params){
                $q->join('permission_roles AS pr', function ($join) use ($srch_params) {
                    $join->on('pr.pid', '=', 'permissions.id')
                        ->when(isset($srch_params['role_id']), function($q) use($srch_params){
                            return $q->where('pr.rid', $srch_params['role_id']);
                        })
                        ->when(isset($srch_params['role_id_in']), function($q) use($srch_params){
                            return $q->whereIn('pr.rid', $srch_params['role_id_in']);
                        });
                });
            })
            ->when(isset($srch_params['p_type']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".p_type", "LIKE", "%{$srch_params['p_type']}%");
            })
            ->when(isset($srch_params['class']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".class", $srch_params['class']);
            })
            ->when(isset($srch_params['method']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".method", $srch_params['method']);
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
            $listing->orderBy($this->table . '.id', 'DESC');
        }

        if ($offset) {
            $listing = $listing->paginate($offset);
        } else {
            $listing = $listing->get();
        }

        return $listing;
    }

    public static function checkPermission($className = '', $methodName = '', $userRoles = [])
    {
        if(!$userRoles) {
            $user       = \Auth::user();
            $userModel  = new \App\Models\User();
            $userRoles  = $userModel->myRoles([
                'user_id'   => $user->id
            ], false);
            $userRoles  = $userRoles->pluck('id')->toArray();
        }
        

        // if this is a super admin
        // set all permission 
        if(in_array(1, $userRoles)) {
            return true;
        }

        $className  = !$className ? Helper::getController() : $className;
        $methodName = !$methodName ? Helper::getMethod() : $methodName;

        $permission = self::select("permissions.*")
            ->addSelect(\DB::raw("IF(pr.pid, 1, 0) AS has_permission"))
            ->leftJoin("permission_roles AS pr", function ($q) use ($userRoles) {
                $q->on("pr.pid", "=", "permissions.id")
                    ->whereIn("pr.rid", $userRoles);
            })
            ->where("permissions.class", "=", $className)
            ->where("permissions.method", "=", $methodName)
            ->first();

        // if result found
        if ($permission) {
            // if permission found
            if ($permission->has_permission) {
                return true;
            }

            return false;
        }

        // if permission not entered on parent
        // table, then it will be accessible
        // by all users.
        return true;
    }

    /*
     * Check module wise permissions. It checks given methods permissions 
     * from given class name. and return method wise permission result.
     */

    public static function checkModulePermissions($methods = ['index', 'create', 'edit', 'destroy'], $class = '') {
        $user       = \Auth::user();
        $userModel  = new \App\Models\User();
        $userRoles  = $userModel->myRoles([
            'user_id'   => $user->id
        ], false);
        $userRoles  = $userRoles->pluck('id')->toArray();

        // if this is super admin, grant all access
        if(in_array(1, $userRoles)) {
            $permission = [];
            foreach ($methods as $value) {
                $permission[$value] = true;
            }
            return $permission;
        }

        $all_permission = TRUE;
        $roles          = null;

        if (!$class) {
            $class = Helper::getController();
        }

        /*
         * get methodwise permissions
         */
        $permission = self::where('class', $class)
                ->whereIn('method', $methods)
                ->get();

        if ($permission) {
            $permission = $permission->toArray();
            $permission_ids = Helper::makeSimpleArray($permission, "id", TRUE);

            if ($permission_ids) {
                $roles = \App\Models\PermissionRole::whereIn('rid', $userRoles)
                        ->whereIn('pid', $permission_ids)
                        ->get();


                if ($roles->count()) {
                    $roles = $roles->toArray();
                    $roles = Helper::makeSimpleArray($roles, "pid", TRUE);
                    $module_permission = array();
                    foreach ($permission as $key => $val) {
                        $module_permission[$val['method']] = in_array($val['id'], $roles);
                    }
                    $permission = $module_permission;
                } else {
                    $permission     = [];
                    $all_permission = FALSE;
                }
            }
        }

        if (count($methods) > count($permission)) {
            foreach ($methods as $val) {
                if (!isset($permission[$val])) {
                    $permission[$val] = $all_permission;
                }
            }
        }

        if (!$permission || ! $roles) {
            $permission = array();
            foreach ($methods as $val) {
                $permission[$val] = $all_permission;
            }
        }

        return $permission;
    }
}
