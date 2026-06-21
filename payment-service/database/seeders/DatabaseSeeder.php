<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\Refund;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Payments
        $p1 = Payment::updateOrCreate(
            ['transaction_code' => 'TXN-COMPLETED1'],
            [
                'booking_id'     => 9921,
                'job_post_id'    => null,
                'payment_method' => 'vnpay',
                'amount'         => 450000.00,
                'status'         => 'completed',
                'paid_at'        => now()->subDays(2),
                'created_at'     => now()->subDays(2),
            ]
        );

        $p2 = Payment::updateOrCreate(
            ['transaction_code' => 'TXN-COMPLETED2'],
            [
                'booking_id'     => 9870,
                'job_post_id'    => null,
                'payment_method' => 'momo',
                'amount'         => 200000.00,
                'status'         => 'completed',
                'paid_at'        => now()->subDay(),
                'created_at'     => now()->subDay(),
            ]
        );

        $p3 = Payment::updateOrCreate(
            ['transaction_code' => 'TXN-PENDING1'],
            [
                'booking_id'     => 9542,
                'job_post_id'    => null,
                'payment_method' => 'vnpay',
                'amount'         => 300000.00,
                'status'         => 'pending',
                'paid_at'        => null,
                'created_at'     => now(),
            ]
        );

        $p4 = Payment::updateOrCreate(
            ['transaction_code' => 'TXN-FAILED1'],
            [
                'booking_id'     => 9340,
                'job_post_id'    => null,
                'payment_method' => 'vnpay',
                'amount'         => 150000.00,
                'status'         => 'failed',
                'paid_at'        => null,
                'created_at'     => now()->subDays(3),
            ]
        );

        $p5 = Payment::updateOrCreate(
            ['transaction_code' => 'TXN-REFUNDED1'],
            [
                'booking_id'     => 9122,
                'job_post_id'    => null,
                'payment_method' => 'momo',
                'amount'         => 500000.00,
                'status'         => 'refunded',
                'paid_at'        => now()->subDays(5),
                'created_at'     => now()->subDays(5),
            ]
        );

        // 2. Seed Refunds
        Refund::updateOrCreate(
            [
                'payment_id' => $p1->id,
                'amount'     => 450000.00,
            ],
            [
                'reason'     => 'Customer cancelled the AC Repair booking.',
                'status'     => 'pending',
                'created_at' => now()->subDay(),
            ]
        );

        Refund::updateOrCreate(
            [
                'payment_id' => $p2->id,
                'amount'     => 200000.00,
            ],
            [
                'reason'     => 'Helper did not show up.',
                'status'     => 'pending',
                'created_at' => now(),
            ]
        );

        Refund::updateOrCreate(
            [
                'payment_id' => $p5->id,
                'amount'     => 500000.00,
            ],
            [
                'reason'     => 'Service not completed.',
                'status'     => 'completed',
                'created_at' => now()->subDays(4),
            ]
        );
    }
}
