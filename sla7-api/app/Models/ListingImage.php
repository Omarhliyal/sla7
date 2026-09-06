<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Listing;

class ListingImage extends Model
{
    protected $fillable = [
        'listing_id',
        'image',
    ];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
}