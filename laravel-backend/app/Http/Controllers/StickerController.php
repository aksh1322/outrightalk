<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Sticker;
use App\Models\StickerPack;
use Illuminate\Contracts\Validation\Validator;

class StickerController extends Controller
{
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->_module      = 'Sticker';
        $this->_routePrefix = 'sticker';
        $this->_model       = new Sticker();
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
        $srch_params                        = $request->all();
        $this->_data['data']                = $this->_model->getListing($srch_params, $this->_offset);
        $this->_data['orderBy']             = $this->_model->orderBy;
        $this->_data['filters']             = $this->_model->getFilters();
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
        return $this->__formPost($request);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = $this->_model->getListing(['id' => $id]);
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
        return $this->__formPost($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $response = $this->_model->remove($id);

        if($response['status'] == 200) {
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
    protected function __formUiGeneration(Request $request, $id = '')
    {
        $response = $this->initUIGeneration($id);
        if($response) {
            return $response;
        }

        extract($this->_data);
        //dd($data);
        $stickerCatObj = new \App\Models\StickerCategory();
        $types = \App\Helpers\Helper::makeSimpleArray($stickerCatObj->types, 'id,name');
        if (isset($data) && $data->type) {
            $param['type'] = $data->type;
            $param['pid'] = 0;
            $categories = $stickerCatObj->getListing($param)->pluck('title', 'id');
        } else {
            $categories = [];
        }
        if (isset($data) && $data->category_id) {
            $param['pid'] = $data->category_id;
            $sub_categories = $stickerCatObj->getListing($param)->pluck('title', 'id')->toArray();
        } else {
            $sub_categories = [];
        }

        $stickerPack = new StickerPack();
        $stickerTypes = \App\Helpers\Helper::makeSimpleArray($stickerPack->types, 'id , name');
        $stickerPacks = \App\Helpers\Helper::makeSimpleArray($stickerPack->get()->toArray(), 'id , title');

        $form = [
            'route'      => $this->_routePrefix . ($id ? '.update' : '.store'),
            'back_route' => route($this->_routePrefix . '.index'),
            'fields'     => [
                'type_id' => [
                    'type'          => 'select',
                    'label'         => 'Select Category Type',
                    'options'       => $types,
                    'attributes' => [
                        'id' => 'select-category_type_id',
                        'required' => true,
                    ],
                    'value' => isset($data) ? $data->type : [],
                ],
                'category_id' => [
                    'type'          => 'select',
                    'label'         => 'Select Category',
                    'options'       => $categories,
                    'attributes' => [
                        'id' => 'select-category_id',
                        'required' => true,
                    ],
                ],
                'sub_category_id' => [
                    'type'          => 'select',
                    'label'         => 'Select Category',
                    'options'       => $sub_categories,
                    'attributes' => [
                        'id' => 'select-sub_category_id',
//                        'required' => true,
                    ],
                ],
                'title'      => [
                    'type'          => 'text',
                    'label'         => 'Sticker Title',
                    'attributes'    => [
                        'max'       => 20,
                    ]
                ],
                'sticker_type' => [
                    'type'          => 'select',
                    'label'         => 'Select Sticker Type',
                    'options'       => $stickerTypes,
                    'attributes' => [
                        'id' => 'select-sticker_type',
                        'required' => true,
                    ],
                ],
                'sticker_pack_id' => [
                    'type'          => 'select',
                    'label'         => 'Select Sticker Pack',
                    'options'       => $stickerPacks,
                    'attributes' => [
                        'id' => 'select-sticker_pack_id',
//                        'required' => true,
                    ],
                ],
                'image' => [
                    'type'       => 'file',
                    'label'      => 'Icon',
                    'value'      => isset($data->icon_pic) ? $data->icon_pic : [],
                    'attributes' => [
                        'required'       => true,
                        /*'cropper' => true,
                        'ratio'   => '50x50',*/
                    ],
                    'help' => 'The image must be a file of type: .png, .gif.  The image may not be greater than 200 kilobytes.'
                ],
                'credit_points'      => [
                    'type'          => 'number',
                    'label'         => 'Credit Points',
                    'attributes'    => [
                        'required'       => true,
                        'min' => 1
                    ]
                ],
            ],
        ];
        if (isset($data) && $data->icon_pic) {
            $form['fields']['width'] = [
                'type'          => 'number',
                    'label'         => 'Icon Width',
                    'attributes'    => [
                        'required'       => true,
                        'min' => 1
                    ]
            ];
            $form['fields']['height'] = [
                'type'          => 'number',
                    'label'         => 'Icon Height',
                    'attributes'    => [
                        'required'       => true,
                        'min' => 1
                    ]
            ];
            unset($form['fields']['image']['attributes']['required']);
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

        $fileValidations = \App\Models\File::$fileValidations['sticker'];
        $validationRules = [
            'title' => 'nullable|max:50',
            'type_id' => 'required',
            'category_id' => 'required',
            'sticker_type' => 'required|in:0,1',
            'sticker_pack_id' => 'required_if:sticker_type,==,1',
            'image' => 'mimes:'. $fileValidations['mime'] . '|max:' . $fileValidations['max']
        ];
        if ($request->type_id == 'credit') {
            $validationRules['credit_points'] = 'required';
        }

//      $file = $request->file('image');
//      dd($file->getMimeType());
        $validator = \Validator::make($request->all(), $validationRules);
        if ($validator->fails()) {
            return redirect()
                    ->back()
                    ->with('error', $validator->errors());
        }

        $input      = $request->all();
        $input['sticker_pack_id'] =  $request->sticker_pack_id ?? 0;

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
}
