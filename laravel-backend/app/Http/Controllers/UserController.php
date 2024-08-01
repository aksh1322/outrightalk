<?php
namespace App\Http\Controllers;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Models\User;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class UserController extends Controller {
	public function __construct($parameters = array()) {
		parent::__construct($parameters);

		$this->_module      = 'User';
		$this->_routePrefix = 'users';
		$this->_model       = new User();
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request) {
		$this->initIndex();

		$user                    = \Auth::user();
		$srch_params             = $request->all();
		$srch_params['role_gte'] = $this->_model->myRoleMinLevel($user->id);
		$this->_data['data']     = $this->_model->getListing($srch_params, $this->_offset);
		$this->_data['filters']  = $this->_model->getFilters();
		$this->_data['orderBy']  = $this->_model->orderBy;

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
	public function store(UserRequest $request) {
		return $this->__formPost($request);
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function show(Request $request, $id) {
		$data       = $this->_model->getListing(['id' => $id]);
		$module     = $data->full_name;
		$breadcrumb = [
			route($this->_routePrefix . '.index') => str_plural($this->_module),
			'#'                                   => $module,
		];

		$roles       = $data->roles->pluck('title')->toArray();
		$routePrefix = $this->_routePrefix;
		$viewPage    = $request->ajax() ? '-modal' : '';
		$includePage = 'admin.' . $routePrefix . '.show';

		return view('admin.components.general' . $viewPage, compact(
			'breadcrumb',
			'module',
			'data',
			'routePrefix',
			'includePage',
			'roles'
		));
	}

	public function export(Request $request) {
		$headers = array(
			"Content-type"        => "text/csv",
			"Content-Disposition" => "attachment; filename=user-" . date("Y-m-d") . ".csv",
			"Pragma"              => "no-cache",
			"Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
			"Expires"             => "0",
		);

		$user                    = \Auth::user();
		$srch_params             = $request->all();
		$srch_params['role_gte'] = $this->_model->myRoleMinLevel($user->id);
		$data                    = $this->_model->getListing($srch_params, $this->_offset);

		$columns = array(
			'First Name',
			'Last Name',
			'Email Name',
			'Phone',
		);

		$callback = function () use ($data, $columns) {
			$file = fopen('php://output', 'w');
			fputcsv($file, $columns);

			foreach ($data as $value) {
				fputcsv($file, array(
					$value->first_name,
					$value->last_name,
					$value->email,
					$value->phone,
				)
				);
			}
			fclose($file);
		};
		return response()->stream($callback, 200, $headers);
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
	public function update(UserRequest $request, $id) {
		return $this->__formPost($request, $id);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($id) {
		$response = $this->_model->remove($id);

		if ($response['status'] == 200) {
			return redirect()
				->route($this->_routePrefix . '.index')
				->with('success', $response['message']);
		} else {
			return redirect()
				->route($this->_routePrefix . '.index')
				->with('error', $response['message']);
		}
	}

	/**
	 * ui parameters for form add and edit
	 *
	 * @param  string $id [description]
	 * @return [type]     [description]
	 */
	protected function __formUiGeneration(Request $request, $id = '') {
		$roles      = [];
		$userRoles  = [];
		$ownAccount = true;

		$this->initUIGeneration($id, false);
		extract($this->_data);
		if ($id) {
			$data = $this->_model->getListing([
				'id'              => $id,
				'id_greater_than' => \Auth::user()->id,
			]);

			$return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.index');
			if ($return) {
				return $return;
			}

			$moduleName = 'Edit ' . $this->_module;
			$userRoles  = $data->roles->pluck('id')->toArray();
		}

		if (Auth::user()->id != $id) {
			$ownAccount  = false;
			$roleModel   = new \App\Models\Role();
			$userMinRole = $this->_model->myRoleMinLevel(\Auth::user()->id);
			$roles       = $roleModel->getListing([
				'level_gte' => $userMinRole,
				'orderBy'   => 'roles__level',
			])
				->pluck('title', 'id')
				->all();
		}
		$status = \App\Helpers\Helper::makeSimpleArray($this->_model->statuses, 'id,name');
		$form = [
			'route'      		=> $this->_routePrefix . ($id ? '.update' : '.store'),
			'back_route' 		=> route($this->_routePrefix . '.index'),
			'include_scripts'   => '<script src="'. asset('administrator/admin-form-plugins/form-controls.js'). '"></script>',
			'fields'     => [
				'username'             => [
				    'type'       => 'text',
				    'label'      => 'Username',
				    'help'       => 'Maximum 50 characters',
				    'attributes' => ['required' => true],
				    /*'row_width'=> 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
				    'label_width' => 'col-lg-12 col-sm-12',
				    'field_width' => 'col-lg-12 col-sm-12'*/
				],
				'first_name'       => [
					'type'       => 'text',
					'label'      => 'First Name',
					'help'       => 'Maximum 100 characters',
					/*'attributes' => ['required' => true],
				    'row_width'=> 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
				    'label_width' => 'col-lg-12 col-sm-12',
				    'field_width' => 'col-lg-12 col-sm-12'*/
				],
				'last_name'        => [
					'type'  => 'text',
					'label' => 'Last Name',
					'help'  => 'Maximum 100 characters',
				],
				'email'            => [
					'type'       => 'email',
					'label'      => 'Email',
					'help'       => 'Maximum 255 characters',
					'attributes' => ['required' => true],
				],
				'phone'            => [
					'type'       => 'text',
					'label'      => 'Phone',
					'help'       => 'Maximum 12 characters',
//					'attributes' => ['required' => true],
				],
				'password'         => [
					'type'  => 'password',
					'label' => 'Password',
					'help'  => \App\Models\User::$passwordRequirementText,
				],
				'confirm-password' => [
					'type'  => 'password',
					'label' => 'Confirm Password',
				],
				'avatar'           => [
					'type'       => 'file',
					'label'      => 'Avatar',
					'value'      => isset($data->profile_pic) ? $data->profile_pic : [],
					'attributes' => [
						'cropper' => true,
						'ratio'   => '200x200',
					],
				],
				/*'appointments[]' => [
					                    'type'          => 'file',
					                    'label'         => 'Avatar',
					                    'attributes'    => ['multiple' => true],
					                    'value'         => isset($data->appointment) ? $data->appointment : []
				*/
				'role_id'          => [
					'type'       => 'checkbox',
					'label'      => 'Role',
					'options'    => $roles,
					'attributes' => ['width' => 'col-lg-4 col-md-4 col-sm-12 col-xs-12'],
					'value'      => $userRoles,
					// if you want to single role for an User
					// change to radio instead of checkbox.
					// Comment upper value tag. And
					// uncomment value tag from below.
					// 'value'     => isset($userRoles[0]) ? $userRoles[0] : 0
				],
				'status'           => [
					'type'       => 'radio',
					'label'      => 'Status',
					'options'    => $status,
					'value'      => isset($data->status) ? $data->status : 1,
					'attributes' => ['width' => 'col-lg-4 col-md-4 col-sm-12 col-xs-12'],
				],
			],
		];

		if ($ownAccount) {
			unset($form['back_route']);
			unset($form['fields']['role_id']);
			unset($form['fields']['status']);
			unset($form['fields']['username']['attributes']['required']);
			unset($form['fields']['email']['attributes']['required']);

			$form['fields']['username']['attributes']['readonly'] = true;
			$form['fields']['email']['attributes']['readonly']    = true;
		}

		return view('admin.components.admin-form', compact('data', 'id', 'form', 'breadcrumb', 'module'));
	}

	/**
	 * Form post action
	 *
	 * @param  Request $request [description]
	 * @param  string  $id      [description]
	 * @return [type]           [description]
	 */
	protected function __formPost(UserRequest $request, $id = 0) {
		$isOwnAcc = true;
		//
		// if this is not own account, it will
		// require role.
		//
		if (Auth::user()->id != $id) {
			$isOwnAcc = false;
		}

		$input    = $request->all();
		$response = $this->_model->store($input, $id, $request);

		if ($response['status'] == 200) {
			if (!$isOwnAcc) {
				return redirect()
					->route($this->_routePrefix . '.index')
					->with('success', $response['message']);
			} else {
				return redirect()
					->route($this->_routePrefix . '.edit', $id)
					->with('success', $response['message']);
			}
		} else {
			return redirect()
				->route($this->_routePrefix . '.index')
				->with('error', $response['message']);
		}

	}
}
