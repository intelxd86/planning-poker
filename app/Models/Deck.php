<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deck extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'cards', 'user_id', 'is_public'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
