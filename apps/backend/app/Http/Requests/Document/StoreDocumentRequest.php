<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'folder_id' => 'sometimes|nullable|exists:folders,id',
            'tags' => 'sometimes|array',
            'status' => 'sometimes|in:draft,published',
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
            'title.required' => 'Document title is required.',
            'title.max' => 'Document title cannot exceed 255 characters.',
            'folder_id.exists' => 'The selected folder does not exist.',
            'status.in' => 'Document status must be either draft or published.',
        ];
    }
}
