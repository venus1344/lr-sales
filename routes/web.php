<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('home'));

Route::middleware(['auth', 'verified'])->group(function () {
    Route::view('home', 'dashboard')->name('home');
});
