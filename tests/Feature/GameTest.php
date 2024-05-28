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

        $response = $this->actingAs($otherUser)->postJson('/api/room/' . $room . '/game', ['name' => 'Test room', 'deck' => $deck->uuid]);
        Event::assertNotDispatched(NewGameEvent::class);
        $response->assertStatus(403);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game', ['name' => 'Test room', 'deck' => $deck->uuid]);
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
            'voted' => [
                [
                    'uuid' => User::where('id', $user->id)->first()->uuid,
                    'name' => User::where('id', $user->id)->first()->name,
                ]
            ],
            'ended' => false,
            'reveal' => false,
            'result' => null,
            'user_vote_value' => 3,
            'uuid' => $game,
            'cards' => Deck::where('uuid', $deck->uuid)->first()->getCards(),
            'name' => 'Test room'
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
            'voted' => [
                [
                    'uuid' => User::where('id', $user->id)->first()->uuid,
                    'name' => User::where('id', $user->id)->first()->name,
                ],
                [
                    'uuid' => User::where('id', $otherUser->id)->first()->uuid,
                    'name' => User::where('id', $otherUser->id)->first()->name,
                ]
            ],
            'ended' => false,
            'reveal' => false,
            'result' => null,
            'user_vote_value' => 5,
            'uuid' => $game,
            'cards' => Deck::where('uuid', $deck->uuid)->first()->getCards(),
            'name' => 'Test room'
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
                User::where('id', $user->id)->first()->uuid => 3,
                User::where('id', $otherUser->id)->first()->uuid => 5
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

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game', ['name' => 'Test game', 'deck' => $deck->uuid]);
        $response->assertStatus(200);

        $game = $response['game'];

        $response = $this->actingAs($user)->getJson('/api/room/' . $room);
        $response->assertStatus(200);
        $response->assertExactJson([
            'spectators' => [User::where('id', $user->id)->first()->uuid],
            'game' => [
                'uuid' => $game,
            ],
            'room' => $room,
            'name' => 'room',
            'owner_managed' => true,
            'owner' => [
                'uuid' => User::where('id', $user->id)->first()->uuid,
                'name' => User::where('id', $user->id)->first()->name
            ]
        ]);

        $otherUser = User::factory()->create();
        $response = $this->actingAs($otherUser)->postJson('/api/room/' . $room . '/spectator');

        $response = $this->actingAs($user)->getJson('/api/room/' . $room);
        $response->assertStatus(200);
        $response->assertExactJson([
            'spectators' => [User::where('id', $user->id)->first()->uuid, User::where('id', $otherUser->id)->first()->uuid],
            'game' => [
                'uuid' => $game,
            ],
            'room' => $room,
            'name' => 'room',
            'owner_managed' => true,
            'owner' => [
                'uuid' => User::where('id', $user->id)->first()->uuid,
                'name' => User::where('id', $user->id)->first()->name
            ]
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
            'game' => [
                'uuid' => $game,
            ],
            'room' => $room,
            'name' => 'room',
            'owner_managed' => true,
            'owner' => [
                'uuid' => User::where('id', $user->id)->first()->uuid,
                'name' => User::where('id', $user->id)->first()->name
            ]
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
        Event::fake();

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

        $response = $this->actingAs($user)->postJson('/api/deck', ['name' => 'fibo', 'cards' => '1,2,3,4,5,x,a', 'is_public' => true]);
        $response->assertStatus(200);

        $deck = $response['deck'];

        $this->assertDatabaseHas('decks', ['name' => 'fibo', 'cards' => '1,2,3,4,5,x,a', 'user_id' => $user->id, 'is_public' => false]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game');
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['deck']);
        $response->assertJson(['errors' => ['deck' => ['Deck UUID is required']]]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game', ['deck' => 'a']);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['deck']);
        $response->assertJson(['errors' => ['deck' => ['Please provide deck UUID']]]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game', ['name' => 'Test room', 'deck' => $deck]);
        $response->assertStatus(200);

        $game = $response['game'];

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/vote', ['value' => 'a']);
        $response->assertStatus(403);
        $response->assertJsonValidationErrors(['value']);
        $response->assertJson(['errors' => ['value' => ['Invalid card value - it is not in the deck']]]);
    }

    public function test_vote()
    {
        Event::fake();
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/room', ['name' => 'room']);

        $room = $response['room'];

        $deck = Deck::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game', ['name' => 'Test game', 'deck' => $deck->uuid]);
        $response->assertStatus(200);

        $game = $response['game'];

        $this->assertDatabaseEmpty('votes');

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/vote', ['value' => 5]);
        $response->assertStatus(200);

        $this->assertDatabaseHas('votes', ['game_id' => Game::where('uuid', $game)->first()->id, 'value' => 5]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/spectator');
        $response->assertStatus(200);

        $this->assertDatabaseHas('spectators', ['room_id' => Room::where('uuid', $room)->first()->id, 'user_id' => $user->id]);
        $this->assertDatabaseEmpty('votes');

        $response = $this->actingAs($user)->deleteJson('/api/room/' . $room . '/spectator');
        $response->assertStatus(200);

        $this->assertDatabaseEmpty('spectators');
        $this->assertDatabaseEmpty('votes');

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/vote', ['value' => 1]);
        $response->assertStatus(200);

        $this->assertDatabaseHas('votes', ['game_id' => Game::where('uuid', $game)->first()->id, 'value' => 1]);

        $response = $this->actingAs($user)->postJson('/api/room/' . $room . '/game/' . $game . '/vote');
        $response->assertStatus(200);

        $this->assertDatabaseEmpty('votes');
    }

    public function test_deck()
    {
        Event::fake();

        $user = User::factory()->create();

        $this->assertDatabaseEmpty('decks');

        Deck::factory()->create(['name' => 'fibo', 'cards' => '1,2,3,4,5', 'is_public' => true, 'user_id' => null]);

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
