<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Listing;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'listing_id',
        'message',
        'is_read',
    ];

    public function sender()
    {
        return $this->belongsTo(
            User::class,
            'sender_id'
        );
    }

    public function receiver()
    {
        return $this->belongsTo(
            User::class,
            'receiver_id'
        );
    }

    public function listing()
    {
        return $this->belongsTo(
            Listing::class
        );
    }
}