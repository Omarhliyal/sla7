<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Listing;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Get messages for a listing
    |--------------------------------------------------------------------------
    */

    public function index(Request $request, $listingId)
    {
        $listing = Listing::findOrFail($listingId);

        $userId = $request->user()->id;

        $messages = Message::with([
            'sender',
            'receiver',
            'listing'
        ])
            ->where('listing_id', $listingId)
            ->where(function ($query) use ($userId) {
                $query
                    ->where('sender_id', $userId)
                    ->orWhere('receiver_id', $userId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }


    /*
    |--------------------------------------------------------------------------
    | Send message
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string|max:2000',
        ]);

        $listing = Listing::findOrFail(
            $validated['listing_id']
        );

        $senderId = $request->user()->id;
        $receiverId = $validated['receiver_id'];

        /*
        |--------------------------------------------------------------------------
        | Prevent messaging yourself
        |--------------------------------------------------------------------------
        */

        if ($senderId === $receiverId) {
            return response()->json([
                'message' => 'You cannot message yourself.'
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Check that the receiver is allowed
        |--------------------------------------------------------------------------
        */

        $isListingOwner =
            $receiverId === $listing->user_id;

        $isExistingParticipant = Message::where(
            'listing_id',
            $listing->id
        )
            ->where(function ($query) use (
                $senderId,
                $receiverId
            ) {
                $query
                    ->where(function ($query) use (
                        $senderId,
                        $receiverId
                    ) {
                        $query
                            ->where(
                                'sender_id',
                                $senderId
                            )
                            ->where(
                                'receiver_id',
                                $receiverId
                            );
                    })
                    ->orWhere(function ($query) use (
                        $senderId,
                        $receiverId
                    ) {
                        $query
                            ->where(
                                'sender_id',
                                $receiverId
                            )
                            ->where(
                                'receiver_id',
                                $senderId
                            );
                    });
            })
            ->exists();


        if (
            !$isListingOwner &&
            !$isExistingParticipant
        ) {
            return response()->json([
                'message' =>
                    'You are not allowed to message this user about this listing.'
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Create message
        |--------------------------------------------------------------------------
        */

        $message = Message::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'listing_id' => $listing->id,
            'message' => $validated['message'],
            'is_read' => false,
        ]);


        return response()->json(
            $message->load([
                'sender',
                'receiver',
                'listing'
            ]),
            201
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Get all conversations
    |--------------------------------------------------------------------------
    */

    public function conversations(Request $request)
    {
        $userId = $request->user()->id;

        $messages = Message::with([
            'sender',
            'receiver',
            'listing'
        ])
            ->where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($messages);
    }


    /*
    |--------------------------------------------------------------------------
    | Get unread message count
    |--------------------------------------------------------------------------
    */

    public function unreadCount(Request $request)
    {
        $userId = $request->user()->id;

        $count = Message::where(
            'receiver_id',
            $userId
        )
            ->where('is_read', false)
            ->count();

        return response()->json([
            'count' => $count
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Mark messages as read
    |--------------------------------------------------------------------------
    */

    public function markAsRead(Request $request, $listingId)
    {
        $validated = $request->validate([
            'other_user_id' => 'required|exists:users,id',
        ]);

        $userId = $request->user()->id;
        $otherUserId = $validated['other_user_id'];

        Message::where('listing_id', $listingId)
            ->where('receiver_id', $userId)
            ->where('sender_id', $otherUserId)
            ->where('is_read', false)
            ->update([
                'is_read' => true
            ]);

        return response()->json([
            'message' => 'Messages marked as read.'
        ]);
    }
}