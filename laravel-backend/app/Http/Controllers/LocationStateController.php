<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\LocationState;

class LocationStateController extends Controller
{
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        
        $this->_module      = 'State';
        $this->_routePrefix = 'location.countries.states';
        $this->_model       = new LocationState();
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $country = 0)
    {
        $this->initIndex([], false);
        $this->_data['permisssionCity'] = \App\Models\Permission::checkModulePermissions(['index'], 'LocationCityController');
        $srch_params                = $request->all();
        if($country) {
            $srch_params['country_id'] = $country;
        }
        $this->_data['data']        = $this->_model->getListing($srch_params, $this->_offset);
        $this->_data['orderBy']     = $this->_model->orderBy;
        $this->_data['filters']     = $this->_model->getFilters($country);
        $this->_data['country']     = $country;
        $this->__routeParams($country);

        $this->_data['breadcrumb'] = [
            route('location.countries.index')   => "Countries",
            '#'                                 => $this->_module,
        ];
        return view('admin.' . $this->_routePrefix . '.index', $this->_data)
            ->with('i', ($request->input('page', 1) - 1) * $this->_offset);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request, $country = 0)
    {
        return $this->__formUiGeneration($request, $country);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $country = 0)
    {
        return $this->__formPost($request, $country);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($country = 0, $id)
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
    public function edit(Request $request, $country = 0, $id)
    {
        return $this->__formUiGeneration($request, $country, $id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $country = 0, $id)
    {
        return $this->__formPost($request, $country, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($country = 0, $id)
    {
        $response = $this->_model->remove($id);
        $this->__routeParams($country);

        if($response['status'] == 200) {
            return redirect()
                ->route($this->_routePrefix . '.index', $this->_data['routeParams'])
                ->with('success', $response['message']);
        } else {
            return redirect()
                    ->route($this->_routePrefix . '.index', $this->_data['routeParams'])
                    ->with('error', $response['message']);
        }
    }

    /**
     * ui parameters for form add and edit
     *
     * @param  string $id [description]
     * @return [type]     [description]
     */
    protected function __formUiGeneration(Request $request, $country = 0, $id = '')
    {
        $this->__routeParams($country);
        $response = $this->initUIGeneration($id, true, $this->_data['routeParams']);
        if($response) {
            return $response;
        }

        extract($this->_data);

        $breadcrumb = [
            route('location.countries.index')                                   => "Countries",
            route('location.countries.states.index', ['country' => $country])   => "States",
            '#'                                                                 => $moduleName,
        ];
        $countryModel   = new \App\Models\LocationCountry;
        $countries      = $countryModel->getListing()->pluck('country_name', 'id');
        $status         = \App\Helpers\Helper::makeSimpleArray($this->_model->statuses, 'id,name');
        $form = [
            'route'         => $this->_routePrefix . ($id ? '.update' : '.store'),
            'back_route'    => route($this->_routePrefix . '.index', $this->_data['routeParams']),
            'route_param'   => $this->_data['routeParams'],
            'fields'     => [
                'country_id'      => [
                    'type'          => 'select',
                    'label'         => 'Country',
                    'options'       => $countries,
                    'value'         => isset($data->country_id) ? $data->country_id : $country,
                    'attributes'    => [
                        'required'  => true
                    ]
                ],
                'state_name'      => [
                    'type'          => 'text',
                    'label'         => 'State name',
                    'attributes'    => [
                        'required'  => true
                    ]
                ],
                'state_code'        => [
                    'type'          => 'text',
                    'label'         => 'State code',
                    'attributes'    => [
                        'max'       => 5,
                        'required'  => true
                    ]
                ],
                'timezone'      => [
                    'type'          => 'text',
                    'label'         => 'Timezone',
                    'attributes'    => [
                        'required'  => true
                    ],
                    'help'          => 'Maximum 50 characters'
                ],
                'status'            => [
                    'type'          => 'radio',
                    'label'         => 'Status',
                    'options'       => $status,
                    'value'         => isset($data->status) ? $data->status : 1,
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
    protected function __formPost(Request $request, $country = 0, $id = '')
    {
        $validationRules = [
            'country_id'            => 'required',
            'state_code'            => 'required|max:5',
            'state_name'            => 'required|max:255',
            'timezone'              => 'required|max:50'
        ];

        $this->validate($request, $validationRules);

        $input      = $request->all();
        $response   = $this->_model->store($input, $id, $request);
        $this->__routeParams($country);
        if($response['status'] == 200){
            return redirect()
                ->route($this->_routePrefix . '.index', $this->_data['routeParams'])
                ->with('success',  $response['message']);
        } else {
            return redirect()
                    ->route($this->_routePrefix . '.index', $this->_data['routeParams'])
                    ->with('error', $response['message']);
        }
    }

    protected function __routeParams($country = 0) {
        $this->_data['routeParams'] = [
            'country' => $country
        ];
    }
}
