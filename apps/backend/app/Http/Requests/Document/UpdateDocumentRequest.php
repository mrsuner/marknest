<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentRequest extends FormRequest
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
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'folder_id' => 'sometimes|nullable|exists:folders,id',
            'tags' => 'sometimes|array',
            'tags.*' => 'ulid|exists:tags,id',
            'status' => 'sometimes|in:draft,published',
            'is_auto_save' => 'sometimes|boolean',
            'change_summary' => 'sometimes|string|max:500',
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
            'title.max' => 'Document title cannot exceed 255 characters.',
            'folder_id.exists' => 'The selected folder does not exist.',
            'status.in' => 'Document status must be either draft or published.',
            'change_summary.max' => 'Change summary cannot exceed 500 characters.',
        ];
    }
}
