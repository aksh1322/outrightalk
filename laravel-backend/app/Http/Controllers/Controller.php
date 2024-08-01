<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Artisan;
class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    protected $_module;
    protected $_offset;
    protected $_routePrefix;
    protected $_model;
    protected $_data;
    protected $_user;

    public function __construct($parameters = array())
    {
        $this->_offset      = \Config::get('settings.per_page_record');
        $this->_offset      = $this->_offset ? $this->_offset : 30;
        if(!empty($parameters)) {
            foreach($parameters as $key => $value) {
                $this->$key = $value;
            }
        }
    }

    public function initIndex($uriParams = [], $fullModule = true)
    {
        $this->_data['permission']      = \App\Models\Permission::checkModulePermissions();
        $this->_module                  = str_plural($this->_module);
        if($fullModule) {
            $this->_data['breadcrumb']      = [
                route($this->_routePrefix . '.index', $uriParams) => $this->_module,
            ];
        }
        $this->_data['module']          = "Manage " . $this->_module;
        $this->_data['routePrefix']     = $this->_routePrefix;
    }

    public function initUIGeneration($id = 0, $fullModule = true, $routeParams = [])
    {

        $this->_data['data']        = [];
        $this->_data['moduleName']  = 'Add ' . $this->_module;
        $this->_data['id']          = $id;

        if ($id) {
            if($fullModule) {
               // print_r($this->_model); die;
                $this->_data['data']    = $this->_model->getListing(['id' => $id]);

                $return                 = \App\Helpers\Helper::notValidData($this->_data['data'], $this->_routePrefix . '.index');
                if ($return) {
                    return $return;
                }
            }

            $this->_data['moduleName'] = 'Edit ' . $this->_module;
        } else {
            $this->_data['data'] = $this->_model;
        }

        $this->_data['module']     = str_plural($this->_module) . ' | ' . $this->_data['moduleName'];
        $this->_data['breadcrumb'] = [
            route($this->_routePrefix . '.index', $routeParams) => str_plural($this->_module),
            '#'                                   => $this->_data['moduleName'],
        ];
    }

    public function artisan()
    {
        Artisan::call('make:model LocationCountry');
        Artisan::call('make:model LocationState');
        Artisan::call('make:model LocationCity');
    }
}
