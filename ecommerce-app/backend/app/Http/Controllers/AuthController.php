<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $email = $request->input('email');
        $password = $request->input('password');

        if ($email === 'tadstrange@gmail.com' && $password === '123456') {
            return response()->json([
                'access_token' => 'dummy-token-123',
                'name' => 'Tad Strange',
                'email' => $email,
                'bio' => 'Dummy profile description',
                'profile_picture' => 'https://i.pravatar.cc/150?u=tadstrange'
            ]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function signup(Request $request)
    {
        $data = $request->only(['name', 'email', 'password']);

        return response()->json([
            'message' => 'User registered successfully (simulated)!',
            'user' => [
                'name' => $data['name'],
                'email' => $data['email'],
                'profile_picture' => 'https://i.pravatar.cc/150?u=' . urlencode($data['email']),
                'bio' => 'This is a new user!',
            ]
        ]);
    }

    public function profile(Request $request)
    {
        $authHeader = $request->header('Authorization');

        if ($authHeader !== 'Bearer dummy-token-123') {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'name' => 'Tad Strange',
            'email' => 'tadstrange@gmail.com',
            'bio' => 'This is protected dummy profile data',
            'profile_picture' => 'https://i.pravatar.cc/150?u=tadstrange'
        ]);
    }
}
