<?php

namespace App\Http\Controllers;

use App\Helper;
use App\Models\Permission;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PermissionController extends Controller {

	public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        
		$this->_module      = 'Permission';
		$this->_routePrefix = 'permissions';
		$this->_model 		= new Permission();
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request) {
		$this->initIndex();

		$this->_data['srch_params'] = $request->all();
		if(!$request->has('orderBy')){
			$this->_data['srch_params']['orderBy'] = 'permissions__class,permissions__id';
		}
		$this->_data['data'] 	= $this->_model->getListing($this->_data['srch_params'], $this->_offset);
		$this->_data['filters'] = $this->_model->getFilters();
		$this->_data['orderBy'] = $this->_model->orderBy;
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
		$data = $this->_model->getListing(['id' => $id]);

		$return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.index');
		if ($return) {
			return $return;
		}

		\App\Models\PermissionRole::where('pid', $id)->delete();
		$data->delete();

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
		$response = $this->initUIGeneration($id);
        if($response) {
            return $response;
        }

        extract($this->_data);

		$form = [
			'route'      => $this->_routePrefix . ($id ? '.update' : '.store'),
			'back_route' => route($this->_routePrefix . '.index'),
			'fields'     => [
				'p_type' => [
					'type'       => 'text',
					'label'      => 'Permission Type',
					'help'       => 'Maximum 255 characters',
					'attributes' => ['required' => true],
				],
				'class'  => [
					'type'       => 'text',
					'label'      => 'Controller Name',
					'help'       => 'Maximum 50 characters',
					'attributes' => ['required' => true],
				],
				'method' => [
					'type'       => 'text',
					'label'      => 'Controller Method Name',
					'help'       => 'Maximum 50 characters',
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
			'p_type' => 'required|max:255',
			'class'  => 'required|max:50',
			'method' => 'required|max:50',
		]);

		$input = $request->all();

		if ($id) {
			$data = $this->_model->getListing(['id' => $id]);

			$return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.index');
			if ($return) {
				return $return;
			}

			$data->update($input);
		} else {
			$data = $this->_model->create($input);
		}

		return redirect()
			->route($this->_routePrefix . '.index')
			->with('success', 'Record has been successfully saved.');
	}

	public function manageRole(Request $request, $role_id = '') {
		if (!$role_id) {
			return FALSE;
		}

		$data = [];

		$module_name     	= "Roles";
		$roleModel 			= new \App\Models\Role();
		$role            	= $roleModel->getListing([
			'id' => $role_id
		]);
		$currentUserRoles 	= \Auth::user()->roles->pluck('id')->toArray();
		$module          	= "Manage Role Permisssion - " . $role->title;
		$srch_params 		= [
			'orderBy'		=> 'permissions__class,permissions__id'
		];
		if(!in_array(1, $currentUserRoles)){
			$srch_params['role_id_in'] = $currentUserRoles;
		}
		$list 				= $this->_model->getListing($srch_params);

		$moduleName = 'Assign Permission';
		$breadcrumb = [
			route($this->_routePrefix . '.index') => $this->_module,
			'#'                                   => $moduleName,
		];
		$permission = \App\Models\PermissionRole::where("rid", $role_id)
			->pluck('pid')
			->all();

		$permissionRolesContent  = view('admin.' . $this->_routePrefix . '.manage-role', [
			'permission' 	=> $permission,
			'list'			=> $list
		])
		->render();
		$form = [
			'route'      => $this->_routePrefix . '.assign',
			'back_route' => route('roles.index'),
			'fields'     => [
				'pidHtml' => [
					'type'    	=> 'html',
					'value'		=> $permissionRolesContent
				],
			],
		];

		$id = $role_id;
		return view('admin.components.admin-form', compact('data', 'id', 'form', 'breadcrumb', 'module'));
	}

	/**
	 * Form post action
	 *
	 * @param  Request $request [description]
	 * @param  string  $id      [description]
	 * @return [type]           [description]
	 */
	public function assignPermission(Request $request, $id = '') {
		$input = $request->all();

		$rolePermission = [];
		\App\Models\PermissionRole::where('rid', $id)->delete();

		if ($input && isset($input['pid'])) {
			foreach ($input['pid'] as $key => $value) {
				$rolePermission[] = [
					'pid' => $value,
					'rid' => $id,
				];
			}

			\App\Models\PermissionRole::insert($rolePermission);
		}

		return redirect()
			->route('roles.index')
			->with('success', 'Record has been successfully saved.');
	}
}
