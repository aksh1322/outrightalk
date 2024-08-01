<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Auth;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;


class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
     */
    protected $maxAttempts=3;
    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo   = '/admin/home/';
    protected $view         = 'admin.login';

    public function __construct()
    {
        $segment = request()->segment(1);
        if($segment != 'admin') {
            $this->redirectTo = '/';
            $this->view = 'auth.login';
        }
    }

    public function showLoginForm()
    {
        if (Auth::user()) {
            return redirect()->intended($this->redirectTo);
        } else {
            return view($this->view);
        }
    }

    /**
     * Handle a login request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        $this->validateLogin($request);

        // If the class is using the ThrottlesLogins trait, we can automatically throttle
        // the login attempts for this application. We'll key this by the username and
        // the IP address of the client making these requests into this application.
        if ($this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
            return $this->sendLockoutResponse($request);
        }

        // Customization: Validate if client status is active (1)
        $email = $request->get($this->username());
        // Customization: It's assumed that email field should be an unique field
        $client = User::where($this->username(), $email)->first();

        // If the login attempt was unsuccessful we will increment the number of attempts
        // to login and redirect the user back to the login form. Of course, when this
        // user surpasses their maximum number of attempts they will get locked out.
        $this->incrementLoginAttempts($request);

        if (empty($client)) {
            return $this->sendFailedLoginResponse($request, 'Please check your email or password.');
        }

        // Customization: If client status is inactive (0) return failed_status error.
        if ($client->status === 0) {
            return $this->sendFailedLoginResponse($request, 'Your Account is blocked. Please conract administrator.');
        }

        if (!$client->verified) {
            return $this->sendFailedLoginResponse($request, 'Account is not verified yet.');
        }

        // Customization: Validate if client status is active (1)
        if ($this->attemptLogin($request)) {
            return $this->sendLoginResponse($request);
        }

        return $this->sendFailedLoginResponse($request);
    }

    /**
     * Get the needed authorization credentials from the request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    protected function credentials(Request $request)
    {
        $credentials = $request->only($this->username(), 'password');
        // Customization: validate if client status is active (1)
        $credentials['status'] = 1;
        return $credentials;
    }

    /**
     * Get the failed login response instance.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $field
     * @return \Illuminate\Http\RedirectResponse
     */
    protected function sendFailedLoginResponse(Request $request, $trans = 'auth.failed')
    {
        $errors = [$this->username() => trans($trans)];

        if ($request->expectsJson()) {
            return response()->json($errors, 422);
        }

        return redirect()->back()
            ->withInput($request->only($this->username(), 'remember'))
            ->withErrors($errors);
    }

    public function adminLogout()
    {
        //Auth::guard('admin')->logout();
        auth()->logout();
        // redirect to homepage
        return redirect('admin/login');

    }

    public function logout()
    {
        auth()->logout();
        // redirect to homepage
        return redirect('/');

    }
}
