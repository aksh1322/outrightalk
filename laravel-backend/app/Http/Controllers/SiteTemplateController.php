<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SiteTemplate;
use Illuminate\Http\Request;

class SiteTemplateController extends Controller
{
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        
        $this->_module      = 'Template';
        $this->_routePrefix = 'templates';
        $this->_model       = new SiteTemplate();
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $this->initIndex();
        $srch_params                = $request->all();
        $this->_data['data']        = $this->_model->getListing($srch_params, $this->_offset);
        $this->_data['filters']     = $this->_model->getFilters();
        $this->_data['orderBy']     = $this->_model->orderBy;
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
        $data = $this->_model->getListing(['id' => $id]);

        $return = \App\Helpers\Helper::notValidData($data, $this->_routePrefix . '.index');
        if ($return) {
            return $return;
        }

        $data->delete();

        return redirect()->route($this->_routePrefix . '.index')
            ->with('success', 'Record has been deleted successfully!');
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
        $labelWidth     = 'col-lg-2 col-md-2 col-sm-4 col-xs-12';
        $fieldWidth     = 'col-lg-6 col-md-6 col-sm-6 col-xs-12';
        $status         = \App\Helpers\Helper::makeSimpleArray($this->_model->statuses, 'id,name');
        $templateTypes  = \App\Helpers\Helper::makeSimpleArray($this->_model->templateTypes, 'id,name');
        $form = [
            'route'      => $this->_routePrefix . ($id ? '.update' : '.store'),
            'back_route' => route($this->_routePrefix . '.index'),
            'include_scripts' => '<script src="'. asset('administrator/admin-form-plugins/form-controls.js'). '"></script>',
            'fields'     => [
                'template_type'    => [
                    'type'          => 'radio',
                    'label'         => 'Template Type',
                    'options'       => $templateTypes,
                    'value'         => $data->template_type ? $data->template_type : 1,
                    'label_width'   => $labelWidth,
                    'field_width'   => $fieldWidth,
                    'attributes'    => [
                        'width' => 'col-lg-4 col-md-4 col-sm-12 col-xs-12'
                    ]
                ],
                'template_name'     => [
                    'type'          => !$id ? 'text' : 'label',
                    'label'         => 'Template Type',
                    'help'          => 'Maximum 50 characters',
                    'attributes'    => ['required' => true],
                    'value'         => $data->template_name,
                    'label_width'   => $labelWidth,
                    'field_width'   => $fieldWidth
                ],
                'subject'           => [
                    'type'          => 'text',
                    'label'         => 'Email Subject',
                    'help'          => 'Maximum 255 characters',
                    'attributes'    => ['required' => true],
                    'label_width'   => $labelWidth,
                    'field_width'   => $fieldWidth
                ],
                'template_content'  => [
                    'type'          => 'editor',
                    'label'         => 'Email Body',
                    'label_width'   => $labelWidth,
                    'field_width'   => 'col-lg-10 col-md-10 col-sm-8 col-xs-12',
                ],
                'status'            => [
                    'type'          => 'radio',
                    'label'         => 'Status',
                    'options'       => $status,
                    'value'         => isset($data->status) ? $data->status : 1,
                    'label_width'   => $labelWidth,
                    'field_width'   => $fieldWidth
                ],
            ],
        ];

        if ($id) {
            unset($form['fields']['template_type']['help']);
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
        $input = $request->all();
        $validationRules = [
            'subject'          => 'required|max:255',
            'template_content' => 'required',
        ];

        if($input['template_type'] == '2') {
            $validationRules['template_content'] = 'nullable';
        } elseif($input['template_type'] == '3'){
            $validationRules['subject'] = 'nullable|max:255';
        }

        $this->validate($request, $validationRules);

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
