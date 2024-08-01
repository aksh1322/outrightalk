<?php

namespace App\Http\Middleware;

use Closure;

class Cros {
	/**
	 * Handle an incoming request.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Closure  $next
	 * @return mixed
	 */
	public function handle($request, Closure $next) {
		// return $next($request)
		//            ->header('Access-Control-Allow-Origin','*')
		//            ->header('Access-Control-Allow-Methods','GET,PUT,POST,PATCH,OPTIONS,DELETE')
		//            ->header('Access-Control-Allow-Headers','Content-Type,Authorization,reportProgress,observe','application/x-www-form-urlencoded');

		$response = $next($request);

		$response->headers->set('Access-Control-Allow-Origin', '*');
		$response->headers->set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, PATCH, DELETE');
		$response->headers->set('Access-Control-Allow-Headers', 'Content-Type,Authorization,reportProgress,observe', 'application/x-www-form-urlencoded');

		return $response;
	}

}
