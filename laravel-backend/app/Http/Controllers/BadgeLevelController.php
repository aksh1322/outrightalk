<?php

namespace App\Http\Controllers;

use App\Models\BadgeLevel;
use Illuminate\Http\Request;

class BadgeLevelController extends Controller
{
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->_module      = 'Badge Level';
        $this->_routePrefix = 'badgeLevel';
        $this->_model       = new BadgeLevel();
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
        $this->_data['pcategory']           = $this->_model->getListing();
        $srch_params                        = $request->all();
        // $srch_params['pid']                 = isset($srch_params['pid']) ? $srch_params['pid'] : 0;
        $this->_data['data']                = $this->_model->getListing($srch_params, $this->_offset);
        $this->_data['orderBy']             = $this->_model->orderBy;
        $this->_data['filters']             = $this->_model->getFilters();
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

    protected function __formUiGeneration(Request $request, $id = '')
    {
        $response = $this->initUIGeneration($id);
        if($response) {
            return $response;
        }
        extract($this->_data);
        $p_categories = $this->_model->getListing()->pluck('title', 'id');
        $type = \App\Helpers\Helper::makeSimpleArray($this->_model->types, 'id,name');
        $form = [
            'route'      => $this->_routePrefix . ($id ? '.update' : '.store'),
            'back_route' => route($this->_routePrefix . '.index'),
            'fields'     => [
                'title'      => [
                    'type'          => 'text',
                    'label'         => 'Category Title',
                    'attributes'    => [
                        'max'       => 20,
                        'required'  => true
                    ]
                ],
                'points_start_count'      => [
                    'type'          => 'number',
                    'label'         => 'Points Start Count',
                    'attributes'    => [
                        'min'       => 0,
                        'required'  => true
                    ]
                    ],
                'points_end_count'      => [
                    'type'          => 'number',
                    'label'         => 'Points End Count',
                    'attributes'    => [
                        'min'       => 0,
                        'required'  => true
                    ]
                ],
                'image' => [
                    'type'       => 'file',
                    'label'      => 'Icon',
                    'value'      => isset($data->icon_pic) ? $data->icon_pic : [],
                    'attributes' => [
                        //'required'  => true,
                        /*'cropper' => true,
                        'ratio'   => '50x50',*/
                    ],
                    'help' => 'The image must be a file of type: .png, .gif.  The image may not be greater than 200 kilobytes.'
                ]
            ],
        ];
        if (isset($data) && $data->icon_pic) {
            unset($form['fields']['image']['attributes']['required']);
        }
        return view('admin.components.admin-form', compact('data', 'id', 'form', 'breadcrumb', 'module'));
    }

    protected function __formPost(Request $request, $id = '')
    {
        $fileValidations = \App\Models\File::$fileValidations['sticker'];
        $validationRules = [
            'title' => 'required|max:20',
            'points_start_count'  => 'required|min:0',
            'points_end_count'  => 'required|min:0',
            'image' => 'mimes:'. $fileValidations['mime'] . '|max:' . $fileValidations['max']
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
