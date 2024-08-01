<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Auth;

class NoteBook extends Model {
    
    use SoftDeletes;

    protected $table = 'note_books';
    
    protected $fillable = [        
        'user_id',
        'notebook_title',
        'description',
        'modified_by',
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
        'created_on',
        'updated_on',
        'created_by',
        'modify_by',
    ];


    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*", "is_viewed"
                )
                ->Join("note_book_shares", function ($join) use ($srch_params) {
                    $join->on("note_book_shares.notebook_id", $this->table . ".id")
                        ->whereNull('note_book_shares.deleted_at');                                           
                })
                ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                    return $q->with($srch_params['with']);
                })
                ->when(isset($srch_params['withCount']), function ($q) use ($srch_params) {
                    return $q->withCount($srch_params['withCount']);
                })
                ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
                    return $q->where("note_book_shares.share_user_id", "=", $srch_params['user_id']);			
                });        
        
        if (isset($srch_params['id'])) {
            return $listing->where($this->table . '.id', '=', $srch_params['id'])
                    ->first();
        }
        
        if (isset($srch_params['get_sql']) && $srch_params['get_sql']) {
            return [
                $listing->toSql(),
                $listing->getBindings(),
            ];
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
            $listing->orderBy('note_book_shares.created_at', 'DESC');
        }
        
        if ($offset) {
            $listing = $listing->paginate($offset);
        } else {
            $listing = $listing->get();
        }

        return $listing;
    }
    
    public function getCreatedOnAttribute() {
        return \App\Helpers\Helper::showdate($this->created_at);
    }
    
    public function getUpdatedOnAttribute() {
        return \App\Helpers\Helper::showdate($this->updated_at);
    }
    
    public function getCreatedByAttribute() {
        return User::select(\DB::raw("IF(cn.nickname IS NULL, users.username, cn.nickname) AS created_by"))
                ->leftJoin("customize_nicknames as cn", function ($join) {
                        $join->on("cn.for_user_id", "users.id")                                
                            ->where("cn.user_id", Auth::user()->id);
                })
                ->where('users.id', $this->user_id)
                ->first();
    }
    
    public function getModifyByAttribute() {
        return User::select(\DB::raw("IF(cn.nickname IS NULL, users.username, cn.nickname) AS modify_by"))
                ->leftJoin("customize_nicknames as cn", function ($join) {
                        $join->on("cn.for_user_id", "users.id")                                
                            ->where("cn.user_id", Auth::user()->id);
                })
                ->where('users.id', $this->modified_by)
                ->first();
    }
    
    public function shareWith() {
        return $this->hasMany(NoteBookShare::class, 'notebook_id', 'id')
                ->with([
                    'userdtls' => function ($q) { 
                                        $q->select("users.id", \DB::raw("IF(cn.nickname IS NULL, users.username, cn.nickname) AS nickname"))
                                            ->leftJoin("customize_nicknames as cn", function ($join) {
                                                    $join->on("cn.for_user_id", "users.id")                                
                                                        ->where("cn.user_id", Auth::user()->id);
                                            }); 
                                    }
                    ])
                ->groupBy('share_user_id');
    }
    
    public function isShare() {
        return $this->hasOne(NoteBookShare::class, 'notebook_id', 'id');
    }
    
    public function isEditable() {
        return $this->hasOne(SiteSettingUser::class, 'user_id', 'user_id');
    }
}
