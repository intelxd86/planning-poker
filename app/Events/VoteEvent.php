<?php

namespace App\Events;

use App\Models\Game;
use App\Models\Room;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VoteEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $room;
    public $game;
    public $value;
    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct(Room $room, Game $game, User $user)
    {
        $this->room = $room;
        $this->game = $game;
        $this->user = $user;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('room.' . $this->room->uuid),
        ];
    }

    public function broadcastWith(): array
    {
        return ['game' => $this->game->uuid, 'user' => $this->user->uuid];
    }
}
