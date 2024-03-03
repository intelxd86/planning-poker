<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_create_room(): void
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->postJson('/create-room');
        $response->assertStatus(200);
        $response->assertJsonStructure(['room']);
    }
}
