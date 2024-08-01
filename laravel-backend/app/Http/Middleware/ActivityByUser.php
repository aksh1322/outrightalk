<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Auth;
use Cache;
use Carbon\Carbon;

class ActivityByUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $userObj = new User();
            $info = $userObj->getListing([
                'id' => Auth::user()->id,
                'settings' => 'set_mode_idle'
            ]);
            $keep_online = 5;            
            if ($info) {
                $instance = new \App\Models\SiteSettingUserStructure();
                $record = $instance->getListing([
                        'select' => ['val'],
                        'key' => 'minutes_inactivity',
                        'user_id' => Auth::user()->id
                    ]);
                if ($record->val) 
                    $keep_online = (int)$record->val;
            }            
            $expiresAt = Carbon::now()->addMinutes($keep_online); // keep online for 10 min
            //Cache::put('user-is-online-' . Auth::user()->id, true, $expiresAt);
            // last seen
            User::where('id', Auth::user()->id)->update(['last_seen' => (new \DateTime())->format("Y-m-d H:i:s")]);
        }
        return $next($request);
    }
}
