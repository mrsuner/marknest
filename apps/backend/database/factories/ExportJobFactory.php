<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExportJob>
 */
class ExportJobFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(['pending', 'processing', 'completed', 'failed']);
        $format = fake()->randomElement(['pdf', 'docx', 'html', 'epub', 'latex']);

        return [
            'user_id' => User::factory(),
            'document_id' => Document::factory(),
            'job_id' => (string) Str::uuid(),
            'format' => $format,
            'status' => $status,
            'options' => $this->getExportOptions($format),
            'file_path' => $status === 'completed' ? fake()->filePath() : null,
            'download_url' => $status === 'completed' ? fake()->url() : null,
            'file_size' => $status === 'completed' ? fake()->numberBetween(1000, 5000000) : null,
            'error_message' => $status === 'failed' ? fake()->sentence() : null,
            'progress' => $status === 'completed' ? 100 : fake()->numberBetween(0, 99),
            'started_at' => fake()->dateTimeBetween('-1 week', 'now'),
            'completed_at' => $status === 'completed' ? fake()->dateTimeBetween('-1 week', 'now') : null,
            'expires_at' => $status === 'completed' ? fake()->dateTimeBetween('now', '+1 month') : null,
        ];
    }

    private function getExportOptions(string $format): array
    {
        return match ($format) {
            'pdf' => [
                'margin' => '1in',
                'font_size' => '12pt',
                'page_size' => 'A4',
            ],
            'docx' => [
                'style' => 'default',
                'font' => 'Times New Roman',
            ],
            'html' => [
                'theme' => 'github',
                'include_css' => true,
            ],
            default => [],
        };
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'progress' => 100,
            'completed_at' => now(),
            'file_path' => fake()->filePath(),
            'download_url' => fake()->url(),
            'file_size' => fake()->numberBetween(1000, 5000000),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'error_message' => fake()->sentence(),
            'completed_at' => now(),
        ]);
    }
}
