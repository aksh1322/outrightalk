<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class NoOfFilteredWord implements Rule
{
    protected $room_type_id;
    protected $filter_words;
    protected $_attribute;


    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct($room_type_id, $filter_words, $is_comma_separated = 0)
    {
        $this->room_type_id = $room_type_id;
        $this->filter_words = $filter_words;
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
        $this->_attribute = $attribute;
        if ($value && $this->filter_words) {
            $no_of_words = count(array_map('trim', explode(',', $this->filter_words)));
            if ($this->room_type_id == 1) {
                return $no_of_words <= \Config::get('settings.no_filter_words_public');
            } else if ($this->room_type_id == 2) {
                return $no_of_words <= \Config::get('settings.no_filter_words_private');
            }
        } else {
            return $value <= $this->room_type_id;
        }
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        if ($this->room_type_id == 1) {
            return 'Maximum '. \Config::get('settings.no_filter_words_public') .' words are allowed for free rooms.';
        }  else if ($this->room_type_id == 2) {
            return 'Maximum '. \Config::get('settings.no_filter_words_private') .' words are allowed for features rooms.';
        }
    }
}
