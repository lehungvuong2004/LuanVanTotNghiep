<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class StrongPassword implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (preg_match('/\s/', $value)) {
            $fail('Mật khẩu không được chứa khoảng trắng.');
            return;
        }

        if (!preg_match('/[A-Z]/', $value)) {
            $fail('Mật khẩu phải chứa ít nhất 1 ký tự in hoa.');
            return;
        }

        if (!preg_match('/[a-z]/', $value)) {
            $fail('Mật khẩu phải chứa ít nhất 1 ký tự in thường.');
            return;
        }

        if (!preg_match('/[0-9]/', $value)) {
            $fail('Mật khẩu phải chứa ít nhất 1 ký tự số.');
            return;
        }
    }
}
