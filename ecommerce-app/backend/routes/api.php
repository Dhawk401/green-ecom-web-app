<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
//Login Route
Route::post('/login', function (Request $request) {
    $email = $request->input('email');
    $password = $request->input('password');

    if ($email === 'tadstrange@gmail.com' && $password === 'password123') {
        return response()->json([
            'name' => 'Tad Strange',
            'email' => $email,
            'bio' => 'Dummy profile description',
            'profile_picture' => 'https://i.pravatar.cc/150?u=tadstrange'
        ]);
    }

    return response()->json(['message' => 'Invalid credentials'], 401);
});
//Signup Route
Route::post('/signup', function (Request $request) {
    $data = $request->only(['name', 'email', 'password']);

    // You can log it or just simulate success
    return response()->json([
        'message' => 'User registered successfully!',
        'user' => [
            'name' => $data['name'],
            'email' => $data['email'],
            'profile_picture' => 'https://i.pravatar.cc/150?u=' . urlencode($data['email']),
            'bio' => 'This is a new user!',
        ]
    ]);
});
