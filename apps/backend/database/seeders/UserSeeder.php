<?php

namespace Database\Seeders;

use App\Enums\Plan;
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
            'plan' => Plan::Max,
            'storage_limit' => 10 * 1024 * 1024 * 1024, // 10GB
            'document_limit' => 1000000,
            'links_limit' => 1000,
            'version_limit' => 100,
            'can_share_public' => true,
            'can_password_protect' => true,
        ]);

        // Create test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'plan' => Plan::Pro,
            'storage_limit' => 1024 * 1024 * 1024, // 1GB
            'document_limit' => 5000,
            'links_limit' => 100,
            'version_limit' => 100,
            'can_share_public' => true,
            'can_password_protect' => true,
        ]);

        // Create demo user
        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'plan' => Plan::Free,
        ]);

        // Create random users with different plans
        User::factory(15)->create();
    }
}
