<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('home'));

Route::middleware(['auth', 'verified'])->group(function () {
    Route::view('home', 'dashboard')->name('home');
    Route::view('settings/currencies', 'currencies.index')->name('currencies');
    Route::view('settings/item-categories', 'item-categories.index')->name('item-categories');
    Route::view('settings/suppliers', 'suppliers.index')->name('suppliers');
    Route::view('settings/customers', 'customers.index')->name('customers');
});
