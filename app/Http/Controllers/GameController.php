<?php

namespace App\Http\Controllers;

use App\Events\GameEndEvent;
use App\Events\NewGameEvent;
use App\Events\VoteEvent;
use App\Http\Requests\CreateDeckRequest;
use App\Http\Requests\CreateGameRequest;
use App\Http\Requests\VoteRequest;
use App\Models\Deck;
use App\Models\Game;
use App\Models\Room;
use App\Models\Spectator;
use App\Models\Vote;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GameController extends Controller
{
    public function showRoom(Request $request, Room $room)
    {
        return view('welcome', ['room' => $room->uuid]);
    }

    public function createRoom(Request $request)
    {
        $room = new Room();
        $room->uuid = Str::uuid();
        $room->user_id = $request->user()->id;
        $room->save();

        return response()->json(['room' => $room->uuid]);
    }

    public function createGame(CreateGameRequest $request, Room $room)
    {
        if ($room->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($room->gameOngoing()) {
            abort(403);
        }

        $deck = Deck::where('uuid', $request->input('deck'))->first();
        if (!$deck) {
            abort(403);
        }

        $game = new Game();
        $game->uuid = Str::uuid();
        $game->deck_id = $deck->id;
        $game->room_id = $room->id;
        $game->save();

        broadcast(new NewGameEvent($room, $game));

        return response()->json(['game' => $game->uuid]);
    }

    public function vote(VoteRequest $request, Room $room, Game $game)
    {
        $value = $request->input('value');

        $deck = Deck::where('id', $game->deck_id)->firstOrFail();

        if (!in_array($value, $deck->getCards())) {
            abort(403);
        }

        if ($game->isEnded()) {
            abort(403);
        }

        $user = $request->user();

        $vote = new Vote();
        $vote->game_id = $game->id;
        $vote->user_id = $user->id;
        $vote->value = $request->input('value');
        $vote->save();

        broadcast(new VoteEvent($room, $game, $value, $user));

        return response()->json(['success' => true]);
    }

    public function getGameState(Request $request, Room $room, Game $game)
    {
        $votes = Vote::where('game_id', $game->id)->get();
        $spectators = Spectator::where('room_id', $room->id)->with('user')->get();

        return response()->json([
            'voted' => $votes->pluck('user_id'),
            'spectators' => $spectators->map(function ($spectator) {
                return  $spectator->user->uuid;
            }),
            'ended' => $game->isEnded(),
            'reveal' => $game->canReveal(),
        ]);
    }

    public function revealVotes(Request $request, Room $room, Game $game)
    {
        if (!$game->isEnded() || !$game->canReveal()) {
            abort(403);
        }

        $votes = Vote::where('game_id', $game->id)->with('user')->get();

        return response()->json([
            'votes' => $votes->map(function ($vote) {
                return [
                    'value' => $vote->value,
                    'user' => $vote->user->uuid,
                ];
            }),
            'average' => $votes->avg('value'),
            'median' => $votes->median('value'),
            'min' => $votes->min('value'),
            'max' => $votes->max('value'),
        ]);
    }

    public function stopGame(Request $request, Room $room, Game $game)
    {
        if ($room->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($game->isEnded()) {
            abort(403);
        }

        $game->ended_at = now();
        $game->reveal_at = Carbon::now()->addSeconds(5);
        $game->save();

        broadcast(new GameEndEvent($room, $game));

        return response()->json(['success' => true]);
    }

    public function setSpectator(Request $request, Room $room)
    {
        $user = $request->user();

        $spectator = Spectator::where('user_id', $user->id)
            ->where('room_id', $room->id)
            ->first();

        if ($spectator) {
            abort(403);
        }

        $spectator = new Spectator();
        $spectator->room_id = $room->id;
        $spectator->user_id = $user->id;
        $spectator->save();


        return response()->json(['success' => true]);
    }

    public function unsetSpectator(Request $request, Room $room)
    {
        $user = $request->user();

        $spectator = Spectator::where('user_id', $user->id)
            ->where('room_id', $room->id)
            ->first();

        if (!$spectator) {
            abort(403);
        }
        $spectator->delete();

        return response()->json(['success' => true]);
    }

    public function createDeck(CreateDeckRequest $request)
    {
        $deck = new Deck();
        $deck->uuid = Str::uuid();
        $deck->name = $request->input('name');
        $deck->cards = $request->input('cards');
        $deck->user_id = $request->user()->id;
        $deck->save();

        return response()->json(['deck' => $deck->uuid]);
    }
}
