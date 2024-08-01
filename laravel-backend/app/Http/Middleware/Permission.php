<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class Permission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $user = Auth::user();
        if($user && $user->roles()->count()) {
            return $next($request);
        }
        if ($user && $user->status && $user->verified && $user->roles()->count()) {

            // checking whether current user has permission
            // to enter the page
            $res = \App\Models\Permission::checkPermission();
            if ($res) {
                return $next($request);
            }

        }
        
        if(Auth::guard('api')->check()) {
            return \App\Helpers\Helper::rj("Unauthenticated", 401);
        }
        
        Session::flash('error', 'You are not verified your account yet, or Your account is currently blocked by Administrator, or You don\'t have permission to enter this site. If you think this is wrong please contact with us.');
        return redirect()->route('admin.login');
    }
}
