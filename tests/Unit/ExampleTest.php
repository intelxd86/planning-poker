<?php

namespace Tests\Unit;

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
        $deck = new \App\Models\Deck();
        $deck->cards = '1,2,3,4,5';
        $this->assertEquals(['1', '2', '3', '4', '5'], $deck->getCards());
    }
}
