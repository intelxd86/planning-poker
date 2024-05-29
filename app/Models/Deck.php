<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deck extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'cards', 'user_id', 'is_public', 'uuid'];
    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function games()
    {
        return $this->hasMany(Game::class);
    }

    public function getCards(): array
    {
        $cards = explode(',', str_replace(' ', '', $this->cards));
        return array_values(
            $cards
        );
    }

    public function cardsToString(): string
    {
        return implode(', ', $this->getCards());
    }
}
