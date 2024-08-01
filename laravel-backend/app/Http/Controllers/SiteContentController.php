<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\Request;

class SiteContentController extends Controller
{
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        
        $this->_module      = 'Site Content';
        $this->_routePrefix = 'contents';
        $this->_model       = new SiteContent();
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $this->initIndex();
        $srch_params            = $request->all();
        $this->_data['data']    = $this->_model->getListing($srch_params, $this->_offset);
        $this->_data['orderBy'] = $this->_model->orderBy;
        return view('admin.'.$this->_routePrefix . '.index', $this->_data)
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
    public function show(Request $request, $id)
    {
        $data           = $this->_model->getListing(['id' => $id]);
        $module         = $data->title;
        $breadcrumb     = [
            route($this->_routePrefix . '.index')   => str_plural($this->_module),
            '#'                                     => $module
        ];
        
        $routePrefix    = $this->_routePrefix;
        $viewPate       = $request->ajax() ? '.components.general-modal' : '.components.general';
        $includePage    = 'admin.' . $routePrefix . '.show';

        return view('admin.'. $viewPate, compact(
            'breadcrumb', 
            'module', 
            'data',
            'routePrefix',
            'includePage'
        ));
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
        $data = $this->_model->getListing(['id' => $id]);

        $return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.index');
        if ($return) {
            return $return;
        }

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
    protected function __formUiGeneration(Request $request, $id = '')
    {
        $response = $this->initUIGeneration($id);
        if($response) {
            return $response;
        }

        extract($this->_data);

        $labelWidth = 'col-lg-2 col-md-2 col-sm-4 col-xs-12 text-right';
        $fieldWidth = 'col-lg-6 col-md-6 col-sm-6 col-xs-12';
        $form = [
            'route'      => $this->_routePrefix . ($id ? '.update' : '.store'),
            'back_route' => route($this->_routePrefix . '.index'),
            'fields'     => [
                'title'             => [
                    'type'          => 'text',
                    'label'         => 'Title',
                    'help'          => 'Maximum 255 characters',
                    'attributes'    => ['required' => true],
                    'label_width'   => $labelWidth,
                    'field_width'   => $fieldWidth
                ],
                'short_description' => [
                    'type'          => 'textarea',
                    'label'         => 'Short Description',
                    'label_width'   => $labelWidth,
                    'field_width'   => $fieldWidth
                ],
                'long_description'  => [
                    'type'          => 'editor',
                    'label'         => 'Long Description',
                    'label_width'   => $labelWidth,
                    'field_width'   => 'col-lg-10 col-md-10 col-sm-8 col-xs-12',
                ],
                'type'            => [
                    'type'          => 'radio',
                    'label'         => 'Type',
                    'label_width'   => $labelWidth,
                    'field_width'   => $fieldWidth,
                    'options'       => ['1' => 'PMs','2'=>'Groups'],
                    'value'         => isset($data->type) ? $data->type : 0,
                ],
                'html'              => [
                    'type'          => 'html',
                    'value'         => '<h4>Seo Section</h4>',
                ],
                'meta_title'        => [
                    'type'          => 'text',
                    'label'         => 'Meta Title',
                    'help'          => 'Maximum 255 characters',
                    'label_width'   => $labelWidth,
                    'field_width'   => $fieldWidth
                ],
                'meta_keyword'      => [
                    'type'          => 'textarea',
                    'label'         => 'Meta Keyword',
                    'help'          => 'Maximum 255 characters',
                    'row_width'     => 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
                    'label_width'   => 'col-lg-12 col-md-12 col-sm-4 col-xs-12',
                    'field_width'   => 'col-lg-12 col-md-12 col-sm-4 col-xs-12',
                    'attributes'    => [
                        'rows'      => 3,
                        'maxlength' => 255,
                    ]
                ],
                'meta_description'  => [
                    'type'          => 'textarea',
                    'label'         => 'Meta Description',
                    'help'          => 'Maximum 255 characters',
                    'row_width'     => 'col-lg-6 col-md-6 col-sm-12 col-xs-12 pl-0',
                    'label_width'   => 'col-lg-12 col-md-12 col-sm-4 col-xs-12',
                    'field_width'   => 'col-lg-12 col-md-12 col-sm-4 col-xs-12',
                    'attributes'    => [
                        'rows'      => 3,
                        'maxlength' => 255,
                    ]
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
        $this->validate($request, [
            'title'            => 'required|max:255',
            'meta_title'       => 'nullable|max:255',
            'meta_keyword'     => 'nullable|max:255',
            'meta_description' => 'nullable|max:255',
        ]);

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
