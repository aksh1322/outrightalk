<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Helper;
use App\Models\AdminMenu;

class MenuController extends Controller
{
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        
        $this->_module      = 'Admin Menu';
        $this->_routePrefix = 'menus';
        $this->_model       = new AdminMenu;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $parent_id = 0)
    {
        $this->_data['permission']  = \App\Models\Permission::checkModulePermissions();
        $srch_params                = $request->all();
        $srch_params["parent_id"]   = $parent_id;
        $this->_data['data']        = $this->_model->getListing($srch_params, $this->_offset);
        $this->_data['adminMenu']   = $this->_model->getParentMenu($parent_id);

        $this->_data['breadcrumb'][route($this->_routePrefix . '.index', 0)] = str_plural($this->_module);
        foreach ($this->_data['adminMenu'] as $key => $value) {
            $this->_data['breadcrumb'][route($this->_routePrefix . '.index', $value['id'])] = $value['menu'];
        }

        $this->_data['module']          = "Manage "  . str_plural($this->_module);
        $this->_data['routePrefix']     = $this->_routePrefix;
        $this->_data['parent_id']       = $parent_id;
        $this->_data['filters']         = $this->_model->getFilters();
        return view('admin.'.$this->_routePrefix . '.index', $this->_data)
            ->with('i', ($request->input('page', 1) - 1) * $this->_offset);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create($parent_id = 0)
    {
        return $this->__formUiGeneration($parent_id);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        return $this->__formPost($request);
    }


    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($parent_id = 0, $id)
    {
        return $this->__formUiGeneration($parent_id, $id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        return $this->__formPost($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($parent_id = 0, $id)
    {
        $data = AdminMenu::find($id);

        $return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.index', $parent_id);
        if ($return) {
            return $return;
        }
        
        $childs = $data->childs;
        if($data->delete() && $childs->count()){
            $childs->delete();
        }


        return redirect()
            ->route($this->_routePrefix . '.index', $parent_id)
            ->with('success', 'Menu have been deleted successfully');
    }

    /**
     * ui parameters for form add and edit
     *
     * @param  string $id [description]
     * @return [type]     [description]
     */
    protected function __formUiGeneration($parent_id = 0, $id = '')
    {
        $response = $this->initUIGeneration($id);
        if($response) {
            return $response;
        }

        extract($this->_data);

        $adminMenu = $this->_model->getParentMenu($parent_id);
        $this->_data['breadcrumb'] = [];
        $this->_data['breadcrumb'][route($this->_routePrefix . '.index', 0)] = str_plural($this->_module);
        foreach ($adminMenu as $key => $value) {
            $this->_data['breadcrumb'][route($this->_routePrefix . '.index', $value['id'])] = $value['menu'];
        }

        $module         = str_plural($this->_module) . ' | ' . $moduleName;
        $this->_data['breadcrumb']['#'] = $moduleName;

        $fieldOption    = view('admin.' . $this->_routePrefix . '.query-params', [
            'data'    => $data
        ])
        ->render();
        $status         = \App\Helpers\Helper::makeSimpleArray($this->_model->statuses, 'id,name');
        $form = [
            'route'             => $this->_routePrefix . ($id ? '.update' : '.store'),
            'back_route'        => route($this->_routePrefix . '.index', $parent_id), 
            'include_scripts'   => '<script src="'. asset('administrator/admin-form-plugins/form-controls.js'). '"></script>',
            'fields'     => [
                'parent_id' => [
                    'type'      => 'hidden',
                    'value'     => $parent_id
                ],
                'menu_html'     => [
                    'type'      => 'html',
                    'value'     => '<h3>Menu Info</h3>'
                ],
                'group_menu'    => [
                    'type'      => 'switch',
                    'label'     => 'Parent Menu',
                    'options'   => [
                        1       => ''
                    ],
                    'value'     => $data->class ? 0 : 1
                ],
                'menu'             => [
                    'type'       => 'text',
                    'label'      => 'Menu Name',
                    'help'       => 'This will be shown on your menu bar. Maximum 255 characters',
                    'attributes' => ['required' => true],
                ],
                'icon'             => [
                    'type'       => 'text',
                    'label'      => 'Menu Icon',
                    'help'       => 'Maximum 25 characters',
                    'extra'         => [
                        'type'      => 'custom',
                        'value'     => '<a href="'. route('ui.icons') .'" data-toggle="modal" data-target="#myModal" data-remote="false" data-layout="true" class="btn btn-info waves-effect btn-sm"><i class="bx bx-info-circle"></i> <span>Icon List</span></a>'
                    ],
                ],
                'class'             => [
                    'type'       => 'text',
                    'label'      => 'Controller Name',
                    'help'       => 'Your controller name. Maximum 50 characters',
                    'attributes' => !$parent_id ? [] : ['required' => true],
                ],
                'method'             => [
                    'type'       => 'text',
                    'label'      => 'Controller Method Name',
                    'help'       => 'Your controller\'s method name. Maximum 50 characters',
                    'attributes' => !$parent_id ? [] : ['required' => true],
                ],
                'url'             => [
                    'type'       => 'text',
                    'label'      => 'URL',
                    'help'       => 'Enter your route name',
                    'value'      => $data->url ? $data->url : '#'
                ],
                'query_params'      => [
                    'type'          => 'html',
                    'value'         => $fieldOption
                ],
                'display_order' => [
                    'type' => 'text',
                    'label' => 'Display Order',
                    'value' => $data->display_order ? $data->display_order : 0
                ],
                'status' => [
                    'type' => 'radio',
                    'label' => 'Status',
                    'options' => $status,
                    'value' => isset($data->status) ? $data->status : 1
                ],
            ],
        ];

        if(!$id){
            $roleModel      = new \App\Models\Role();
            $userModel      = new \App\Models\User();
            $userMinRole    = $userModel->myRoleMinLevel(\Auth::user()->id);
            $roles          = $roleModel->getListing([
                                    'level_gt'  => $userMinRole, 
                                    'orderBy'   => 'roles__level'
                                ])
                                ->pluck('title', 'id')
                                ->all();
            $permissionMenu = [
                'permission_html' => [
                    'type' => 'html',
                    'value' => '<div class="row">
                                    <div class="col-lg-3 col-md-3 col-sm-3 col-xs-12"><h3>Permission Info</h3></div>
                                    <div class="col-lg-3 col-md-3 col-sm-3 col-xs-12 m-t-15">
                                        <div class="switch">
                                            <label>
                                                <input type="checkbox" name="permission_required" value="1" checked id="permission_required"><span class="lever"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>'
                ],
                'permission_list'             => [
                    'type'       => 'text',
                    'label'      => 'Permission for Listing',
                    'help'       => 'Please input Method\'s name only. Maximum 255 characters',
                    'value'      => 'index'
                ],
                'permission_add'             => [
                    'type'       => 'text',
                    'label'      => 'Permission for Add new Item',
                    'help'       => 'Please input Method\'s name only. Maximum 255 characters',
                    'value'      => 'create'
                ],
                'permission_edit'             => [
                    'type'       => 'text',
                    'label'      => 'Permission for Edit an Item',
                    'help'       => 'Please input Method\'s name only. Maximum 255 characters',
                    'value'      => 'edit'
                ],
                'permission_delete'             => [
                    'type'       => 'text',
                    'label'      => 'Permission for Delete a Item',
                    'help'       => 'Please input Method\'s name only. Maximum 255 characters',
                    'value'      => 'destroy'
                ],
                'role_html' => [
                    'type'      => 'html',
                    'value'     => '<h3>Role Info</h3>'
                ],
                'role_ids'             => [
                    'type'       => 'checkbox',
                    'label'      => 'Assign permission for Roles',
                    'options'    => $roles,
                    'value'      => '',
                    'attributes' => ['width' => 'col-lg-4 col-md-4 col-sm-12 col-xs-12'],
                ]
            ];


            $form['fields'] = array_merge($form['fields'], $permissionMenu);
        }

        if($parent_id){
            unset($form['fields']['group_menu']);
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
    protected function __formPost(Request $request, $id = '')
    {
        $validationRules = [
            'menu'              => 'required|max:255',
            'class'             => 'required|max:50',
            'method'            => 'required|max:50',
            'display_order'     => 'required|numeric'
        ];

        $input = $request->all();
        if(!$input['parent_id'] && isset($input['group_menu'])){
            $validationRules['class']   = 'nullable|max:50';
            $validationRules['method']  = 'nullable|max:50';
        }

        $this->validate($request, $validationRules);

        if ($id) {
            $data       = $this->_model->find($id);

            $return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.index');
            if ($return) {
                return $return;
            }

            $data->update($input);
        } else {
            $data   = $this->_model->create($input);

            // if parent id exists
            // it will insert roles and
            // assign permission.
            if(isset($input['permission_required']) && $input['permission_required']){
                $menuName           = ucwords(str_replace(" ", "_", strtolower($input['menu'])));
                $permissionList     = null;
                $permissionAdd      = null;
                $permissionEdit     = null;
                $permissionDelete   = null;
                if($input['permission_list']) {
                    $permissionList     = \App\Models\Permission::where([
                        'class'  => $input['class'],
                        'method' => $input['permission_list']
                    ])->first();
                    if(!$permissionList) {
                        $permissionList     = \App\Models\Permission::create([
                            'p_type' => $menuName . ' List',
                            'class'  => $input['class'],
                            'method' => $input['permission_list']
                        ]);
                    }
                }
                
                if($input['permission_add']) {
                    $permissionAdd = \App\Models\Permission::where([
                        'class'  => $input['class'],
                        'method' => $input['permission_add']
                    ])->first();
                    if(!$permissionAdd) {
                        $permissionAdd = \App\Models\Permission::create([
                            'p_type' => $menuName . ' Add',
                            'class'  => $input['class'],
                            'method' => $input['permission_add']
                        ]);
                    }
                }
                
                if($input['permission_edit']) {
                    $permissionEdit = \App\Models\Permission::where([
                        'class'  => $input['class'],
                        'method' => $input['permission_edit']
                    ])->first();
                    if(!$permissionEdit) {
                        $permissionEdit = \App\Models\Permission::create([
                            'p_type' => $menuName . ' Edit',
                            'class'  => $input['class'],
                            'method' => $input['permission_edit']
                        ]); 
                    }   
                }
                
                if($input['permission_delete']) {
                    $permissionDelete = \App\Models\Permission::where([
                        'class'  => $input['class'],
                        'method' => $input['permission_delete']
                    ])->first();
                    if(!$permissionDelete) {
                        $permissionDelete = \App\Models\Permission::create([
                            'p_type' => $menuName . ' Delete',
                            'class'  => $input['class'],
                            'method' => $input['permission_delete']
                        ]);
                    }
                }
                

                $currentUserRole        = \Auth::user()->roles->pluck('id')->toArray();
                $input['role_ids']      = array_merge($input['role_ids'], $currentUserRole);
                $roleModel              = new \App\Models\Role();
                $superAdminRole         = $roleModel->getListing(['slug' => 'super-admin']);
                if($currentUserRole != $superAdminRole->id){
                    $input['role_ids'][]    = $superAdminRole->id;
                }
                $rolePermission         = [];
                
                foreach ($input['role_ids'] as $role) {

                    if($permissionList) {
                        $isExists = \App\Models\PermissionRole::where([
                            'pid' => $permissionList->id,
                            'rid' => $role
                        ])->first();

                        if(!$isExists) {
                            $rolePermission[] = [
                                'pid' => $permissionList->id,
                                'rid' => $role
                            ];
                        }
                    }
                    
                    if($permissionAdd) {
                        $isExists = \App\Models\PermissionRole::where([
                            'pid' => $permissionAdd->id,
                            'rid' => $role
                        ])->first();

                        if(!$isExists) {
                            $rolePermission[] = [
                                'pid' => $permissionAdd->id,
                                'rid' => $role
                            ];
                        }
                    }
                    
                    if($permissionEdit) {
                        $isExists = \App\Models\PermissionRole::where([
                            'pid' => $permissionEdit->id,
                            'rid' => $role
                        ])->first();

                        if(!$isExists) {
                            $rolePermission[] = [
                                'pid' => $permissionEdit->id,
                                'rid' => $role
                            ];
                        }
                    }
                    
                    if($permissionDelete) {
                        $isExists = \App\Models\PermissionRole::where([
                            'pid' => $permissionDelete->id,
                            'rid' => $role
                        ])->first();

                        if(!$isExists) {
                            $rolePermission[] = [
                                'pid' => $permissionDelete->id,
                                'rid' => $role
                            ];
                        }
                    }
                    
                }

                \App\Models\PermissionRole::insert($rolePermission);
            } 
        }

        return redirect()
            ->route($this->_routePrefix . '.index', $input['parent_id'])
            ->with('success', 'Record has been successfully saved.');
    }
}
