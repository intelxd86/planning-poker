<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = ['room_id', 'uuid'];

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
        return $this->hasOne(Deck::class);
    }
}