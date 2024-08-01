<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class PasswordValidate implements Rule
{
    

    protected $_username;
    protected $_attribute;
    protected $_value;
    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct($username)
    {
       $this->_username = $username;
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
        $this->_attribut = $attribute;
        $this->_value = $value;
        if (strpos($value, ' ') !== false) {
            return false;
        }
        else if (strlen($value) != strlen(utf8_decode($value))){
            return false;
        }
        else if (stripos($this->_value,$this->_username) !== FALSE){
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
        if (strpos($this->_value, ' ') !== false) {
            return "Spaces are not allowed in the password.";
        }
        else if (strlen($this->_value) != strlen(utf8_decode($this->_value))){
            return "Only characters A-Z, a-z, 0-9, and keyboard signs are allowed in a password.";
        }
        // else if (strncmp($this->_value, $this->_username, strlen($this->_username)) === 0) {
        else if (stripos($this->_value,$this->_username) !== FALSE){
            return "For security reasons, choose a password that is not a part of your nickname.";
        }
    }
}
