<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class UserRequest extends FormRequest
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
        $idSegment = \App\Helpers\Helper::getUrlSegment($request, 3);
        $this->_id = Request::segment($idSegment);
        $fileValidations = \App\Models\File::$fileValidations['image'];
        $passwordValidators = \App\Models\User::$passwordValidator;

        $validationRules = [
            'first_name' => 'max:100',
            'last_name' => 'nullable|max:100',
            'username' => 'required|max:50|unique:users,username,' . $this->_id . ',id,deleted_at,NULL',
            'email' => 'required|max:255|email|unique:users,email,' . $this->_id . ',id,deleted_at,NULL',
            //            'phone'             => 'required|max:12|unique:users,phone,' . $this->_id . ',id,deleted_at,NULL',
            'phone' => 'max:12',
            'avatar' => 'mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max'],
            'confirm-password' => 'nullable|required_with:password|same:password'
        ];

        if (is_string($this->avatar)) {
            unset($validationRules['avatar']);
        }

        if (!$this->_id) {
            $validationRules['password'] = $passwordValidators;
        } else {
            $passwordValidators = array_diff($passwordValidators, ['required']);
            $passwordValidators[] = 'nullable';
            $validationRules['password'] = $passwordValidators;
        }

        return $validationRules;
    }

    /**
     * [failedValidation [Overriding the event validator for custom error response]]
     * @param  Validator $validator [description]
     * @return [object][object of various validation errors]
     */
    /*public function failedValidation(Validator $validator) { 
        //write your bussiness logic here otherwise it will give same old JSON response
        return \App\Helpers\Helper::rj('Bad Request', 400, [
            'errors' => $validator->errors()
        ]);
         
    }*/

    public function message()
    {
        $validationMessages = [
            'email.unique' => 'This email has already been taken. Try another.',
            'phone.unique' => 'This phone number has already been taken. Try another.',
            'username.unique' => 'This username has already been taken. Try another.',
            'confirm-password.same' => 'The confirm password field should match with password.',
            'role_id.required' => 'The role field is required.',
            'confirm-password.required_with' => 'The confirm password field is required when password is present.',
        ];

        return $validationMessages;
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $userModel = new \App\Models\User();
            $userId = \Auth::user()->id;
            if ($this->role_id) {
                $inputRoleLevel = 0;
                if (is_array($this->role_id)) {
                    $inputRoleLevel = \App\Models\Role::whereIn("id", $this->role_id)
                        ->orderBy('level')
                        ->first()
                        ->level;
                } else {
                    $inputRoleLevel = \App\Models\Role::find($this->role_id)->level;
                }

                $userRoleLevel = $userModel->myRoleMinLevel($userId);
                if ($userRoleLevel > $inputRoleLevel) {
                    $validator->errors()->add('role_id', 'The role is not valid.');
                }
            }

        });

        return;
    }
}
