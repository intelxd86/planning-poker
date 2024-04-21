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
            'deck' => ['required', 'uuid'],
            'name' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'deck.required' => 'Deck UUID is required',
            'deck.uuid' => 'Please provide deck UUID',
        ];
    }
}
