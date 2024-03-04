<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Room;
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

        $game = new Game();
        $game->uuid = Str::uuid();
        $game->deck_id = $request->input('deck');
        $game->room_id = $room->id;
        $game->save();

        return response()->json(['game' => $game->uuid]);
    }

    public function vote(Request $request, Game $game)
    {
        $game = Game::find($request->input('game'));

        $user = $request->user();

        $vote = new Vote();
        $vote->game_id = $game->id;
        $vote->user_id = $user->id;
        $vote->value = $request->input('value');
        $vote->save();

        return response()->json(['vote' => $vote->id]);
    }
}
