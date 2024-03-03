<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    use HasFactory;

    protected $fillable = ['game_id', 'user_id', 'value'];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
