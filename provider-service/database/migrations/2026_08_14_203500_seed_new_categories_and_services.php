<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Check or Insert Categories
        $cleaningId = DB::table('service_categories')->where('name', 'Cleaning')->value('id');
        $repairId = DB::table('service_categories')->where('name', 'Repair')->value('id');
        $careId = DB::table('service_categories')->where('name', 'Care')->value('id');

        // New Categories
        $assemblyId = DB::table('service_categories')->where('name', 'Assembly')->value('id');
        if (!$assemblyId) {
            $assemblyId = DB::table('service_categories')->insertGetId([
                'name'        => 'Assembly',
                'description' => 'Furniture assembly and household handyman tasks',
                'icon'        => 'material-symbols:build-circle-outline',
                'type'        => 'both',
                'status'      => 'active',
            ]);
        }

        $gardeningId = DB::table('service_categories')->where('name', 'Gardening')->value('id');
        if (!$gardeningId) {
            $gardeningId = DB::table('service_categories')->insertGetId([
                'name'        => 'Gardening',
                'description' => 'Lawn care, plant pruning and landscaping services',
                'icon'        => 'material-symbols:park-outline',
                'type'        => 'both',
                'status'      => 'active',
            ]);
        }

        // 2. Insert Services
        $services = [
            // Cleaning Category
            [
                'category_id' => $cleaningId,
                'name'        => 'Office & Store Cleaning',
                'description' => 'Deep cleaning of offices, retail stores, or small workspaces.',
                'base_price'  => 800000,
                'price_type'  => 'fixed',
                'status'      => 'active',
                'image'       => 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
            ],
            [
                'category_id' => $cleaningId,
                'name'        => 'Post-Construction Cleaning',
                'description' => 'Clean up dust, paint stains, and debris after building construction or renovation.',
                'base_price'  => 1500000,
                'price_type'  => 'fixed',
                'status'      => 'active',
                'image'       => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop',
            ],

            // Repair Category
            [
                'category_id' => $repairId,
                'name'        => 'Electrical Device Installation',
                'description' => 'Installing lights, ceiling fans, sockets, or smart home devices.',
                'base_price'  => 200000,
                'price_type'  => 'hourly',
                'status'      => 'active',
                'image'       => 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?q=80&w=1200&auto=format&fit=crop',
            ],
            [
                'category_id' => $repairId,
                'name'        => 'Plumbing Repair & Leak Fixing',
                'description' => 'Fixing sink leaks, kitchen faucets, toilet installation, and minor pipe repairs.',
                'base_price'  => 180000,
                'price_type'  => 'hourly',
                'status'      => 'active',
                'image'       => 'https://images.unsplash.com/photo-1542013936693-8848e5744a83?q=80&w=1200&auto=format&fit=crop',
            ],

            // Care Category
            [
                'category_id' => $careId,
                'name'        => 'Baby & Infant Care',
                'description' => 'Caring for baby infants, feeding, diapering, bathing, and putting to sleep.',
                'base_price'  => 150000,
                'price_type'  => 'hourly',
                'status'      => 'active',
                'image'       => 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?q=80&w=1200&auto=format&fit=crop',
            ],
            [
                'category_id' => $careId,
                'name'        => 'Patient Care at Hospital & Home',
                'description' => 'Support for patients recovering from surgery, illness, or medical treatment.',
                'base_price'  => 220000,
                'price_type'  => 'hourly',
                'status'      => 'active',
                'image'       => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1200&auto=format&fit=crop',
            ],

            // Assembly Category (New)
            [
                'category_id' => $assemblyId,
                'name'        => 'Furniture Assembly',
                'description' => 'Assemble wardrobes, desks, drawers, or bookshelf units.',
                'base_price'  => 300000,
                'price_type'  => 'fixed',
                'status'      => 'active',
                'image'       => 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=1200&auto=format&fit=crop',
            ],
            [
                'category_id' => $assemblyId,
                'name'        => 'Wall Mounting Services',
                'description' => 'Hang televisions, picture frames, large paintings, shelves, or mirrors securely.',
                'base_price'  => 150000,
                'price_type'  => 'fixed',
                'status'      => 'active',
                'image'       => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
            ],

            // Gardening Category (New)
            [
                'category_id' => $gardeningId,
                'name'        => 'Lawn Mowing & Weeding',
                'description' => 'Trimming overgrown grass and clearing weed from gardens or backyards.',
                'base_price'  => 100000,
                'price_type'  => 'hourly',
                'status'      => 'active',
                'image'       => 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1200&auto=format&fit=crop',
            ],
            [
                'category_id' => $gardeningId,
                'name'        => 'Tree Pruning & Shrub Trimming',
                'description' => 'Pruning overgrown tree branches and trimming hedge bushes to stay neat.',
                'base_price'  => 120000,
                'price_type'  => 'hourly',
                'status'      => 'active',
                'image'       => 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1200&auto=format&fit=crop',
            ],
        ];

        foreach ($services as $service) {
            $exists = DB::table('services')
                ->where('name', $service['name'])
                ->where('category_id', $service['category_id'])
                ->exists();
            if (!$exists) {
                DB::table('services')->insert($service);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $serviceNames = [
            'Office & Store Cleaning',
            'Post-Construction Cleaning',
            'Electrical Device Installation',
            'Plumbing Repair & Leak Fixing',
            'Baby & Infant Care',
            'Patient Care at Hospital & Home',
            'Furniture Assembly',
            'Wall Mounting Services',
            'Lawn Mowing & Weeding',
            'Tree Pruning & Shrub Trimming',
        ];

        DB::table('services')->whereIn('name', $serviceNames)->delete();
        DB::table('service_categories')->whereIn('name', ['Assembly', 'Gardening'])->delete();
    }
};
