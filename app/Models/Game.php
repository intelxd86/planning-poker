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

        $numericVotes = $votes->filter(function ($vote) {
            return is_numeric($vote->value);
        });

        $values = $votes->pluck('value')->toArray();
        $valueCounts = array_count_values($values);
        $maxCount = max($valueCounts);
        $modes = array_keys($valueCounts, $maxCount);

        $histogram = $valueCounts;

        return [
            'votes' => $votes->reduce(function ($carry, $vote) {
                $carry[$vote->user->uuid] = $vote->value;
                return $carry;
            }, []),
            'average' => $numericVotes->isEmpty() ? null : round($numericVotes->avg('value'), 2),
            'median' => $numericVotes->isEmpty() ? null : $numericVotes->median('value'),
            'min' => $numericVotes->isEmpty() ? null : $numericVotes->min('value'),
            'max' => $numericVotes->isEmpty() ? null : $numericVotes->max('value'),
            'modes' => implode(', ', $modes),
            'histogram' => $histogram,
        ];
    }
}
