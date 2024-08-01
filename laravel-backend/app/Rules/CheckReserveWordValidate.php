<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class CheckReserveWordValidate implements Rule
{
    
    protected $_reserve_words_type;
    protected $_message;
    protected $_exlode_by;
    protected $_attribute;

    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct($reserve_words_type,$message,$exlode_by)
    {
        $this->_reserve_words_type = $reserve_words_type;
        $this->_message = $message;
        $this->_exlode_by = $exlode_by;
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
        $words = \App\Models\ReservedWord::whereNull('deleted_at')->where('type', $this->_reserve_words_type)->first();
        $result = true;
        $values = explode($this->_exlode_by,$value);
        if($words && $words->words && count($values)){
            $wordsArr = explode(',',strtolower($words->words));
            foreach($values as $val){
                $val = strtolower($val);
                if (in_array($val,$wordsArr)) {
                    $result = false;
                    break;
                }
            }
        }        
        return $result;
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
