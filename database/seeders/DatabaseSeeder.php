<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Deck;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        User::factory()->create([
            'name' => 'Another Test User',
            'email' => 'test2@example.com',
        ]);

        Deck::factory()->create([
            'name' => 'Default',
            'cards' => '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20',
            'is_public' => true,
        ]);

        Deck::factory()->create([
            'name' => 'Fibonacci',
            'cards' => '1, 2, 3, 5, 8, 13, 21, 34, 55, 89',
            'is_public' => true,
        ]);
    }
}
