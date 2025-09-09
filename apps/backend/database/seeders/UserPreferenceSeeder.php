<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Seeder;

class UserPreferenceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create preferences for all existing users
        User::all()->each(function ($user) {
            UserPreference::factory()->create([
                'user_id' => $user->id,
            ]);
        });

        // Create some specific preference variations
        $adminUser = User::where('email', 'admin@marknest.com')->first();
        if ($adminUser && $adminUser->preferences) {
            $adminUser->preferences->update([
                'theme' => 'dark',
                'editor_theme' => 'monokai',
                'enable_vim_mode' => true,
                'editor_font_size' => 14,
                'default_view' => 'split',
            ]);
        }
    }
}
