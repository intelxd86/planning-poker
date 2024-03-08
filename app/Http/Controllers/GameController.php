<?php

namespace App\Http\Controllers;

use App\Events\GameEndEvent;
use App\Events\NewGameEvent;
use App\Events\VoteEvent;
use App\Models\Deck;
use App\Models\Game;
use App\Models\Room;
use App\Models\Spectator;
use App\Models\Vote;
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

    public function createGame(Request $request, Room $room)
    {
        if ($room->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($room->gameOngoing()) {
            abort(403);
        }

        // TODO: validte input deck

        $game = new Game();
        $game->uuid = Str::uuid();
        $game->deck_id = $request->input('deck');
        $game->room_id = $room->id;
        $game->save();

        broadcast(new NewGameEvent($room, $game));

        return response()->json(['game' => $game->uuid]);
    }

    public function vote(Request $request, Room $room, Game $game)
    {
        $deck = Deck::where('id', $game->deck_id)->firstOrFail();

        // TODO: validate input value

        $value = $request->input('value');

        if (!in_array($value, $deck->getCards())) {
            abort(403);
        }

        if ($game->ended()) {
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

        return response()->json(['votes' => $votes->pluck('value')]);
    }

    public function endGame(Request $request, Room $room, Game $game)
    {
        if ($room->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($game->ended()) {
            abort(403);
        }

        $game->ended_at = now();
        $game->save();

        broadcast(new GameEndEvent($room, $game));

        return response()->json(['success' => true]);
    }

    public function spectator(Request $request, Room $room)
    {
        // TODO: validate input spectator

        $spectator = $request->input('spectator');

        $user = $request->user();

        $existingSpectator = Spectator::where('user_id', $user->id)
            ->where('room_id', $room->id)
            ->first();

        if ($existingSpectator) {
            $existingSpectator->delete();
        } else {
            $spectator = new Spectator();
            $spectator->room_id = $room->id;
            $spectator->user_id = $user->id;
            $spectator->save();
        }

        return response()->json(['success' => true]);
    }
}
