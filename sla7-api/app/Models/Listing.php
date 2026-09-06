<?php

namespace App\Models;
use App\Models\User;
use App\Models\Category;
use App\Models\ListingImage;
use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    public function user()
{
    return $this->belongsTo(User::class);
}

public function category()
{
    return $this->belongsTo(Category::class);
}

public function images()
{
    return $this->hasMany(ListingImage::class);
}
protected $fillable = [
    'user_id',
    'category_id',
    'title',
    'description',
    'price',
    'condition',
    'city',
    'status',
    'type',
];
}
