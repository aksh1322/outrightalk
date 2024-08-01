<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class CheckConsecutiveConnectingCharactersValidate implements Rule
{
    


    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct()
    {
       
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $length = strlen($value);
        $pieces = [];
        for ($i = 0; $i < $length - 2; $i++) {
            $piece = substr($value, $i, 3);
            if (array_key_exists($piece, $pieces)) {
                return false;
            } else {
                $pieces[$piece] = 1;
            }
        }
        return true;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return "Consecutive connecting characters are not allowed in room name.";
    }
}
