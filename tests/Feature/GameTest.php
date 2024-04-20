<?php

namespace Tests\Feature;

use App\Events\GameEndEvent;
use App\Events\NewGameEvent;
use App\Events\UserSpectatorEvent;
use App\Events\VoteEvent;
use App\Models\Deck;
use App\Models\Game;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
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
        Event::fake();

        $user = User::factory()->create();
        $response = $this->actingAs($user)->postJson('/api/room', ['name' => 'room']);
        $response->assertStatus(200);
        $response->assertJsonStructure(['room']);

        $room = $response['room'];

        $response = $this->actingAs($user)->getJson('/api/room/' . $room);
        $response->assertStatus(200);

        $otherUser = User::factory()->create();

        $deck = Deck::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($otherUser)->postJson('/api/room/' . $room . '/game', ['deck' => $deck->uuid]);
        Event::assertNotDispatched(NewGameEvent::class);
        $response->assertStatus(403);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game', ['deck' => $deck->uuid]);
        Event::assertDispatched(function (NewGameEvent $event) use ($room) {
            return $event->room->uuid === $room;
        });
        $response->assertStatus(200);

        $game = $response['game'];

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/vote', ['value' => 15]);
        Event::assertNotDispatched(VoteEvent::class);
        $response->assertStatus(403);

        $this->assertDatabaseMissing('votes', ['game_id' => Game::where('uuid', $game)->first()->id]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/vote', ['value' => 3]);
        Event::assertDispatched(function (VoteEvent $event) use ($game, $user) {
            return $event->game->uuid === $game &&
                $event->user->uuid === User::where('id', $user->id)->first()->uuid;
        });
        $response->assertStatus(200);

        $this->assertDatabaseHas('votes', ['game_id' => Game::where('uuid', $game)->first()->id, 'value' => 3]);

        $response = $this->actingAs($user)->getJson('/api/room/' . $room . '/game/' . $game);
        $response->assertStatus(200);
        $response->assertExactJson([
            'voted' => [User::where('id', $user->id)->first()->uuid],
            'ended' => false,
            'reveal' => false
        ]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/reveal');
        $response->assertStatus(403);

        $response = $this->actingAs($otherUser)->postJson('/api/room/' . $room . '/game/' . $game . '/vote', ['value' => 5]);
        Event::assertDispatched(function (VoteEvent $event) use ($game, $otherUser) {
            return $event->game->uuid === $game &&
                $event->user->uuid === User::where('id', $otherUser->id)->first()->uuid;
        });
        $response->assertStatus(200);

        $response = $this->actingAs($otherUser)->getJson('/api/room/' . $room . '/game/' . $game);
        $response->assertStatus(200);
        $response->assertExactJson([
            'voted' => [User::where('id', $user->id)->first()->uuid, User::where('id', $otherUser->id)->first()->uuid],
            'ended' => false,
            'reveal' => false
        ]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/end');
        $response->assertStatus(200);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/reveal');
        $response->assertStatus(403);

        Carbon::setTestNow(Carbon::now()->addSeconds(5));

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/reveal');
        Event::assertDispatched(function (GameEndEvent $event) use ($game) {
            return $event->game->uuid === $game;
        });
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
        Event::fake();
        $this->assertDatabaseEmpty('spectators');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/room', ['name' => 'room']);

        $room = $response['room'];

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/spectator');
        $response->assertStatus(200);

        $this->assertDatabaseHas('spectators', ['room_id' => Room::where('uuid', $room)->first()->id, 'user_id' => $user->id]);

        $deck = Deck::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game', ['deck' => $deck->uuid]);
        $response->assertStatus(200);

        $game = $response['game'];

        $response = $this->actingAs($user)->getJson('/api/room/' . $room);
        $response->assertStatus(200);
        $response->assertExactJson([
            'spectators' => [User::where('id', $user->id)->first()->uuid],
            'game' => $game,
            'room' => $room,
            'owner' => User::where('id', $user->id)->first()->uuid
        ]);

        $otherUser = User::factory()->create();
        $response = $this->actingAs($otherUser)->postJson('/api/room/' . $room . '/spectator');

        $response = $this->actingAs($user)->getJson('/api/room/' . $room);
        $response->assertStatus(200);
        $response->assertExactJson([
            'spectators' => [User::where('id', $user->id)->first()->uuid, User::where('id', $otherUser->id)->first()->uuid],
            'game' => $game,
            'room' => $room,
            'owner' => User::where('id', $user->id)->first()->uuid
        ]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/spectator');
        $response->assertStatus(403);

        $response = $this->actingAs($user)->deleteJson('/api/room/' . $room . '/spectator');
        $response->assertStatus(200);

        $response = $this->actingAs($otherUser)->deleteJson('/api/room/' . $room . '/spectator');
        $response->assertStatus(200);

        $response = $this->actingAs($user)->getJson('/api/room/' . $room);
        $response->assertStatus(200);
        $response->assertExactJson([
            'spectators' => [],
            'game' => $game,
            'room' => $room,
            'owner' => User::where('id', $user->id)->first()->uuid
        ]);

        $this->assertDatabaseMissing('spectators', ['room_id' => Room::where('uuid', $room)->first()->id, 'user_id' => $user->id]);
        $this->assertDatabaseEmpty('spectators');

        $response = $this->actingAs($user)->deleteJson('/api/room/' . $room . '/spectator');
        $response->assertStatus(403);

        Event::assertDispatched(function (UserSpectatorEvent $event) use ($room, $user) {
            return $event->room->uuid === $room &&
                $event->user->uuid === User::where('id', $user->id)->first()->uuid &&
                $event->spectator === true;
        });

        Event::assertDispatched(function (UserSpectatorEvent $event) use ($room, $user) {
            return $event->room->uuid === $room &&
                $event->user->uuid === User::where('id', $user->id)->first()->uuid &&
                $event->spectator === false;
        });

        Event::assertDispatched(function (UserSpectatorEvent $event) use ($room, $otherUser) {
            return $event->room->uuid === $room &&
                $event->user->uuid === User::where('id', $otherUser->id)->first()->uuid &&
                $event->spectator === false;
        });

        Event::assertDispatched(function (UserSpectatorEvent $event) use ($room, $otherUser) {
            return $event->room->uuid === $room &&
                $event->user->uuid === User::where('id', $otherUser->id)->first()->uuid &&
                $event->spectator === true;
        });
    }

    public function test_input_validation(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/room', ['name' => 'room']);

        $room = $response['room'];

        $response = $this->actingAs($user)->postJson('/api/deck', ['name' => '', 'cards' => '']);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
        $response->assertJson(['errors' => ['name' => ['Deck name is required']]]);
        $response->assertJsonValidationErrors(['cards']);
        $response->assertJson(['errors' => ['cards' => ['Please provide deck cards']]]);

        $response = $this->actingAs($user)->postJson('/api/deck', ['name' => 1, 'cards' => 1]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
        $response->assertJson(['errors' => ['name' => ['Deck name must be a string']]]);
        $response->assertJsonValidationErrors(['cards']);
        $response->assertJson(['errors' => ['cards' => ['Deck cards must be a string of comma separated values']]]);

        $response = $this->actingAs($user)->postJson('/api/deck', ['name' => 'fibo', 'cards' => '1,2,3,4,5', 'is_public' => true]);
        $response->assertStatus(200);

        $deck = $response['deck'];

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game');
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['deck']);
        $response->assertJson(['errors' => ['deck' => ['Deck UUID is required']]]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game', ['deck' => 'a']);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['deck']);
        $response->assertJson(['errors' => ['deck' => ['Please provide deck UUID']]]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game', ['deck' => $deck]);
        $response->assertStatus(200);

        $game = $response['game'];

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/vote');
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['value']);
        $response->assertJson(['errors' => ['value' => ['Vote value is required']]]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/vote', ['value' => 'a']);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['value']);
        $response->assertJson(['errors' => ['value' => ['Vote value must be an integer']]]);
    }

    public function test_deck()
    {
        $user = User::factory()->create();

        $this->assertDatabaseEmpty('decks');

        $deck = Deck::factory()->create(['name' => 'fibo', 'cards' => '1,2,3,4,5', 'is_public' => true, 'user_id' => null]);

        $this->assertDatabaseHas('decks', ['name' => 'fibo', 'cards' => '1,2,3,4,5', 'user_id' => null, 'is_public' => true]);

        $response = $this->actingAs($user)->postJson('/api/deck', ['name' => 'tribo', 'cards' => '1,2,3,4,5', 'is_public' => false]);
        $response->assertStatus(200);

        $this->assertDatabaseHas('decks', ['name' => 'tribo', 'cards' => '1,2,3,4,5', 'user_id' => $user->id, 'is_public' => false]);

        $response = $this->actingAs($user)->getJson('/api/deck');
        $response->assertStatus(200);
        $response->assertExactJson([
            ['uuid' => Deck::where('name', 'fibo')->first()->uuid, 'name' => 'fibo', 'cards' => '1,2,3,4,5'],
            ['uuid' => Deck::where('name', 'tribo')->first()->uuid, 'name' => 'tribo', 'cards' => '1,2,3,4,5']
        ]);
    }
}
