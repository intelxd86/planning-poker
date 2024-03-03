<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class GameController extends Controller
{
    public function createRoom(Request $request)
    {
        $room = new \App\Models\Room();
        $room->uuid = \Illuminate\Support\Str::uuid();
        $room->user_id = $request->user()->id;
        $room->save();

        return response()->json(['room' => $room->uuid]);
    }

    public function createGame(Request $request)
    {
        $game = new \App\Models\Game();
        $game->room_id = $request->input('room');
        $game->save();

        return response()->json(['game' => $game->id]);
    }

    public function vote(Request $request)
    {
        $game = \App\Models\Game::find($request->input('game'));
        $user = $request->user();

        $vote = new \App\Models\Vote();
        $vote->game_id = $game->id;
        $vote->user_id = $user->id;
        $vote->value = $request->input('value');
        $vote->save();

        return response()->json(['vote' => $vote->id]);
    }
}
