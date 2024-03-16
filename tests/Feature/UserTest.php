<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
