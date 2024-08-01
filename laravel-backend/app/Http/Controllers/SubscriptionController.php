<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPrice;
use Illuminate\Http\Request;
use Stripe\Price;
use Stripe\Subscription;

class SubscriptionController extends Controller
{

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->_module      = 'Subscription'; 
        $this->_routePrefix = 'subscription';
        $this->_model       = new SubscriptionPlan();
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

    public function priceIndex(Request $request,$id){

        $price = new SubscriptionPrice();

        $this->initIndex();
        $this->_data['permisssionState']    = \App\Models\Permission::checkModulePermissions(['index']);
        $srch_params                        = $request->all();
        $srch_params['with']                = ['plan'];
        $srch_params['subscription_id']     = $id;
        $this->_data['data']                = $price->getListing($srch_params, $this->_offset);
        $this->_data['orderBy']             = $price->orderBy;
        $this->_data['filters']             = $price->getFilters();

        return view('admin.' . $this->_routePrefix . '.priceIndex', $this->_data)
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

    public function priceEdit(Request $request, $id , $priceId)
    {

        return $this->__formUiGenerationPrice($request, $id ,$priceId);
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

    public function priceUpdate(Request $request, $id)
    {
        return $this->__formPostPrice($request, $id);
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
    protected function __formUiGenerationPrice(Request $request, $id = '',$priceId = '')
    {

        /*$response = $this->initUIGeneration($priceId);
        echo "<pre>";
        print_r($response);die;
        if($response) {
            return $response;
        }*/

        if(isset($priceId) && isset($id)){

            $srch_params['with'] = ['plan'];
            $srch_params['subscription_id'] = $id;
            $srch_params['id'] = $priceId;
            $price = new SubscriptionPrice();
            $data = $price->getListing($srch_params, $this->_offset);

        }
        /*echo "<pre>";
        print_r($data);die;*/

        // $types = \App\Helpers\Helper::makeSimpleArray($this->_model->types, 'id,name');

        $form = [
            'route'      => $this->_routePrefix . ($id ? '.priceUpdate' : '.priceStore'),
            'back_route' => route($this->_routePrefix . '.priceIndex',$id),
            'fields'     => [
                'price'      => [
                    'type'          => 'number',
                    'label'         => 'Price',
                    'attributes'    => [
                        'step'      => "any",
                        'min'       => 1,
                        'required'  => true
                    ]
                ],
                'virtual_credits'      => [
                    'type'          => 'number',
                    'label'         => 'Virtual Credit',
                    'attributes'    => [
                        'min'       =>   1,
                        'required'  => true
                    ]

                ],
                'free_credits'      => [
                    'type'          => 'number',
                    'label'         => 'Free Credit',
                    'attributes'    => [
                        'min'       =>   0,
                        'required'  => true
                    ]

                ],

                'points' => [
                    'type'          => 'number',
                    'label'         => 'Credit Points',
                    'attributes'    => [
                        'required'  => true,
                        'min' => 1
                    ]
                ],

            /*'pid' => [
                    'type'          => 'select',
                    'label'         => 'Select Category',
                    'options'       => $p_categories->toArray(),
                    'attributes' => [
                        'id' => 'select-p_id',
                        //'required' => true,
                    ],
                    'value' => isset($data) ? $data->pid : []
                ],*/

                /*'plan_type' => [
                    'type'          => 'select',
                    'label'         => 'Subscription Type',
                    'options'       => ['Monthly'=>'Monthly', 'Weekly'=>'Weekly'],
                    'attributes' => [
                        'id' => 'select-p_id',
                        //'required' => true,
                    ],
                    'value' =>['monthly','weekly']
                ],*/



            ],
        ];

        $id = $priceId;
        $breadcrumb = [];
        $module = str_plural('Subscription Price') . ' | ' . 'Edit';

        return view('admin.components.admin-form', compact('data', 'id', 'form', 'breadcrumb', 'module'));
    }


    protected function __formUiGeneration(Request $request, $id = '')
    {
        $response = $this->initUIGeneration($id);
        if($response) {
            return $response;
        }



        extract($this->_data);


        $types = \App\Helpers\Helper::makeSimpleArray($this->_model->types, 'id,name');


        $form = [
            'route'      => $this->_routePrefix . ($id ? '.update' : '.store'),
            'back_route' => route($this->_routePrefix . '.index'),
            'fields'     => [
                'type' => [
                    'type'          => 'select',
                    'label'         => 'Type',
                    'options'       => $types,
                    'attributes' => [
                        'id' => 'select-type',
                        // 'required' => true,
                        'disabled' => true
                    ],
                    'value' => isset($data) ? $data->type : [],
                ],
                'title'      => [
                    'type'          => 'text',
                    'label'         => 'Subscription Title',
                    'attributes'    => [
                        'max'       => 20,
                        'readonly'  => true
                    ]
                ],
                'image' => [
                    'type'       => 'file',
                    'label'      => 'Icon',
                    'value'      => isset($data->icon_pic) ? $data->icon_pic : [],
                    'attributes' => [
                        // 'required'       => true,
                        /*'cropper' => true,
                        'ratio'   => '50x50',*/
                    ],
                    'help' => 'The image must be a file of type: .png, .gif.  The image may not be greater than 200 kilobytes.'
                ],
                // code added by devvrat 10-dec-2022
                /*'points'      => [
                    'type'          => 'number',
                    'label'         => 'Points',
                    'attributes'    => [
                        'required'  => true,
                        'min' => 1
                    ]
                ],*/
                // code ended by devvrat
            ],
        ];
        // if (isset($data) && $data->type != 'room') {
        //     $form['fields']['points'] = [
        //         'type'          => 'number',
        //         'label'         => 'Credit Points',
        //         'attributes'    => [
        //             'required'  => true,
        //             'min' => 1
        //         ]
        //     ];

        //     // 'pid' => [
        //     //         'type'          => 'select',
        //     //         'label'         => 'Select Category',
        //     //         'options'       => $p_categories->toArray(),
        //     //         'attributes' => [
        //     //             'id' => 'select-p_id',
        //     //             //'required' => true,
        //     //         ],
        //     //         'value' => isset($data) ? $data->pid : []
        //     //     ],

        //     $form['fields']['plan_type'] = [
        //             'type'          => 'select',
        //             'label'         => 'Subscription Type',
        //             'options'       => ['Monthly'=>'Monthly', 'Weekly'=>'Weekly'],
        //             'attributes' => [
        //                 'id' => 'select-p_id',
        //                 //'required' => true,
        //             ],
        //             'value' =>['monthly','weekly']
        //     ];
        // }

        if (isset($data) && $data->type == 'room') {
            $form['fields']['room_capacity'] = [
                'type'          => 'number',
                'label'         => 'Room Capacity',
                'attributes'    => [
                    'required'       => true,
                    'min' => 0
                ],
                'help' => 'Add 0 for unlimited'
            ];
            $form['fields']['ban_limit'] = [
                'type'          => 'number',
                'label'         => 'Ban Limit',
                'attributes'    => [
                    'required'       => true,
                    'min' => 0
                ],
                'help' => 'Add 0 for unlimited'
            ];
        }
        // if (isset($data) && $data->icon_pic) {
        //     $form['fields']['width'] = [
        //         'type'          => 'number',
        //             'label'         => 'Icon Width',
        //             'attributes'    => [
        //                 'required'       => true,
        //                 'min' => 1
        //             ]
        //     ];
        //     $form['fields']['height'] = [
        //         'type'          => 'number',
        //             'label'         => 'Icon Height',
        //             'attributes'    => [
        //                 'required'       => true,
        //                 'min' => 1
        //             ]
        //     ];
        //     unset($form['fields']['image']['attributes']['required']);
        // }
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
        /*echo "<pre>";
        print_r($request->all());
        die;*/
        $fileValidations = \App\Models\File::$fileValidations['sticker'];
        $validationRules = [
            'title' => 'nullable|max:20',
            //'points' => 'required',
            'image' => 'mimes:'. $fileValidations['mime'] . '|max:' . $fileValidations['max'],
        ];

//      $file = $request->file('image');
//      dd($file->getMimeType());
        $validator = \Validator::make($request->all(), $validationRules);
        if ($validator->fails()) {
            return redirect()->back()->with('error', $validator->errors());
        }

        // code added by devvrat  10-dec-2022 
        /*if($request->points > 0 && $request->plan_type){
            $subs_plan = SubscriptionPlan::where('id',$id)->first();
            $subs_plan->points = $request->points;
            $subs_plan->plan_type = $request->plan_type;
            $subs_plan->save();
        }*/
        // end by devvrat
        $input      = $request->all();
        $response   = $this->_model->store($input, $id, $request);

        if($response['status'] == 200){
            return redirect()->route($this->_routePrefix . '.index')->with('success',  $response['message']);
        } else {
            return redirect()->route($this->_routePrefix . '.index')->with('error', $response['message']);
        }
    }

    protected function __formPostPrice(Request $request, $id = '')
    {
        $fileValidations = \App\Models\File::$fileValidations['sticker'];
        $validationRules = [
            'price' => 'min:1|required',
            'free_credits' => 'min:0|required',
            'virtual_credits' => 'min:1|required',
        ];

//      $file = $request->file('image');
//      dd($file->getMimeType());
        $validator = \Validator::make($request->all(), $validationRules);
        if ($validator->fails()) {
            return redirect()->back()->with('error', $validator->errors());
        }
        
        // if($request->points){
        //     $subprice = SubscriptionPrice::where('id',$id)->first();
        //     $subprice->points = $request->points;
        //     $subprice->save();
        // }


        $price = new SubscriptionPrice();
        $input      = $request->all();
        $response   = $price->store($input, $id, $request);

        if($response['status'] == 200){
            return redirect()->route($this->_routePrefix . '.index')->with('success',  $response['message']);
        } else {
            return redirect()->route($this->_routePrefix . '.index')->with('error', $response['message']);
        }
    }
}
