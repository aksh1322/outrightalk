<?php

use App\Http\Middleware\VerifyCsrfToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Webhooks\SendBirdCallWebhookController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::group(['prefix' => 'admin'], function () {
	Auth::routes(['verify' => true]);
});

Route::get('user/verify/{token}', 'Auth\RegisterController@verifyUser');
Route::get('admin', 'Auth\LoginController@showLoginForm')->name('admin.login');

Route::group(['prefix' => 'admin', 'middleware' => 'permission'], function () {
	Route::get('/home', 'DashboardController@index')->name('admin.home');
	Route::get('logout', 'Auth\LoginController@adminLogout')->name('admin.logout');
	Route::get('export/users', 'UserController@export')->name('export.users');
	Route::post('providers/approve', 'ProviderController@approve')->name('providers.approve');

	Route::resources([
		'users'       => 'UserController',
		'roles'       => 'RoleController',
		'contents'    => 'SiteContentController',
		'permissions' => 'PermissionController',
		'settings'    => 'SiteSettingController',
		'providers'   => 'ProviderController',
        'stickercategory'   => 'StickerCategoryController',
        'sub-categories'   => 'RoomSubCategoryController',
        'sticker'     => 'StickerController',
        'digsound'    => 'DigSoundController',
        'badgeLevel'  => 'BadgeLevelController',
        'badge'  => 'BadgeController',
        'subscription'  => 'SubscriptionController',
        'pack'  => 'StickerPackController',
        'virtual'  => 'VirtualCreditController'

	]);
    Route::get('subscription/{id}/price','SubscriptionController@priceIndex')->name('subscription.priceIndex');
    Route::get('subscription/{id}/price/{priceId}','SubscriptionController@priceEdit')->name('subscription.priceEdit');
    Route::post('subscription/{id}/price/priceStore','SubscriptionController@priceStore')->name('subscription.priceStore');
    Route::patch('subscription/{id}/price/priceUpdate','SubscriptionController@priceUpdate')->name('subscription.priceUpdate');


	Route::group(['prefix' => 'master'], function () {
		Route::resource('tests', 'MasterTestController', ['as' => 'master']);
		Route::resource('tests.options', 'MasterTestOptionController', ['as' => 'master']);
		Route::resource('fixedquestions', 'MasterFixedQuestionsController', ['as' => 'master']);
		Route::resource('personaltemplatetypes', 'PersonalTemplateController', ['as' => 'master']);


	});

	Route::group(['prefix' => 'location'], function () {
		Route::resource('countries', 'LocationCountryController', ['as' => 'location']);
		Route::resource('countries.states', 'LocationStateController', ['as' => 'location']);
		Route::resource('countries.states.cities', 'LocationCityController', ['as' => 'location']);
	});

	Route::group(['prefix' => 'permissions'], function () {
		Route::get('manage_role/{id}', 'PermissionController@manageRole')->name('permissions.manage_role');
		Route::patch('assign/{id}', "PermissionController@assignPermission")->name('permissions.assign');
	});

	Route::group(['prefix' => 'setting'], function () {
		Route::post('export', 'SiteSettingController@settingsExport')->name('settings.export');
		Route::post('import', 'SiteSettingController@settingsImport')->name('settings.import');
	});

	Route::group(['prefix' => 'menus'], function () {
		Route::get('/{parent_id?}', 'MenuController@index')->name('menus.index');
		Route::get('create/{parent_id}', 'MenuController@create')->name('menus.create');
		Route::get('edit/{parent_id}/{id}', 'MenuController@edit')->name('menus.edit');
		Route::post('store', 'MenuController@store')->name('menus.store');
		Route::patch('update/{id}', 'MenuController@update')->name('menus.update');
		Route::delete('destroy/{parent_id}/{id}', 'MenuController@destroy')->name('menus.destroy');
	});

	Route::group(['prefix' => 'templates'], function () {
		Route::get('index', 'SiteTemplateController@index')->name('templates.index');
		Route::get('create', 'SiteTemplateController@create')->name('templates.create');
		Route::get('edit/{id}', 'SiteTemplateController@edit')->name('templates.edit');
		Route::post('store', 'SiteTemplateController@store')->name('templates.store');
		Route::patch('update/{id}', 'SiteTemplateController@update')->name('templates.update');
		Route::delete('destroy/{id}', 'SiteTemplateController@destroy')->name('templates.destroy');
	});

	Route::group(['prefix' => 'ui'], function () {
            Route::get('icons', 'SiteSettingController@uiIcons')->name('ui.icons');
	});

        Route::post('get-category-wrt-type', 'StickerCategoryController@getCategory');

});

Auth::routes(['verify' => true]);
Route::get('/', 'HomeController@home')->name('home');
Route::group(['middleware' => 'auth'], function () {
    Route::get('logout', 'Auth\LoginController@logout')->name('logout');
});



Route::post('sendbird-call/webhooks',[SendBirdCallWebhookController::class,'handle'])->withoutMiddleware(VerifyCsrfToken::class);


Route::post('sendbird-chat/webhooks',function(Request $request){
	info("call webhooks",[$request->all()]);
})->withoutMiddleware(VerifyCsrfToken::class);
