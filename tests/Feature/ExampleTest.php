<?php

namespace Tests\Feature;

use App\Models\Deck;
use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_room(): void
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->postJson('/room');
        $response->assertStatus(200);
        $response->assertJsonStructure(['room']);

        $room = $response['room'];

        $response = $this->actingAs($user)->get('/room/' . $room);
        $response->assertStatus(200);

        $otherUser = User::factory()->create();

        $deck = Deck::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($otherUser)->postJson('/room/' . $room . '/game', ['deck' => $deck->id]);
        $response->assertStatus(403);

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game', ['deck' => $deck->id]);
        $response->assertStatus(200);

        $game = $response['game'];

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game/' . $game . '/vote', ['value' => 15]);
        $response->assertStatus(403);

        $this->assertDatabaseMissing('votes', ['game_id' => Game::where('uuid', $game)->first()->id]);

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game/' . $game . '/vote', ['value' => 3]);
        $response->assertStatus(200);

        $this->assertDatabaseHas('votes', ['game_id' => Game::where('uuid', $game)->first()->id, 'value' => 3]);
    }
}
