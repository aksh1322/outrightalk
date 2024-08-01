<?php

namespace App\Http\Controllers;

use App\Models\User;

class DashboardController extends Controller {

	public function index() {
		$data                     = [];
		$data['breadcrumb']       = [
			'#' => 'Dashboard',
		];

		return view('admin.index', $data);
	}
}
 