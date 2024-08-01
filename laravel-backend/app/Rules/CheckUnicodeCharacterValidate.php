<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class CheckUnicodeCharacterValidate implements Rule
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
        if (strlen($value) != strlen(utf8_decode($value))){
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
        return "Nicknames cannot contain any Unicode character anywhere.";
    }
}
