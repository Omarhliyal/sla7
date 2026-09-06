<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Listing;

class ListingController extends Controller
{
    // GET /api/listings
    public function index()
    {
        $listings = Listing::with([
            'user',
            'category',
            'images'
        ])
            ->where('status', 'active')
            ->latest()
            ->get();

        return response()->json($listings);
    }

    // GET /api/listings/{id}
    public function show($id)
    {
        $listing = Listing::with([
            'user',
            'category',
            'images'
        ])
            ->where('status', 'active')
            ->findOrFail($id);

        return response()->json($listing);
    }

    // GET /api/my-listings
    public function myListings(Request $request)
    {
        $listings = Listing::with([
            'user',
            'category',
            'images'
        ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($listings);
    }

    // POST /api/listings
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'nullable|numeric|min:0',
            'condition' => 'required|string',
            'city' => 'required|string|max:100',
            'type' => 'required|in:sell,repair,giveaway',

            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $listing = Listing::create([
            'user_id' => $request->user()->id,
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'price' => $validated['price'] ?? null,
            'condition' => $validated['condition'],
            'city' => $validated['city'],
            'type' => $validated['type'],
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('listings', 'public');

                $listing->images()->create([
                    'image' => $path,
                ]);
            }
        }

        return response()->json(
            $listing->load([
                'user',
                'category',
                'images'
            ]),
            201
        );
    }

    // PUT /api/listings/{id}
    public function update(Request $request, $id)
    {
        $listing = Listing::findOrFail($id);

        // Security: only the owner can edit
        if ($listing->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not allowed to edit this listing.'
            ], 403);
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'nullable|numeric|min:0',
            'condition' => 'required|string',
            'city' => 'required|string|max:100',
            'type' => 'required|in:sell,repair,giveaway',

            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $listing->update([
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'price' => $validated['price'] ?? null,
            'condition' => $validated['condition'],
            'city' => $validated['city'],
            'type' => $validated['type'],
        ]);

        // If new images were uploaded,
        // delete the old images first
        if ($request->hasFile('images')) {

            foreach ($listing->images as $oldImage) {
                Storage::disk('public')->delete(
                    $oldImage->image
                );

                $oldImage->delete();
            }

            foreach ($request->file('images') as $image) {
                $path = $image->store(
                    'listings',
                    'public'
                );

                $listing->images()->create([
                    'image' => $path,
                ]);
            }
        }

        return response()->json(
            $listing->load([
                'user',
                'category',
                'images'
            ])
        );
    }

    // DELETE /api/listings/{id}
    public function destroy(Request $request, $id)
    {
        $listing = Listing::findOrFail($id);

        // Security: only the owner can delete
        if ($listing->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not allowed to delete this listing.'
            ], 403);
        }

        // Delete image files from storage
        foreach ($listing->images as $image) {
            Storage::disk('public')->delete(
                $image->image
            );
        }

        // Delete listing images from database
        $listing->images()->delete();

        // Delete the listing
        $listing->delete();

        return response()->json([
            'message' => 'Listing deleted successfully.'
        ]);
    }
}