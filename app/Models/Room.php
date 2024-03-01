<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = ['uuid', 'user_id'];

    public function games()
    {
        return $this->hasMany(Game::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function votes()
    {
        return $this->hasManyThrough(Vote::class, Game::class);
    }

    public function votesCount()
    {
        return $this->votes()->count();
    }
}
