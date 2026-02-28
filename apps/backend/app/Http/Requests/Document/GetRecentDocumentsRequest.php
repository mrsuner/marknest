<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class GetRecentDocumentsRequest extends FormRequest
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
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'search' => 'sometimes|string|max:255',
            'sort_by' => 'sometimes|in:updated_at,title,word_count,created_at',
            'sort_direction' => 'sometimes|in:asc,desc',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'page.min' => 'Page number must be at least 1.',
            'per_page.min' => 'Items per page must be at least 1.',
            'per_page.max' => 'Items per page cannot exceed 100.',
            'search.max' => 'Search query cannot exceed 255 characters.',
            'sort_by.in' => 'Sort field must be one of: updated_at, title, word_count, created_at.',
            'sort_direction.in' => 'Sort direction must be either asc or desc.',
        ];
    }
}
