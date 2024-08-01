<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class CheckBeforeSpaceDashUnderScoreValidate implements Rule
{
    
    protected $_message;

    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct($message)
    {
        $this->_message = $message;
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
        $str = substr($value,0,1);
        //dd($value,$str);
        if(in_array($str,[' ','_','-'])){
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
        return $this->_message;
    }
}
