<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    private $_id;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(Request $request)
    {
        $validationRules = [
            'nickname' => [
                'required',
                'max:255',
                'unique:users,username,0,id,deleted_at,NULL',
                'string'
            ],
            'password' => [
                'required',
                'min:8',
                'max:16',
                'regex:/[a-z]/',        // must contain at least one lowercase letter
                'regex:/[A-Z]/',        // must contain at least one uppercase letter
                'regex:/[0-9]/',        // must contain at least one digit
                'regex:/[@$!%*#?&]/',
                new \App\Rules\PasswordValidate($request->nickname)   // must contain a special character
            ],
            'confirm_password' => 'required|same:password',
            'dob' => 'required',
            'dob_visible' => 'required',
            'gender' => 'required',
            'gender_visible' => 'required',
            'country' => 'required',
            'country_visible' => 'required',
            'state' => 'required',
            'state_visible' => 'required',
            'email' => [
                'required',
                'email',
                'max:255',
                new \App\Rules\CheckReserveWordValidate('email', 'Sorry, your e-mail can not contain reserved words or expression(s) restricted by word filter.', '@')
            ],
            'email_visible' => 'required',
            'confirm_email' => 'required|email|same:email',
            'about' => [
                new \App\Rules\CheckReserveWordValidate('about', 'Sorry, the about information can not contain reserved words or expression(s) restricted by word filter. Please try again.', ' ')
            ],
            'about_visible' => 'required'

        ];

        return $validationRules;
    }

    /**
     * [failedValidation [Overriding the event validator for custom error response]]
     * @param  Validator $validator [description]
     * @return [object][object of various validation errors]
     */
    public function failedValidation(Validator $validator)
    {
        //write your bussiness logic here otherwise it will give same old JSON response
        return \App\Helpers\Helper::rj('Bad Request', 400, [
            'errors' => $validator->errors()->first()
        ]);

    }

    public function messages()
    {
        $validationMessages = [
            'password.regex' => 'Password must contain at least one lowercase letter, one uppercase letter, one digit and a special character(@$!%*#?&).',
            'dob.required' => 'The date of birth field is required.',
            'confirm_email.same' => 'E-mail and Confirm E-mail do not match.',
            'country.required' => 'You must choose your country.',
            'gender.required' => 'You must choose your gender.',
            'password.min' => 'Your password must not be less than 8 characters.',
            'password.max' => 'Your password must not exceed 16 characters.',
            'confirm_password.same' => 'Password and Confirm Password do not match.'
        ];

        return $validationMessages;
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->captcha) {
                $captcha = \App\CaptchaToken::validate(request(), $this->captcha);
                if (!$captcha) {
                    $validator->errors()->add('captcha', 'The captcha is invalid.');
                }
            }
        });

        return;
    }
}
