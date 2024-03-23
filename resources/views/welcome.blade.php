<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Planning Poker</title>
    @viteReactRefresh
    @vite('resources/js/app.js')
</head>

<body class="antialiased">
    @if (isset($user) && $user)
    <div>
        <div id="poker"></div>
    </div>
    @else
        <div id="login_form"></div>
    @endif
</body>

</html>