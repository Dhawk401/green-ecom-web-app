<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/api/hello', function () {
    return response()->json(['message' => 'Hello from Laravel 12!']);

});
//route for login
Route::post('/login', function (Request $request) {
    return response()->json([
        'name' => 'Test User',
        'email' => $request->email
    ]);
});
Route::get('/api/login', fn () => response()->json(['message' => 'Use POST, not GET']));
