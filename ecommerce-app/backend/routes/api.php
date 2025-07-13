<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// JWT-based Login
Route::post('/login', [AuthController::class, 'login']);

// JWT-based Signup
Route::post('/signup', [AuthController::class, 'signup']);

Route::get('/profile', [AuthController::class, 'profile']);
