<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class CheckConsecutiveDashSpaceValidate implements Rule
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
        if (strpos($value, '--') !== false) {
           return false;
        }
        else if (strpos($value, '  ') !== false) {
            return false;
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
        return "More than 1 consecutive dash or space are not allowed in the Nickname.";
    }
}
