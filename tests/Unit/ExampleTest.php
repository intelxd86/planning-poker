<?php

namespace Tests\Unit;

use App\Models\Deck;
use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_that_true_is_true(): void
    {
        $this->assertTrue(true);
    }

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
