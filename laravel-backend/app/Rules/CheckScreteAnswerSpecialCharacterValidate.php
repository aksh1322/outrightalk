<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class CheckScreteAnswerSpecialCharacterValidate implements Rule
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
        $first_char =  substr($value,0,1);
        //dd($first_char);
        if(preg_match('/[-@#$%^]+/', $value)){
            return false;
        }
        else if (strlen($value) != strlen(utf8_decode($value))){
            return false;
        }
        else if(in_array($first_char,['!','@','_','!','-','#','$','%','^','&','*','(',')','<','>','?','/','|','}','{','~',':'])){
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
        return "Invalid secret answer. Your secret answer cannot start with any special characters and you must not use the following characters in between - @,#,$,%,^. Unicode characters are also not allowed.";
    }
}
