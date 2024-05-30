<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CommaSeparatedMaxLength implements ValidationRule
{
    protected $maxLength;

    public function __construct($maxLength = 3)
    {
        $this->maxLength = $maxLength;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $values = explode(',', $value);
        $i = 0;
        foreach ($values as $val) {
            if (strlen($val) === 0) {
                $fail('The :attribute field contains empty values.');
                return;
            }
            if (strlen($val) > $this->maxLength) {
                $fail('Each value in :attribute must be up to ' . $this->maxLength . ' characters long.');
                return;
            }
            $i++;
        }
        if ($i === 0) {
            $fail('The :attribute field is required.');
        }
    }
}
