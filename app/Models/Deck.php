<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deck extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'cards', 'user_id', 'is_public', 'uuid'];

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
        $cards = explode(',', $this->cards);
        return array_values(
            array_filter(
                $cards,
                fn ($val) => trim($val) !== '' && is_numeric($val)
            )
        );
    }
}
