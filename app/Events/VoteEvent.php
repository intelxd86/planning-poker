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
    public $voted;
    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct(Room $room, Game $game, User $user, bool $voted)
    {
        $this->room = $room;
        $this->game = $game;
        $this->user = $user;
        $this->voted = $voted;
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
        return [
            'game' => $this->game->uuid,
            'user' => [
                'uuid' => $this->user->uuid,
                'name' => $this->user->name
            ],
            'voted' => $this->voted
        ];
    }
}
