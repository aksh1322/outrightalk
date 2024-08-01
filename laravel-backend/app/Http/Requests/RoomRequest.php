<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;

class RoomRequest extends FormRequest
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
        $idSegment = \App\Helpers\Helper::getUrlSegment($request, 4);
        $this->_id = Request::segment($idSegment);
        $room_id = ($this->_id) ? (int) $this->_id : 0;
        $fileValidations = \App\Models\File::$fileValidations['image'];
        if (isset($request->room_type_id) && $request->room_type_id == 1) {
            $validationRules = [
                'room_name' => [
                    'required',
                    'min:5',
                    'max:50',
                    'string',
                    'unique:rooms,room_name,' . $room_id . ',id,deleted_at,NULL',
                    new \App\Rules\CheckBeforeSpaceDashUnderScoreValidate('Room name cannot start with space, dash or underscore.'),
                    new \App\Rules\CheckConsecutiveConnectingCharactersValidate(),
                    new \App\Rules\CheckReserveWordValidate('roomname', 'Sorry, you cannot create this room name because it contains reserved word(s). Try another room name please.', ' '),
                    new \App\Rules\CheckOffensiveValidate(),
                ],
                'room_type_id' => 'required',
                'group_id' => 'required',
                'room_category_id' => 'required',
                'welcome_message' => [
                    'nullable',
                    'max:300',
                    new \App\Rules\CheckReserveWordValidate('welcomemsg', 'Sorry, your welcome message cannot contain reserved words or expression(s) restricted by word filter. Please try again!', ' ')
                ],
                'text_enabled' => 'required',
                'video_enabled' => 'required',
                'voice_enabled' => 'required',
                'locked_room' => 'required',
                'lockword' => 'nullable|min:4|max:16',
                'admin_code' => 'required|min:6|max:12',
                'room_password' => [
                    'required',
                    'min:6',
                    'max:16'
                ],
                'post_url' => 'required',
                'filter_words' => 'nullable',
                'is_comma_separated' => ['required', new \App\Rules\NoOfFilteredWord($request->room_type_id, $request->filter_words)],
                'room_pic' => 'nullable|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max']
            ];

            if ($this->_id) {
                $validationRules['room_password'] = 'nullable|min:6|max:16';
            }
        } else {
            $validationRules = [
                'room_name' => [
                    'required',
                    'min:5',
                    'max:50',
                    'string',
                    'unique:rooms,room_name,' . $room_id . ',id,deleted_at,NULL',
                    new \App\Rules\CheckBeforeSpaceDashUnderScoreValidate('Room name cannot start with space, dash or underscore.'),
                    new \App\Rules\CheckConsecutiveConnectingCharactersValidate(),
                    new \App\Rules\CheckReserveWordValidate('roomname', 'Sorry, you cannot create this room name because it contains reserved word(s). Try another room name please.', ' '),
                    new \App\Rules\CheckOffensiveValidate(),
                ],
                'room_type_id' => 'required',
                'welcome_message' => 'nullable|max:300',
                'text_enabled' => 'required',
                'video_enabled' => 'required',
                'voice_enabled' => 'required',
                'locked_room' => 'required',
                'members' => 'array|min:1|required',
                'members.*' => 'required',
                'room_pic' => 'nullable|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max']
            ];
        }
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
        $validationMessages = [
            'room_name.unique' => 'The entered room name is already taken. Please try another name.',
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
