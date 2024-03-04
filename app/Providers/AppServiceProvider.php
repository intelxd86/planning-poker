<?php

namespace App\Providers;

use App\Models\Game;
use App\Models\Room;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Route::model('room', Room::class);
        Route::bind('room', function ($value) {
            return \App\Models\Room::where('uuid', $value)->firstOrFail();
        });

        Route::model('game', Game::class);
        Route::bind('game', function ($value) {
            return Game::where('uuid', $value)->firstOrFail();
        });
    }
}
