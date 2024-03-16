<?php

namespace Tests\Unit;

use App\Models\Deck;
use PHPUnit\Framework\TestCase;

class DeckTest extends TestCase
{
    public function test_get_cards(): void
    {
        $deck = new Deck();
        $deck->cards = '1,2,3,4,5';
        $this->assertEquals(['1', '2', '3', '4', '5'], $deck->getCards());

        $deck = new Deck();
        $deck->cards = ',,,2,3,4,5,,,,6,7,8,9,10,,';
        $this->assertEquals(['2', '3', '4', '5', '6', '7', '8', '9', '10'], $deck->getCards());
    }
}
