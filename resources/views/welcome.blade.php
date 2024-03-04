<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Planning Poker</title>
    </head>
    <body class="antialiased">
        Room ID: {{ $room }}
    </body>
</html>
