<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller {

	public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        
		$this->_module      = 'Role';
		$this->_routePrefix = 'roles';
		$this->_model 		= new Role();
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request) {
		$this->initIndex();

		$manageRole 				= \App\Models\Permission::checkModulePermissions(['manageRole'], 'PermissionController');
		$this->_data['permission'] 	= array_merge($this->_data['permission'], $manageRole);
		$this->_data['userId']     	= \Auth::user()->id;
		$userModel  				= new \App\Models\User();
		$myLevel    				= $userModel->myRoleMinLevel($this->_data['userId']);
		$srch_params 				= $request->all();
		$srch_params['level_gt'] 	= $myLevel;

		if(!$request->has('orderBy')){
			$srch_params['orderBy'] 	= 'roles__level';
		}
		$this->_data['data']       	= $this->_model->getListing($srch_params, $this->_offset);
		
		$this->_data['orderBy']     = $this->_model->orderBy;
		return view('admin.' . $this->_routePrefix . '.index', $this->_data)
			->with('i', ($request->input('page', 1) - 1) * $this->_offset);
	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function create(Request $request) {
		return $this->__formUiGeneration($request);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(Request $request) {
		return $this->__formPost($request);
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function edit(Request $request, $id) {
		return $this->__formUiGeneration($request, $id);
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function update(Request $request, $id) {
		return $this->__formPost($request, $id);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($id) {
		$userId = \Auth::user()->id;
		$data   = $this->_model->getListing(['id' => $id, 'user_id' => $userId]);

		$return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.index');
		if ($return) {
			return $return;
		}

		$users 			= $data->users();
		$permissions 	= $data->permissions();
		if($data->delete()){
			$users->delete();
			$permissions->delete();
		}

		return redirect()->route($this->_routePrefix . '.index')
			->with('success', 'Site Content deleted successfully');
	}

	/**
	 * ui parameters for form add and edit
	 *
	 * @param  string $id [description]
	 * @return [type]     [description]
	 */
	protected function __formUiGeneration(Request $request, $id = '') {
		$this->initUIGeneration($id, false);
        extract($this->_data);

		if ($id) {
			$userId = \Auth::user()->id;
			$data   = $this->_model->getListing(['id' => $id, 'user_id' => $userId]);

			$return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.index');
			if ($return) {
				return $return;
			}
		} 

		$form = [
			'route'      => $this->_routePrefix . ($id ? '.update' : '.store'),
			'back_route' => route($this->_routePrefix . '.index'),
			'fields'     => [
				'title' => [
					'type'       => 'text',
					'label'      => 'Title',
					'help'       => 'Maximum 255 characters',
					'attributes' => ['required' => true],
				],
			],
		];

		return view('admin.components.admin-form', compact('data', 'id', 'form', 'breadcrumb', 'module'));
	}

	/**
	 * Form post action
	 *
	 * @param  Request $request [description]
	 * @param  string  $id      [description]
	 * @return [type]           [description]
	 */
	protected function __formPost(Request $request, $id = '') {
		$this->validate($request, [
			'title' => 'required|max:255',
		]);

		$input  = $request->all();
		$userId = \Auth::user()->id;

		if ($id) {
			$data   = $this->_model->getListing(['id' => $id, 'user_id' => $userId]);

			$return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.index');
			if ($return) {
				return $return;
			}

			$data->update($input);
		} else {
			$userModel        = new \App\Models\User();
			$myLevel          = $userModel->myRoleMinLevel($userId);
			$input['user_id'] = $userId;
			$input['slug']    = \App\Helpers\Helper::getUniqueSlug($input['title'], 'roles', 'slug');
			$input['level']   = ++$myLevel;
			$data             = $this->_model->create($input);
		}

		return redirect()
			->route($this->_routePrefix . '.index')
			->with('success', 'Record has been successfully saved.');
	}
}
