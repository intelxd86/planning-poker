<?php

use App\Http\Controllers\GameController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/room/{room}', [GameController::class, 'showRoom']);
Route::post('/room', [GameController::class, 'createRoom']);
Route::post('/room/{room}/game', [GameController::class, 'createGame']);
Route::post('/room/{room}/spectator', [GameController::class, 'setSpectator']);
Route::delete('/room/{room}/spectator', [GameController::class, 'unsetSpectator']);
Route::post('/room/{room}/game/{game}/vote', [GameController::class, 'vote']);
Route::post('/room/{room}/game/{game}/end', [GameController::class, 'stopGame']);
Route::post('/room/{room}/game/{game}/reveal', [GameController::class, 'revealVotes']);
Route::get('/room/{room}/game/{game}', [GameController::class, 'getGameState']);
