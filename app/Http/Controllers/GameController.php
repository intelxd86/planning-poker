<?php

namespace App\Http\Controllers;

use App\Events\GameEndEvent;
use App\Events\NewGameEvent;
use App\Events\UserSpectatorEvent;
use App\Events\VoteEvent;
use App\Http\Requests\CreateDeckRequest;
use App\Http\Requests\CreateGameRequest;
use App\Http\Requests\CreateRoomRequest;
use App\Http\Requests\VoteRequest;
use App\Models\Deck;
use App\Models\Game;
use App\Models\Room;
use App\Models\Spectator;
use App\Models\Vote;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class GameController extends Controller
{
    public function roomInfo(Request $request, Room $room)
    {
        $currentGame = Game::where('room_id', $room->id)
            ->with('deck')
            ->orderBy('created_at', 'desc')
            ->first();

        $spectators = Spectator::where('room_id', $room->id)->with('user')->get();

        return [
            'room' => $room->uuid,
            'game' => $currentGame ? [
                'uuid' => $currentGame->uuid,
            ] : null,
            'spectators' => $spectators->map(function ($spectator) {
                return  $spectator->user->uuid;
            }),
            'owner' => [
                'uuid' => $room->user->uuid,
                'name' => $room->user->name,
            ],
        ];
    }

    public function getUserRooms(Request $request)
    {
        $rooms = Room::where('user_id', $request->user()->id)
            ->limit(20)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['rooms' => $rooms->map(function ($room) {
            return ['name' => $room->name, 'uuid' => $room->uuid];
        })]);
    }

    public function createRoom(CreateRoomRequest $request)
    {
        if (RateLimiter::tooManyAttempts('create-room:' . $request->user()->id, $perMinute = 1)) {
            $seconds = RateLimiter::availableIn('create-room:' . $request->user()->id);

            return response()->json([
                'errors' => [
                    'limit' => ['You may try again in ' . $seconds . ' seconds.'],
                ]
            ], 429);
        }

        RateLimiter::increment('create-room:' . $request->user()->id);

        $room = new Room();
        $room->uuid = Str::uuid();
        $room->user_id = $request->user()->id;
        $room->name = $request->input('name');
        $room->save();

        Log::info('Room created', ['uuid' => $room->uuid, 'name' => $room->name, 'user' => $request->user()->uuid]);

        return response()->json(['room' => $room->uuid]);
    }

    public function createGame(CreateGameRequest $request, Room $room)
    {
        if (RateLimiter::tooManyAttempts('create-game:' . $request->user()->id, $perMinute = 1)) {
            $seconds = RateLimiter::availableIn('create-game:' . $request->user()->id);

            return response()->json([
                'errors' => [
                    'limit' => ['You may try again in ' . $seconds . ' seconds.'],
                ]
            ], 429);
        }

        RateLimiter::increment('create-game:' . $request->user()->id);

        if ($room->user_id !== $request->user()->id) {
            return response()->json(['errors' => ['room' => ['You are not the owner of this room']]], 403);
        }

        if ($room->gameOngoing()) {
            return response()->json(['errors' => ['room' => ['There is already a game ongoing in this room']]], 403);
        }

        $deck = Deck::where('uuid', $request->input('deck'))->first();
        if (!$deck) {
            return response()->json(['errors' => ['deck' => ['Deck not found']]], 404);
        }

        $game = new Game();
        $game->uuid = Str::uuid();
        $game->deck_id = $deck->id;
        $game->room_id = $room->id;
        $game->name = $request->input('name');
        $game->save();

        broadcast(new NewGameEvent($room, $game));

        Log::info('Game created', ['room' => $room->uuid, 'game' => $game->uuid, 'name' => $game->name, 'deck' => $deck->uuid, 'user' => $request->user()->uuid]);

        return response()->json(['game' => $game->uuid]);
    }

    public function vote(VoteRequest $request, Room $room, Game $game)
    {
        if ($game->isEnded()) {
            return response()->json(['errors' => ['game' => ['This game has already ended']]], 403);
        }

        $value = $request->input('value');
        $user = $request->user();

        Log::debug('Vote attempt', ['room' => $room->uuid, 'game' => $game->uuid, 'user' => $user->uuid, 'value' => $value]);

        $spectator = Spectator::where('room_id', $room->id)->where('user_id', $user->id)->first();
        if ($spectator) {
            return response()->json(['errors' => ['spectator' => ['Spectators cannot vote']]], 403);
        }

        if (!$value) {
            $vote = Vote::where('game_id', $game->id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $vote->delete();

            broadcast(new VoteEvent($room, $game, $user, false));

            Log::debug('Vote removed', ['room' => $room->uuid, 'game' => $game->uuid, 'user' => $user->uuid]);

            return response()->json(['success' => true]);
        }

        $deck = Deck::where('id', $game->deck_id)->firstOrFail();

        if (!in_array($value, $deck->getCards())) {
            Log::debug('Invalid card value', ['room' => $room->uuid, 'game' => $game->uuid, 'user' => $user->uuid, 'value' => $value]);
            return response()->json(['errors' => ['value' => ['Invalid card value - it is not in the deck']]], 403);
        }

        $vote = Vote::where('game_id', $game->id)
            ->where('user_id', $user->id)
            ->first();

        if ($vote) {
            $vote->value = $value;
            $vote->save();
            Log::debug('Vote updated', ['room' => $room->uuid, 'game' => $game->uuid, 'user' => $user->uuid, 'value' => $value]);
        } else {
            $vote = new Vote();
            $vote->game_id = $game->id;
            $vote->user_id = $user->id;
            $vote->value = $request->input('value');
            $vote->save();

            broadcast(new VoteEvent($room, $game, $user, true));
            Log::debug('Vote created', ['room' => $room->uuid, 'game' => $game->uuid, 'user' => $user->uuid, 'value' => $value]);
        }

        return response()->json(['success' => true]);
    }

    public function getGameState(Request $request, Room $room, Game $game)
    {
        $votes = Vote::where('game_id', $game->id)->with('user')->get();

        $voted = $votes->map(function ($vote) {
            return [
                'uuid' => $vote->user->uuid,
                'name' => $vote->user->name,
            ];
        });

        return response()->json([
            'uuid' => $game->uuid,
            'name' => $game->name,
            'cards' => $game->deck->getCards(),
            'voted' => $voted,
            'ended' => $game->isEnded(),
            'reveal' => $game->canReveal(),
            'user_vote_value' => $votes->firstWhere('user_id', $request->user()->id)->value ?? null,
            'result' => $game->canReveal() ? $game->getResult() : null,
        ]);
    }

    public function revealVotes(Request $request, Room $room, Game $game)
    {
        if (!$game->isEnded() || !$game->canReveal()) {
            return response()->json(['errors' => ['game' => ['Cannot reveal cards yet']]], 403);
        }

        $result = $game->getResult();

        return response()->json($result);
    }

    public function stopGame(Request $request, Room $room, Game $game)
    {
        if ($room->user_id !== $request->user()->id) {
            return response()->json(['errors' => ['room' => ['You are not the owner of this room']]], 403);
        }

        if ($game->isEnded()) {
            return response()->json(['errors' => ['game' => ['This game has already ended']]], 403);
        }

        $votes = Vote::where('game_id', $game->id)->count();

        if ($votes === 0) {
            Log::debug('No votes to end game', ['room' => $room->uuid, 'game' => $game->uuid, 'user' => $request->user()->uuid]);
            return response()->json(['errors' => ['game' => ['No one has voted yet']]], 403);
        }

        $game->ended_at = now();
        $game->reveal_at = Carbon::now()->addSeconds(3);
        $game->save();

        broadcast(new GameEndEvent($room, $game));

        Log::info('Game finished', ['room' => $room->uuid, 'game' => $game->uuid, 'user' => $request->user()->uuid]);

        return response()->json(['success' => true]);
    }

    public function setSpectator(Request $request, Room $room)
    {
        $user = $request->user();

        $spectator = Spectator::where('user_id', $user->id)
            ->where('room_id', $room->id)
            ->first();

        if ($spectator) {
            return response()->json(['errors' => ['spectator' => ['You are already a spectator in this room']]], 403);
        }

        $spectator = new Spectator();
        $spectator->room_id = $room->id;
        $spectator->user_id = $user->id;
        $spectator->save();

        broadcast(new UserSpectatorEvent($room, $user, true));

        $currentGame = Game::where('room_id', $room->id)
            ->where('ended_at', null)
            ->first();

        if ($currentGame) {
            $vote = Vote::where('game_id', $currentGame->id)
                ->where('user_id', $user->id)
                ->first();

            if ($vote) {
                $vote->delete();
                broadcast(new VoteEvent($room, $currentGame, $user, false));
            }
        }

        Log::debug('Spectator set', ['room' => $room->uuid, 'user' => $user->uuid]);

        return response()->json(['success' => true]);
    }

    public function unsetSpectator(Request $request, Room $room)
    {
        $user = $request->user();

        $spectator = Spectator::where('user_id', $user->id)
            ->where('room_id', $room->id)
            ->first();

        if (!$spectator) {
            return response()->json(['errors' => ['spectator' => ['You are not a spectator in this room']]], 403);
        }
        $spectator->delete();

        broadcast(new UserSpectatorEvent($room, $user, false));

        Log::debug('Spectator unset', ['room' => $room->uuid, 'user' => $user->uuid]);

        return response()->json(['success' => true]);
    }

    public function createDeck(CreateDeckRequest $request)
    {
        $deck = new Deck();
        $deck->uuid = Str::uuid();
        $deck->name = $request->input('name');
        $deck->cards = $request->input('cards');
        $deck->is_public = false;
        $deck->user_id = $request->user()->id;
        $deck->save();

        Log::debug('Deck created', ['uuid' => $deck->uuid, 'name' => $deck->name, 'cards' => $deck->cards, 'user' => $request->user()->uuid]);

        return response()->json(['deck' => $deck->uuid]);
    }

    public function getDecks(Request $request)
    {
        $decks = Deck::where(function ($query) use ($request) {
            $query->where('user_id', $request->user()->id)
                ->orWhere('is_public', true);
        })->get();

        return response()->json($decks->map(function ($deck) {
            return [
                'uuid' => $deck->uuid,
                'name' => $deck->name,
                'cards' => $deck->cards,
            ];
        }));
    }
}
