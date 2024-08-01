<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest
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
			'nickname' => 'required',
			'password' => 'required',
			'device_type' => 'required',
			'device_token' => 'required'
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
			'errors' => $validator->errors()
		]);

	}

	public function messages()
	{
		$validationMessages = [];

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
