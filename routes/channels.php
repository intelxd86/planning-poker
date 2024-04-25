<?php

use App\Models\Room;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('room.{uuid}', function ($user, $uuid) {
    if (Room::where('uuid', $uuid)->exists()) {
        return ['uuid' => $user->uuid, 'name' => $user->name];
    }
});
