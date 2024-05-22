<?php

namespace App\Utils;

class Utils
{
    public static function getNameFromEmail($email)
    {
        $pattern = '/^([a-zA-Z]+)\.(\d+\.)?([a-zA-Z]+)@/';

        if (preg_match($pattern, $email, $matches)) {

            $firstName = ucfirst($matches[1]);
            $secondName = ucfirst($matches[3]);

            return $firstName . ' ' . $secondName;
        }

        return false;
    }

    public static function extractBeforeAt($email)
    {
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return strstr($email, '@', true);
        }

        return false;
    }
}
