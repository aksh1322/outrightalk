<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class CheckOffensiveValidate implements Rule
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
        $usernames = \App\Models\User::select("username")    
                ->get()
                ->toArray();
        $usernames = \App\Helpers\Helper::makeSimpleArray($usernames, 'username', true);
        $contains = \Str::contains($value, $usernames);
        if ($contains)
            return false;
        return true;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return "Room´s name may not be offensive in any way. Threatening, harassing, or humiliating any user of OutrighTalk will prevent owners to use its services.";
    }
}
