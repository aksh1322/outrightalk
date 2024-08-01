<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class CheckStringNumberSpaceDashUnderScoreValidate implements Rule
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
        if(!preg_match('/^[A-Za-z0-9_~^*|\/ -]+$/', $value)){
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
        return "Only characters A-Z, a-z, 0-9, dash, underscore and space are allowed inside a nickname. Your nickname may include alphabets, dash, underscore and space, decorative characters as well.";
    }
}
