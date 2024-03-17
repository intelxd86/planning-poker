<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        parent::tearDown();
        Carbon::setTestNow();
    }

    public function test_create_user(): void
    {
        $this->assertDatabaseEmpty('users');
        $response = $this->postJson('/user/create', [
            'name' => 'test',
            'email' => '',
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password', 'password_confirmation']);

        $response = $this->postJson('/user/create', [
            'name' => '',
            'email' => 'test@example.com'
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'password', 'password_confirmation']);

        $response = $this->postJson('/user/create', [
            'name' => 'test',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'passworld'
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password_confirmation']);

        $response = $this->postJson('/user/create', [
            'name' => 'test',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password'
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure(['user']);

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_login_user(): void
    {
        $user = User::factory()->create([
            'email' => 'test@test.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/user/login', [
            'email' => '',
            'password' => ''
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password']);

        $response = $this->postJson('/user/login', [
            'email' => 'test@test.com',
            'password' => 'password'
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure(['user']);
        $response->assertJson([
            'user' => $user->uuid,
        ]);


        $response = $this->postJson('/user/logout');
        $response->assertStatus(200);
    }
}
