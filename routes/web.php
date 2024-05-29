<?php

use App\Http\Controllers\GameController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

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

Route::group(['prefix' => 'api'], function () {
    Route::post('/user/create', [UserController::class, 'createUser']);
    Route::post('/user/login', [UserController::class, 'loginUser']);
    Route::post('/user/send-otp', [UserController::class, 'sendOtp']);

    Route::group(['middleware' => 'auth:web'], function () {
        Route::post('/deck', [GameController::class, 'createDeck']);

        Route::get('/room/{room}/deck', [GameController::class, 'getDecks']);
        Route::get('/room', [GameController::class, 'getUserRooms']);
        Route::get('/room/{room}', [GameController::class, 'roomInfo']);
        Route::post('/room', [GameController::class, 'createRoom']);
        Route::post('/room/{room}/game', [GameController::class, 'createGame']);
        Route::post('/room/{room}/opmode', [GameController::class, 'toggleRoomManaged']);
        Route::post('/room/{room}/spectator', [GameController::class, 'setSpectator']);
        Route::delete('/room/{room}/spectator', [GameController::class, 'unsetSpectator']);
        Route::post('/room/{room}/game/{game}/vote', [GameController::class, 'vote']);
        Route::post('/room/{room}/game/{game}/end', [GameController::class, 'stopGame']);
        Route::post('/room/{room}/game/{game}/reveal', [GameController::class, 'revealVotes']);
        Route::get('/room/{room}/game/{game}', [GameController::class, 'getGameState']);

        Route::post('/user/logout', [UserController::class, 'logoutUser']);
    });
});

Route::fallback(function () {
    return view('welcome', ['state' => [
        'user' => Auth::user() ? Auth::user()->toArray() : null,
        'mode' => config('poker.mode'),
    ]]);
});
