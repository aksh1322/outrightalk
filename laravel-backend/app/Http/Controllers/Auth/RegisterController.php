<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use App\User;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = RouteServiceProvider::HOME;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
       // $this->middleware('guest');
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password'  => User::$passwordValidator,
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\User
     */
    protected function create(array $data)
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
    }

    protected function verifyUser($token = null) {
        $data = \App\Models\User::where('remember_token', $token)->first();
        if ($data) {
            $data->update(['status' => 1, 'verified' => 1, 'remember_token' => null]);
            //setup default settings
            \App\Models\SiteSettingUser::store('sign_in_mode', 1, $data->id);
            \App\Models\SiteSettingUser::store('set_mode_idle', 1, $data->id);
            \App\Models\SiteSettingUser::store('minutes_inactivity', 10, $data->id);
            \App\Models\SiteSettingUser::store('show_timestamp_chat_room', 1, $data->id);
            \App\Models\SiteSettingUser::store('pressing_enter_key', 1, $data->id);
            \App\Models\SiteSettingUser::store('show_room_i_am_in', 1, $data->id);
            \App\Models\SiteSettingUser::store('show_room_i_am_in_options', 2, $data->id);
            \App\Models\SiteSettingUser::store('save_chat_history', 1, $data->id);
            \App\Models\SiteSettingUser::store('share_location', 1, $data->id);
            \App\Models\SiteSettingUser::store('show_banner_ads', 1, $data->id);

            \App\Jobs\CreateSendBirdUserJob::dispatch($data->fresh());

            $response = [
                'success' => true,
                'message' => 'Your account verified successfully.'
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Token is invalid.'
            ];
        }
        return view('verifyaccount', compact('response'));
    }

}
