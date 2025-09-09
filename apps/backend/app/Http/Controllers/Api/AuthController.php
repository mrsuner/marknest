<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function requestOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;

        // Create or find user
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => explode('@', $email)[0],
                'email_verified_at' => now(),
            ]
        );

        // Generate OTP
        $otp = $this->generateOtp();

        // Store OTP in cache with 10 minutes expiration
        // Also store the email associated with the OTP for magic link verification
        Cache::put($this->getOtpCacheKey($email), $otp, now()->addMinutes(10));
        Cache::put('otp_email:'.$otp, $email, now()->addMinutes(10));

        // Send OTP via email (skip in local environment)
        if (config('app.env') !== 'local') {
            Mail::to($email)->send(new OtpMail($otp, $email));
        }

        return response()->json([
            'message' => 'OTP sent to your email',
            'debug' => config('app.env') === 'local' ? ['otp' => $otp] : null,
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required_without:magic_link|email',
            'otp' => 'required|string',
            'magic_link' => 'boolean',
        ]);

        $providedOtp = $request->otp;

        // If email is not provided, try to get it from the OTP cache (magic link flow)
        if (! $request->email) {
            $email = Cache::get('otp_email:'.$providedOtp);
            if (! $email) {
                throw ValidationException::withMessages([
                    'otp' => ['Invalid or expired OTP'],
                ]);
            }
        } else {
            $email = $request->email;
        }

        // Get cached OTP
        $cachedOtp = Cache::get($this->getOtpCacheKey($email));

        if (! $cachedOtp || $cachedOtp !== $providedOtp) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP'],
            ]);
        }

        // Clear the OTP from cache
        Cache::forget($this->getOtpCacheKey($email));
        Cache::forget('otp_email:'.$providedOtp);

        // Find the user
        $user = User::where('email', $email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['User not found'],
            ]);
        }

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $email = $request->email;
        $password = $request->password;

        // Find the user
        $user = User::where('email', $email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        // Check if user has a password set
        if (! $user->password) {
            throw ValidationException::withMessages([
                'email' => ['Please use email verification to sign in, or set a password first'],
            ]);
        }

        // Verify password
        if (! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    private function generateOtp(): string
    {
        // In local environment, always return 123456
        if (config('app.env') === 'local') {
            return '123456';
        }

        // Generate 6-digit random OTP
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function getOtpCacheKey(string $email): string
    {
        return 'otp:'.$email;
    }
}
