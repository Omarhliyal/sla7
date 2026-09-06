<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\MessageController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthController;


// =========================
// AUTH
// =========================

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// =========================
// PUBLIC
// =========================

Route::get('/categories', [CategoryController::class, 'index']);

Route::get('/listings', [ListingController::class, 'index']);

Route::get('/listings/{id}', [ListingController::class, 'show']);


// =========================
// AUTHENTICATED
// =========================

Route::middleware('auth:sanctum')->group(function () {

    // =========================
    // AUTH
    // =========================

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);

    Route::get('/me', [
        AuthController::class,
        'me'
    ]);


    // =========================
    // MESSAGES
    // =========================

    // Unread count
    // IMPORTANT: must be before /messages/{listingId}
    Route::get('/messages/unread-count', [
        MessageController::class,
        'unreadCount'
    ]);

    // Mark messages as read
    Route::post('/messages/{listingId}/read', [
        MessageController::class,
        'markAsRead'
    ]);

    // Get messages for a listing
    Route::get('/messages/{listingId}', [
        MessageController::class,
        'index'
    ]);

    // Send message
    Route::post('/messages', [
        MessageController::class,
        'store'
    ]);

    // Get all conversations
    Route::get('/conversations', [
        MessageController::class,
        'conversations'
    ]);


    // =========================
    // USER LISTINGS
    // =========================

    Route::get('/my-listings', [
        ListingController::class,
        'myListings'
    ]);

    Route::post('/listings', [
        ListingController::class,
        'store'
    ]);

    Route::put('/listings/{id}', [
        ListingController::class,
        'update'
    ]);

    Route::delete('/listings/{id}', [
        ListingController::class,
        'destroy'
    ]);

});


// =========================
// USER
// =========================

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');