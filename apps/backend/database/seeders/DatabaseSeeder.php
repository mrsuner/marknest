<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting Marknest database seeding...');

        // Core user data (no dependencies)
        $this->call([
            UserSeeder::class,
        ]);
        $this->command->info('✅ Users seeded');

        // User-related data (depends on users)
        $this->call([
            UserPreferenceSeeder::class,
            SubscriptionSeeder::class,
        ]);
        $this->command->info('✅ User preferences and subscriptions seeded');

        // Payment data (depends on subscriptions)
        $this->call([
            PaymentTransactionSeeder::class,
        ]);
        $this->command->info('✅ Payment transactions seeded');

        // Content structure (depends on users)
        $this->call([
            FolderSeeder::class,
            TemplateSeeder::class,
        ]);
        $this->command->info('✅ Folders and templates seeded');

        // Documents (depends on users and folders)
        $this->call([
            DocumentSeeder::class,
        ]);
        $this->command->info('✅ Documents seeded');

        // Document-related data (depends on documents)
        $this->call([
            DocumentVersionSeeder::class,
            DocumentShareSeeder::class,
            DocumentCollaboratorSeeder::class,
            MediaFileSeeder::class,
            ExportJobSeeder::class,
        ]);
        $this->command->info('✅ Document versions, shares, collaborators, media files, and export jobs seeded');

        // Activity tracking (depends on all entities)
        $this->call([
            UserActivitySeeder::class,
        ]);
        $this->command->info('✅ User activities seeded');

        $this->command->info('🎉 Marknest database seeding completed successfully!');
        $this->command->info('');
        $this->command->info('📊 Seeded data summary:');
        $this->command->info('   • Users with different subscription plans');
        $this->command->info('   • Folders with hierarchical structure');
        $this->command->info('   • Documents with content and versions');
        $this->command->info('   • Sharing links and collaborations');
        $this->command->info('   • Media files and export jobs');
        $this->command->info('   • User activity logs');
        $this->command->info('   • Payment transactions and templates');
        $this->command->info('');
        $this->command->info('🔐 Test accounts:');
        $this->command->info('   • admin@marknest.com (Enterprise plan)');
        $this->command->info('   • test@example.com (Pro plan)');
        $this->command->info('   • demo@example.com (Free plan)');
        $this->command->info('   Password for all: password');
    }
}
