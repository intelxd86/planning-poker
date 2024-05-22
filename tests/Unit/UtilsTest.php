<?php

namespace Tests\Unit;

use App\Models\Deck;
use App\Utils\Utils;
use PHPUnit\Framework\TestCase;

class UtilsTest extends TestCase
{
    public function test_get_name_from_email(): void
    {
        $email = 'john.123.doe@example.com';
        $expectedName = 'John Doe';

        $name = Utils::getNameFromEmail($email);

        $this->assertEquals($expectedName, $name, "The name extracted from the email is not correct");

        $email = 'invalidEmail@foo.bar';
        $name = Utils::getNameFromEmail($email);

        $this->assertFalse($name, "The method did not return false for an invalid email");

        $email = 'john.doe@example.com';
        $expectedName = 'John Doe';

        $name = Utils::getNameFromEmail($email);

        $this->assertEquals($expectedName, $name, "The name extracted from the email is not correct");
    }

    public function test_extract_before_at(): void
    {
        $email = 'john.die@example.com';
        $expectedName = 'john.die';

        $name = Utils::extractBeforeAt($email);
        $this->assertEquals($expectedName, $name, "The name extracted from the email is not correct");
    }
}
