<?php

namespace App\Http\Requests;

use App\Rules\CommaSeparatedMaxLength;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateDeckRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                Rule::unique('decks')->where(function ($query) {
                    return $query->where('user_id', request()->user()->id);
                }),
                'string'
            ],
            'cards' => ['required', 'string', new CommaSeparatedMaxLength()],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Deck name is required',
            'cards.required' => 'Please provide deck cards',
            'name.string' => 'Deck name must be a string',
            'cards.string' => 'Deck cards must be a string of comma separated values',
            'is_public.required' => 'Please provide deck accesibility',
        ];
    }
}
