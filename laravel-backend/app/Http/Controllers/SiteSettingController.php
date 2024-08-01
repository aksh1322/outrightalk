<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\SiteSetting;


class SiteSettingController extends Controller
{
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        
        $this->_module      = 'Site Settings';
        $this->_routePrefix = 'settings';
        $this->_model       = new SiteSetting;
    }

    public function create(Request $request)
    {
        return $this->__formUiGeneration();
    }


    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($group_name)
    {
        if(is_numeric($group_name)){
            return $this->__formUiGeneration($group_name);
        }
        
        $group_names= SiteSetting::select('group_name')->distinct()->get()->pluck('group_name')->toArray();
        $tabs       = [];
        $id         = $group_name;
        $module     = "Manage " . $this->_module;
        $breadcrumb = [
            '#'     => $this->_module ,
        ];

        foreach ($group_names as $tab) {
            $tabs[] = [
                'url'       => route($this->_routePrefix . '.edit', $tab),
                'name'      => ucwords($tab),
                'active'    => ($tab == $group_name) ? true : false
            ];
        }

        $tabs[] = [
            'url'           => route($this->_routePrefix . '.edit', 'manipulation'),
            'name'          => 'Manipulation',
            'active'        => ($group_name == 'manipulation') ? true : false
        ];

        if(!in_array($group_name, ['manipulation'])){
            $fields = [];
            $data       = SiteSetting::where('group_name', $group_name)->get();
            foreach($data as $key => $val){
                $fields[$val->key] = [
                    'type'          => $val->field_type_details,
                    'label'         => $val->field_label,
                    'value'         => $val->val,
                    'help'          => $val->help_text,
                    'extra'         => [
                        'type'      => 'custom',
                        'value'     => "<span class='label bg-black'>\Config::get('settings." . $val->key . "')</span>"
                    ],
                    'attributes'    => [
                        'data-id'   => $val->id
                    ]
                ];

                if($val->is_required){
                    $fields[$val->key]['attributes']['required'] = true;
                }

                if(in_array($val->field_type, [5,6,7])){
                    $options                        = \App\Helpers\Helper::makeSimpleArray($val->field_options, "key,val");
                    $fields[$val->key]['options']   = $options;
                }
            }

            $form = [
                'route'     => $this->_routePrefix . ($group_name ? '.update' : '.store'),
                'fields'    => $fields,
                'tabs'      => $tabs
            ];

            $formType = 'edit';
            return view('admin.components.admin-form', compact(
                'form', 
                'id', 
                'data', 
                'breadcrumb', 
                'module', 
                'formType'
            ));
        } else {
            if($group_name == 'manipulation') {
                $permission = \App\Models\Permission::checkModulePermissions([
                    'settingsExport',
                    'settingsImport',
                    'uiIcons',
                    'uiElements',
                    'create'
                ]);
                $id         = null;
                $data       = [
                    'tabs'  => $tabs
                ];
                $importForm = null;
                $exportForm = null;
                $moduleTypes = [
                                'AdminMenu'         => [
                                    'title'         => 'Admin Menus',
                                    'controller'    => 'MenuController',
                                ],
                                'Permission'        => [
                                    'title'         => 'Permissions',
                                    'controller'    => 'PermissionController',
                                ],
                                'PermissionRole'    => [
                                    'title'         => 'Permission Role Mappings',
                                    'controller'    => 'PermissionController',
                                ],
                                'Role'              => [
                                    'title'         => 'Roles',
                                    'controller'    => 'RoleController',
                                ],
                                'SiteContent'       => [
                                    'title'         => 'Contents',
                                    'controller'    => 'SiteContentController',
                                ],
                                'SiteSetting'       => [
                                    'title'         => 'Settings',
                                    'controller'    => 'SiteSettingController',
                                ],
                                'SiteTemplate'      => [
                                    'title'         => 'Templates',
                                    'controller'    => 'SiteTemplateController',
                                ]
                            ];
                $moduleTypesList    = [];
                $moduleTypesCreate  = [];
                foreach($moduleTypes as $moduleKey => $moduleValue) {
                    $hasPermission = \App\Models\Permission::checkModulePermissions(['index', 'create'], $moduleValue['controller']);

                    if(!isset($hasPermission['index']) || (isset($hasPermission['index']) && $hasPermission['index'])){
                        $moduleTypesList[$moduleKey] = $moduleValue['title'];
                    }
                    if(!isset($hasPermission['create']) || (isset($hasPermission['create']) && $hasPermission['create'])){
                        $moduleTypesCreate[$moduleKey] = $moduleValue['title'];
                    }
                }

                if(!empty($moduleTypesList)){
                    $exportForm = [
                        'route' => 'settings.export',
                        'submit_text'   => '<i class="bx bx-download"></i> <span>Export</span>',
                        'fields'    => [
                            'export_table' => [
                                'type'          => 'select',
                                'label'         => 'Module Type',
                                'options'       => $moduleTypesList,
                                'value'         => '',
                                'help'          => 'Choose module type to export the data as a json format.',
                                'label_width'   => 'col-lg-4 col-md-4 col-sm-4 col-xs-12',
                                'field_width'   => 'col-lg-8 col-md-8 col-sm-8 col-xs-12',
                            ]
                        ]
                    ];
                }
                

                if(!empty($moduleTypesCreate)){
                    $importForm = [
                        'route'             => 'settings.import',
                        'submit_text'       => '<i class="bx bx-upload"></i> <span>Import</span>',
                        'include_scripts'   => '<script src="'. asset('administrator/admin-form-plugins/form-controls.js'). '"></script>',
                        'fields'    => [
                            'import_table' => [
                                'type'          => 'select',
                                'label'         => 'Module Type',
                                'options'       => $moduleTypesCreate,
                                'value'         => '',
                                'help'          => 'Choose module type to export the data as a json format.',
                                'label_width'   => 'col-lg-4 col-md-4 col-sm-4 col-xs-12',
                                'field_width'   => 'col-lg-8 col-md-8 col-sm-8 col-xs-12',
                            ],
                            'accept_new' => [
                                'type'          => 'switch',
                                'label'         => 'Accept New',
                                'options'       => ['1' => ''],
                                'value'         => '1',
                                'help'          => 'If you choose Yes, it will take only new data from the imported file. If you choose No, it will delete all the data first then import new data.',
                                'label_width'   => 'col-lg-4 col-md-4 col-sm-4 col-xs-12',
                                'field_width'   => 'col-lg-8 col-md-8 col-sm-8 col-xs-12',
                            ],
                            'primary_key' => [
                                'type'          => 'text',
                                'label'         => 'Primary Key',
                                'value'         => 'id',
                                'help'          => 'Define primary key for this module, if there is no primary key, left as blank.',
                                'label_width'   => 'col-lg-4 col-md-4 col-sm-4 col-xs-12',
                                'field_width'   => 'col-lg-8 col-md-8 col-sm-8 col-xs-12',
                            ],
                            'imported_file' => [
                                'type'          => 'file',
                                'label'         => 'Import File',
                                'value'         => null,
                                'help'          => 'Supports only json file',
                                'label_width'   => 'col-lg-4 col-md-4 col-sm-4 col-xs-12',
                                'field_width'   => 'col-lg-8 col-md-8 col-sm-8 col-xs-12',
                            ]
                        ]
                    ];
                }
                
                return view('admin.' . $this->_routePrefix . '.' . $group_name, compact(
                    'id', 
                    'data', 
                    'breadcrumb', 
                    'module', 
                    'exportForm', 
                    'importForm',
                    'permission'
                ));

            }
        }
        
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $group_name)
    {
        if(is_numeric($group_name)){
            $this->__formPost($request, $group_name);
        }

        $input = $request->all();
        unset($input['_method']);
        unset($input['_token']);

        foreach($input as $key => $val){
            SiteSetting::where("key", "=", $key)->update([
                'val' => $val
            ]);
        }

        \App\Models\SiteSetting::makeCacheSetting();
        return redirect()->back()
                        ->with('success','Site Settings updated successfully');
    }

    /**
     * Store setting key
     */
    public function store(Request $request)
    {
        return $this->__formPost($request);
    }


    /**
     * ui parameters for form add and edit
     *
     * @param  string $id [description]
     * @return [type]     [description]
     */
    protected function __formUiGeneration($id = '')
    {
        $data       = [];
        $moduleName = 'Add ' . $this->_module;

        if ($id) {
            $data       = $this->_model->getListing(['id' => $id]);
            
            $return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.edit', ['manipulation']);
            if ($return) {
                return $return;
            }

            $moduleName = 'Edit ' . $this->_module;
        } else {
            $data = $this->_model;
        }

        $module     = $this->_module . ' | ' . $moduleName;
        $breadcrumb = [
            route($this->_routePrefix . '.edit', ['manipulation']) => $this->_module,
            '#'                                   => $moduleName,
        ];

        $fieldOption = view('admin.' . $this->_routePrefix . '.field-options', [
            'data'    => $data
        ])
        ->render();

        $form = [
            'route'      => $this->_routePrefix . ($id ? '.update' : '.store'),
            'back_route' => route($this->_routePrefix . '.edit', ['manipulation']),
            'include_scripts' => '<script src="'. asset('administrator/admin-form-plugins/form-controls.js'). '"></script>',
            'fields'     => [
                'field_type'        => [
                    'type'          => 'select',
                    'label'         => 'Field Type',
                    'options'       => $this->_model::$fieldTypes,
                    'value'         => $data->field_type ? $data->field_type : '1'
                ],
                'group_name'        => [
                    'type'          => 'text',
                    'label'         => 'Field Group',
                    'help'          => 'The field will populate under which tab, pleaes specify the name, and maximum 255 characters.',
                    'attributes'    => ['required' => true],
                ],
                'key'               => [
                    'type'          => 'text',
                    'label'         => 'Field Name',
                    'help'          => 'Field name should be unique, and maximum 255 characters.',
                    'attributes'    => ['required' => true],
                ],
                'field_label'       => [
                    'type'          => 'text',
                    'label'         => 'Field Display Label',
                    'help'          => 'Field display name in the form, and maximum 255 characters.',
                    'attributes'    => ['required' => true],
                ],
                'help_text'         => [
                    'type'          => 'text',
                    'label'         => 'Field Help Text',
                    'help'          => 'Field help text, it will display under the name in the form, and maximum 255 characters.'
                ],
                'field_option'      => [
                    'type'          => 'html',
                    'value'         => $fieldOption
                ],
                'val'               => [
                    'type'          => 'text',
                    'label'         => 'Default Value',
                    'help'          => 'Maximum 255 characters'
                ],
                'is_required'       => [
                    'type'          => 'radio',
                    'label'         => 'Is Required Field',
                    'options'       => ['1' => 'Yes', '0' => 'No'],
                    'value'         => $data->is_required ? $data->is_required : 1
                ],
                'is_visible'        => [
                    'type'          => 'radio',
                    'label'         => 'Is Visible',
                    'options'       => ['1' => 'Yes', '0' => 'No'],
                    'value'         => $data->is_visible ? $data->is_visible : 1,
                    'help'          => 'Is this field visible in the api response?'
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
    protected function __formPost(Request $request, $id = '')
    {
        $input              = $request->all();
        $validationRules    = [
            'field_type'    => 'required|max:255',
            'group_name'    => 'required|max:255',
            'key'           => 'required|max:255|unique:site_settings,key,' . $id . ',id',
        ];

        if(in_array($input['field_type'], ["5", "6", "7", "10"])){
            $validationRules['field_options']   = 'required';
        }
        $this->validate($request, $validationRules);


        if ($id) {
            $data = $this->_model->getListing(['id' => $id]);

            $return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.edit', ['manipulation']);
            if ($return) {
                return $return;
            }

            $data->update($input);
        } else {
            $siteContent   = $this->_model->create($input);
        }

        return redirect()
            ->route($this->_routePrefix . '.edit', ['manipulation'])
            ->with('success', 'Record has been successfully saved.');
    }

    public function settingsExport(Request $request)
    {
        $validationRules = [
            'export_table'     => 'required'
        ];

        $validationMessages = [
            'export_table.required'     => 'The module type field is required.'
        ];

        $this->validate($request, $validationRules, $validationMessages);

        $input      = $request->all();
        $model      = 'App\Models\\' . $input['export_table'];
        $data       = $model::all();
        $fileName   = $input['export_table'] . '.json';

        return response($data->toJson(), 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="'. $fileName .'"',
        ]);
    }

    public function settingsImport(Request $request)
    {
        $fileValidations    = \App\Models\File::$fileValidations['json'];
        $validationRules    = [
            'import_table'  => 'required',
            'imported_file' => 'required|mimes:'. $fileValidations['mime'] . '|max:' . $fileValidations['max'],
        ];

        $validationMessages = [
            'import_table.required'     => 'The module type field is required.',
            'imported_file.required'    => 'The import file field is required.'
        ];

        $this->validate($request, $validationRules, $validationMessages);

        $input          = $request->all();

        // Uploading file into temp folder and
        // read from file.
        $file           = \App\Models\File::upload($request, 'imported_file', 'temp');
        $fileContent    = \App\Models\File::read($file, $file->cdn);
        $created        = false;
        if($fileContent){
            $fileContent    = json_decode($fileContent);
            $model          = 'App\Models\\' . $input['import_table'];
            $acceptNew      = !isset($input['accept_new']) ? false : true;

            // if not accepts new, it will first
            // truncate the table, then re-insert
            // the value.
            if(!$acceptNew){
                $model::truncate();
            }
            foreach ($fileContent as $key => $value) {
                $value = (array)$value;
                // if accepting new data, it will 
                // check whether the data is exists
                // or not.
                if($acceptNew){
                    $data = null;
                    if($input['primary_key']){
                        if(!array_key_exists($input['primary_key'], $value)){
                            break;
                        }
                        $data = $model::where($input['primary_key'], $value[$input['primary_key']])->first();
                    } else {
                        $data = $model::where($value)->first();
                    }

                    if(!empty($data)){
                        continue;
                    }
                }

                if($model::insert($value)){
                    $created = true;
                }
            }
        }

        \App\Models\File::unlinkFile($file, $file->cdn);
        if($created){
            // Updating env settings.
            if($input['import_table'] == 'SiteSetting'){
                SiteSetting::makeCacheSetting();
            }
            return redirect()->back()
                        ->with('success','Data has been successfully imported.');
        }

        return redirect()->back()
                        ->with('error','No new data to import.');
    }

    public function uiIcons(Request $request)
    {
        // $this->_module  = 'Icons';
        $module         = "Icons";
        $breadcrumb     = [
            route($this->_routePrefix . '.edit', 'general') => $this->_module,
            route($this->_routePrefix . '.index') => $module,
        ];

        $routePrefix    = $this->_routePrefix;
        $viewPate       = $request->ajax() ? '.components.general-modal' : '.components.general';
        $includePage    = 'admin.' . $routePrefix . '.icons-body';

        return view('admin.'. $viewPate, compact(
            'breadcrumb', 
            'module', 
            'routePrefix',
            'includePage'
        ));
    }
}
