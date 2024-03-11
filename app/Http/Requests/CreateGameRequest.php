<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateGameRequest extends FormRequest
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
            'deck' => ['required', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'deck.required' => 'Deck id is required',
            'deck.integer' => 'Please provide deck id',
        ];
    }
}
