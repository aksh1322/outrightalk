<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\Helper;

use App\Models\LocationCity;

class CityController extends Controller
{
    //


    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        
        $this->_module      = 'City';
        $this->_routePrefix = 'cities';
        $this->_model       = new LocationCity();
    }
    public function index(Request $request)
    {
        $srch_params                = $request->all();
        $srch_params['status']    = 1;   
       // $srch_params['orderBy']    = "location_cities__city_name";   

        $data['list']               = $this->_model->getListing($srch_params);
        $data['list']->makeHidden(['status','created_at']);
        return Helper::rj('Record found', 200, $data);
    }  
}
