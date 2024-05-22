<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SendOtpRequest;
use App\Mail\OtpSent;
use App\Models\User;
use App\Utils\Utils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function createUser(CreateUserRequest $request)
    {
        $user = new User();
        $user->uuid = Str::uuid();
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->password = Hash::make($request->input('password'));
        $user->save();

        return response()->json(['user' => $user->uuid]);
    }

    public function loginUser(LoginRequest $request)
    {
        if (!Auth::guard('web')->attempt($request->only('email', 'password'), true)) {
            return response()->json([
                'errors' => [
                    'email' => ['Invalid credentials'],
                ]
            ], 401);
        }

        return response()->json(['user' => Auth::user()->uuid]);
    }

    public function logoutUser(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json();
    }

    public function sendOtp(SendOtpRequest $request)
    {
        $email = $request->input('email');

        if (RateLimiter::tooManyAttempts('send-otp:' . $email, $perMinute = 1)) {
            $seconds = RateLimiter::availableIn('send-otp:' . $email);

            return response()->json([
                'errors' => [
                    'limit' => ['You may try again in ' . $seconds . ' seconds.'],
                ]
            ], 403);
        }

        RateLimiter::increment('send-otp:' . $email, $decaySeconds = 60);

        return DB::transaction(function () use ($email) {
            $user = User::lockForUpdate()->where('email', $email)->first();

            $password = Str::random(12);

            if (!$user) {

                $name = Utils::getNameFromEmail($email);
                if (!$name) {
                    $name = Utils::extractBeforeAt($email);
                    if (!$name) {
                        $name = $email;
                    }
                }

                $user = new User();
                $user->uuid = Str::uuid();
                $user->name = $name;
                $user->email = $email;
                $user->password = Hash::make($password);
                $user->save();
            } else {
                $user->forceFill([
                    'password' => Hash::make($password)
                ]);
                $user->save();
            }

            Mail::to($user->email)->send(new OtpSent($password));

            $user->setRememberToken(Str::random(60));
            $user->save();

            return;
        });
    }
}
