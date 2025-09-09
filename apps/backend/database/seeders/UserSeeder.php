<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@marknest.com',
            'plan' => 'enterprise',
            'storage_limit' => 53687091200, // 50GB
            'document_limit' => 10000,
            'links_limit' => 1000,
            'version_history_days' => 365,
            'can_share_public' => true,
            'can_password_protect' => true,
        ]);

        // Create test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'plan' => 'pro',
            'storage_limit' => 5368709120, // 5GB
            'document_limit' => 1000,
            'links_limit' => 100,
            'version_history_days' => 30,
            'can_share_public' => true,
            'can_password_protect' => true,
        ]);

        // Create demo user
        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'plan' => 'free',
        ]);

        // Create random users with different plans
        User::factory(15)->create();
    }
}
