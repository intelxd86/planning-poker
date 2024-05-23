<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = ['room_id', 'uuid', 'deck_id', 'ended_at', 'reveal_at', 'name'];

    protected $casts = [
        'ended_at' => 'datetime',
        'reveal_at' => 'datetime',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function deck()
    {
        return $this->belongsTo(Deck::class);
    }

    public function isEnded(): bool
    {
        return $this->ended_at !== null;
    }

    public function canReveal(): bool
    {
        return $this->reveal_at !== null && $this->reveal_at->isPast();
    }

    public function getResult(): array
    {
        $votes = Vote::where('game_id', $this->id)->with('user')->get();

        return [
            'votes' => $votes->reduce(function ($carry, $vote) {
                $carry[$vote->user->uuid] = $vote->value;
                return $carry;
            }, []),
            'average' => round($votes->avg('value'), 2),
            'median' => $votes->median('value'),
            'min' => $votes->min('value'),
            'max' => $votes->max('value'),
        ];
    }
}
