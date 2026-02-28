<?php

namespace Tests\Feature\Api;

use App\Enums\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MeControllerTest extends TestCase
{
    use RefreshDatabase;

    // ==================== me() tests ====================

    public function test_me_returns_authenticated_user_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'plan' => Plan::Pro,
            'storage_used' => 5242880,
            'storage_limit' => 524288000,
            'document_count' => 5,
            'document_limit' => 100,
            'links_count' => 3,
            'links_limit' => 50,
            'version_limit' => 100,
            'can_share_public' => true,
            'can_password_protect' => true,
            'password' => Hash::make('password123'),
        ]);

        $response = $this->actingAs($user)->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'plan' => 'pro',
                'storage_used' => 5242880,
                'storage_limit' => 524288000,
                'document_count' => 5,
                'document_limit' => 100,
                'links_count' => 3,
                'links_limit' => 50,
                'version_limit' => 100,
                'can_share_public' => true,
                'can_password_protect' => true,
                'has_password' => true,
            ]);
    }

    public function test_me_returns_user_without_password(): void
    {
        $user = User::factory()->create([
            'plan' => Plan::Free,
            'password' => null,
        ]);

        $response = $this->actingAs($user)->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'plan' => 'free',
                'has_password' => false,
            ]);
    }

    public function test_me_requires_authentication(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }

    // ==================== update() tests ====================

    public function test_update_profile_successfully(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'avatar_url' => null,
            'bio' => null,
            'plan' => Plan::Pro,
        ]);

        $response = $this->actingAs($user)->putJson('/api/me', [
            'name' => 'New Name',
            'avatar_url' => 'https://example.com/avatar.jpg',
            'bio' => 'This is my bio',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'name' => 'New Name',
                'avatar_url' => 'https://example.com/avatar.jpg',
                'bio' => 'This is my bio',
            ]);

        $user->refresh();
        $this->assertEquals('New Name', $user->name);
        $this->assertEquals('https://example.com/avatar.jpg', $user->avatar_url);
        $this->assertEquals('This is my bio', $user->bio);
    }

    public function test_update_profile_partial(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'plan' => Plan::Pro,
        ]);

        $response = $this->actingAs($user)->putJson('/api/me', [
            'name' => 'New Name',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'name' => 'New Name',
            ]);

        $user->refresh();
        $this->assertEquals('New Name', $user->name);
    }

    public function test_update_profile_validates_avatar_url(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->putJson('/api/me', [
            'avatar_url' => 'not-a-valid-url',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['avatar_url']);
    }

    public function test_update_profile_validates_bio_max_length(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->putJson('/api/me', [
            'bio' => str_repeat('a', 501),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['bio']);
    }

    public function test_update_requires_authentication(): void
    {
        $response = $this->putJson('/api/me', [
            'name' => 'New Name',
        ]);

        $response->assertStatus(401);
    }

    // ==================== updatePassword() tests ====================

    public function test_update_password_sets_password_for_user_without_password(): void
    {
        $user = User::factory()->create([
            'password' => null,
        ]);

        $response = $this->actingAs($user)->putJson('/api/me/password', [
            'new_password' => 'newPassword123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Password set successfully.',
            ]);

        $user->refresh();
        $this->assertTrue(Hash::check('newPassword123', $user->password));
    }

    public function test_update_password_updates_password_with_correct_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldPassword123'),
        ]);

        $response = $this->actingAs($user)->putJson('/api/me/password', [
            'current_password' => 'oldPassword123',
            'new_password' => 'newPassword123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Password updated successfully.',
            ]);

        $user->refresh();
        $this->assertTrue(Hash::check('newPassword123', $user->password));
        $this->assertFalse(Hash::check('oldPassword123', $user->password));
    }

    public function test_update_password_fails_when_current_password_missing(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('existingPassword'),
        ]);

        $response = $this->actingAs($user)->putJson('/api/me/password', [
            'new_password' => 'newPassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_update_password_fails_when_current_password_incorrect(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('correctPassword'),
        ]);

        $response = $this->actingAs($user)->putJson('/api/me/password', [
            'current_password' => 'wrongPassword',
            'new_password' => 'newPassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_update_password_requires_minimum_length(): void
    {
        $user = User::factory()->create([
            'password' => null,
        ]);

        $response = $this->actingAs($user)->putJson('/api/me/password', [
            'new_password' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['new_password']);
    }

    public function test_update_password_requires_new_password(): void
    {
        $user = User::factory()->create([
            'password' => null,
        ]);

        $response = $this->actingAs($user)->putJson('/api/me/password', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['new_password']);
    }

    public function test_update_password_requires_authentication(): void
    {
        $response = $this->putJson('/api/me/password', [
            'new_password' => 'newPassword123',
        ]);

        $response->assertStatus(401);
    }
}
