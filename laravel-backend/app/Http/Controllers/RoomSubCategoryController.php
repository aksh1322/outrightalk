<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\RoomCategory;
use Illuminate\Contracts\Validation\Validator;

class RoomSubCategoryController extends Controller
{
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->_module      = 'Room Sub Category';
        $this->_routePrefix = 'sub-categories';
        $this->_model       = new Group();
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $this->initIndex();
        $this->_data['permisssionState']    = \App\Models\Permission::checkModulePermissions(['index']);
        $this->_data['pcategory']           = RoomCategory::paginate(10);
        $srch_params                        = $request->all();
        $srch_params['pid']                 = isset($srch_params['pid']) ? $srch_params['pid'] : 0;
        $this->_data['data']                = Group::paginate(10);
        $this->_data['orderBy']             = $this->_model->orderBy;
       // $this->_data['filters']             = $this->_model->getFilters();
        $this->_data['srch_params']         = $srch_params;
        return view('admin.' . $this->_routePrefix . '.index', $this->_data)
            ->with('i', ($request->input('page', 1) - 1) * $this->_offset);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        return $this->__formUiGeneration($request);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // echo "<pre>";
        // print_r($request->all()); die;
        
       // Group::firstOrCreate(array('categories_id' => $request->pid, 'group_name' => $request->title));
        $group = new Group;
        $group->group_name = $request->title;
        $group->categories_id = $request->pid+1;
        $group->categoty_type = $request->categoty_type+1;
        $group->color_code = $request->color_code;
        $group->group_type = $request->group_type+1;
        $group->save();

        return redirect('admin/sub-categories');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = Group::paginate(10);
        return view('admin.' . $this->_routePrefix . '.show', compact('data'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
        return $this->__formUiGeneration($request, $id);
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
        //return $this->__formPost($request, $id);
       // Group::update(array('id' => $id, 'group_name = ' => $request->title));
       $cat_update =  Group::where('id',$id)->first();

       if ($request->group_type == 1) {
           $group_type = "system";
       }else{
           $group_type = "public";
       }
       //  echo "<pre>";
       // print_r($request->categoty_type); die;
       $cat_update->group_name = $request->title;
       $cat_update->categories_id = $request->pid+1;
        $cat_update->categoty_type = $request->categoty_type;
        $cat_update->color_code = $request->color_code;
        $cat_update->group_type = $group_type;
       $cat_update->save();


        return redirect('admin/sub-categories');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $sub_cat =  Group::where('id',$id)->first();
        $sub_cat->delete();
         return redirect('admin/sub-categories');
        //$response = $this->_model->remove($id);

       /* if($response['status'] == 200) {
            return redirect()
                ->route($this->_routePrefix . '.index')
                ->with('success', $response['message']);
        } else {
            return redirect()
                    ->route($this->_routePrefix . '.index')
                    ->with('error', $response['message']);
        }*/
    }

    /**
     * ui parameters for form add and edit
     *
     * @param  string $id [description]
     * @return [type]     [description]
     */
    protected function __formUiGeneration(Request $request, $id = '')
    {
        $response = $this->initUIGeneration($id);
        if($response) {
            return $response;
        }

        extract($this->_data);
        //$room_category = RoomCategory::get();
        $p_categories = $this->_model->getListing(['pid' => 0])->pluck('title', 'id');
        $type = \App\Helpers\Helper::makeSimpleArray($this->_model->types, 'id,name');
        $form = [
            'route'      => $this->_routePrefix . ($id ? '.update' : '.store'),
            'back_route' => route($this->_routePrefix . '.index'),
            'fields'     => [
                'pid' => [
                    'type'          => 'select',
                    'label'         => 'Select Category',
                    'options'       => ['Adult','Restricted','General','System'],
                    'attributes' => [
                        'id' => 'select-category_id',
                        'required' => true,
                    ],
                    'value' => isset($data) ? $data->id: []
                ],
                'title'      => [
                    'type'          => 'text',
                    'label'         => 'Title',
                    'value'      => isset($data->group_name) ? $data->group_name : "",
                    'attributes'    => [
                        'max'       => 20,
                        'required'  => true
                    ]

                ],

                'categoty_type'      => [
                    'type'          => 'select',
                    'label'         => 'Select Category Type',
                    'options'       => ['Normal','Adult'],
                    'attributes' => [
                        'id' => 'select-category-type',
                        'required' => true,
                    ],
                    'value' => isset($data) ? $data->categoty_type: []

                ],

                'color_code'      => [
                    'type'          => 'text',
                    'label'         => 'Color code',
                    'value'      => isset($data->color_code) ? $data->color_code : "",
                    'attributes'    => [
                        'max'       => 20,
                        'required'  => true
                    ]

                ],

                'group_type'      => [
                    'type'          => 'select',
                    'label'         => 'Select Group Type',
                    'options'       => ['public','system'],
                    'attributes' => [
                        'id' => 'select-group-type',
                        'required' => true,
                    ],
                    'value' => isset($data) ? $data->group_type: []

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
        $fileValidations = \App\Models\File::$fileValidations['sub-categories'];
        $validationRules = [
            'title' => 'required|max:20',
            //'type' => 'required',
        ];

//        $file = $request->file('image');
//        dd($file->getMimeType());
        $validator = \Validator::make($request->all(), $validationRules);
        if ($validator->fails()) {
            return redirect()
                    ->back()
                    ->with('error', $validator->errors());
        }

        $input      = $request->all();
        if (!isset($input['id'])) {
            $input['id'] = 0;
        }
        $response   = $this->_model->store($input, $id, $request);

        if($response['status'] == 200){
            return redirect()
                ->route($this->_routePrefix . '.index')
                ->with('success',  $response['message']);
        } else {
            return redirect()
                    ->route($this->_routePrefix . '.index')
                    ->with('error', $response['message']);
        }
    }

    public function getCategory(Request $request) {
        $input = $request->all();
        $data = $this->_model->getListing($input);
        return \App\Helpers\Helper::rj('Record found', 200, $data);
    }
}
