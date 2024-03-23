<?php

namespace Tests\Feature;

use App\Models\Deck;
use App\Models\Game;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        parent::tearDown();
        Carbon::setTestNow();
    }

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

        $response = $this->actingAs($otherUser)->postJson('/room/' . $room . '/game', ['deck' => $deck->uuid]);
        $response->assertStatus(403);

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game', ['deck' => $deck->uuid]);
        $response->assertStatus(200);

        $game = $response['game'];

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game/' . $game . '/vote', ['value' => 15]);
        $response->assertStatus(403);

        $this->assertDatabaseMissing('votes', ['game_id' => Game::where('uuid', $game)->first()->id]);

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game/' . $game . '/vote', ['value' => 3]);
        $response->assertStatus(200);

        $this->assertDatabaseHas('votes', ['game_id' => Game::where('uuid', $game)->first()->id, 'value' => 3]);

        $response = $this->actingAs($user)->get('/room/' . $room . '/game/' . $game);
        $response->assertStatus(200);
        $response->assertExactJson([
            'voted' => [User::where('id', $user->id)->first()->uuid],
            'spectators' => [],
            'ended' => false,
            'reveal' => false
        ]);

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game/' . $game . '/reveal');
        $response->assertStatus(403);

        $response = $this->actingAs($otherUser)->postJson('/room/' . $room . '/game/' . $game . '/vote', ['value' => 5]);
        $response->assertStatus(200);

        $response = $this->actingAs($otherUser)->get('/room/' . $room . '/game/' . $game);
        $response->assertStatus(200);
        $response->assertExactJson([
            'voted' => [User::where('id', $user->id)->first()->uuid, User::where('id', $otherUser->id)->first()->uuid],
            'spectators' => [],
            'ended' => false,
            'reveal' => false
        ]);

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game/' . $game . '/end');
        $response->assertStatus(200);

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game/' . $game . '/reveal');
        $response->assertStatus(403);

        Carbon::setTestNow(Carbon::now()->addSeconds(5));

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game/' . $game . '/reveal');
        $response->assertStatus(200);
        $response->assertExactJson([
            'votes' => [
                ['value' => 3, 'user' => User::where('id', $user->id)->first()->uuid],
                ['value' => 5, 'user' => User::where('id', $otherUser->id)->first()->uuid]
            ],
            'average' => 4,
            'median' => 4,
            'min' => 3,
            'max' => 5
        ]);
    }

    public function test_spectator()
    {
        $this->assertDatabaseEmpty('spectators');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/room');

        $room = $response['room'];

        $response = $this->actingAs($user)->post('/room/' . $room . '/spectator');
        $response->assertStatus(200);

        $this->assertDatabaseHas('spectators', ['room_id' => Room::where('uuid', $room)->first()->id, 'user_id' => $user->id]);

        $deck = Deck::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game', ['deck' => $deck->uuid]);
        $response->assertStatus(200);

        $game = $response['game'];

        $response = $this->actingAs($user)->get('/room/' . $room . '/game/' . $game);
        $response->assertStatus(200);
        $response->assertExactJson([
            'voted' => [],
            'spectators' => [ User::where('id', $user->id)->first()->uuid ],
            'ended' => false,
            'reveal' => false
        ]);

        $response = $this->actingAs($user)->post('/room/' . $room . '/spectator');
        $response->assertStatus(403);

        $response = $this->actingAs($user)->delete('/room/' . $room . '/spectator');
        $response->assertStatus(200);

        $this->assertDatabaseMissing('spectators', ['room_id' => Room::where('uuid', $room)->first()->id, 'user_id' => $user->id]);
        $this->assertDatabaseEmpty('spectators');

        $response = $this->actingAs($user)->delete('/room/' . $room . '/spectator');
        $response->assertStatus(403);
    }

    public function test_input_validation(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/room');

        $room = $response['room'];

        $response = $this->actingAs($user)->postJson('/deck', ['name' => '', 'cards' => '']);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
        $response->assertJson(['errors' => ['name' => ['Deck name is required']]]);
        $response->assertJsonValidationErrors(['cards']);
        $response->assertJson(['errors' => ['cards' => ['Please provide deck cards']]]);

        $response = $this->actingAs($user)->postJson('/deck', ['name' => 1, 'cards' => 1]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
        $response->assertJson(['errors' => ['name' => ['Deck name must be a string']]]);
        $response->assertJsonValidationErrors(['cards']);
        $response->assertJson(['errors' => ['cards' => ['Deck cards must be a string of comma separated values']]]);

        $response = $this->actingAs($user)->postJson('/deck', ['name' => 'fibo', 'cards' => '1,2,3,4,5']);
        $response->assertStatus(200);

        $deck = $response['deck'];

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game');
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['deck']);
        $response->assertJson(['errors' => ['deck' => ['Deck UUID is required']]]);

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game', ['deck' => 'a']);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['deck']);
        $response->assertJson(['errors' => ['deck' => ['Please provide deck UUID']]]);

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game', ['deck' => $deck]);
        $response->assertStatus(200);

        $game = $response['game'];

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game/' . $game . '/vote');
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['value']);
        $response->assertJson(['errors' => ['value' => ['Vote value is required']]]);

        $response = $this->actingAs($user)->postJson('/room/' . $room . '/game/' . $game . '/vote', ['value' => 'a']);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['value']);
        $response->assertJson(['errors' => ['value' => ['Vote value must be an integer']]]);
    }
}
