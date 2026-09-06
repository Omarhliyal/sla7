<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Listing;
class Category extends Model
{
    public function listings()
{
    return $this->hasMany(Listing::class);
}
protected $fillable = [
    'name',
];
}
