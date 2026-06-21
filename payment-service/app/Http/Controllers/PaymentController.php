<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Payment;
use App\Models\Refund;

class PaymentController extends Controller
{
    /**
     * Customer creates a new payment for a booking or job post.
     */
    public function store(Request $request)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Only customers can initiate payments.'], 403);
        }

        $fields = $request->validate([
            'booking_id'     => 'nullable|integer',
            'job_post_id'    => 'nullable|integer',
            'payment_method' => 'required|string|max:30',
            'amount'         => 'required|numeric|min:0',
        ]);

        if (empty($fields['booking_id']) && empty($fields['job_post_id'])) {
            return response()->json([
                'message' => 'Payment must be associated with a booking or a job post.'
            ], 422);
        }

        $payment = Payment::create([
            'booking_id'       => $fields['booking_id'] ?? null,
            'job_post_id'      => $fields['job_post_id'] ?? null,
            'payment_method'   => $fields['payment_method'],
            'transaction_code' => 'TXN-' . strtoupper(Str::random(10)),
            'amount'           => $fields['amount'],
            'status'           => 'pending',
            'paid_at'          => null,
        ]);

        return response()->json([
            'message' => 'Payment initiated successfully.',
            'data'    => $payment,
        ], 201);
    }

    /**
     * View payment details (Customer/Admin).
     */
    public function show(Request $request, $id)
    {
        $payment = Payment::with('refunds')->find($id);

        if (!$payment) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        // Ideally, check if the customer owns the booking/job_post here (requires calling order-service or passing ownership data).
        // For simplicity, we allow Admin/Operator (1, 4) and Customer (2) to view.
        if (!in_array($request->authUser['role_id'], [1, 2, 4])) {
             return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(['data' => $payment], 200);
    }

    /**
     * Simulate a successful payment callback (e.g., from VNPAY/Momo).
     */
    public function callback(Request $request, $id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        if ($payment->status === 'completed') {
            return response()->json(['message' => 'Payment already completed.'], 422);
        }

        $payment->update([
            'status'  => 'completed',
            'paid_at' => now(),
        ]);

        return response()->json([
            'message' => 'Payment marked as completed.',
            'data'    => $payment,
        ], 200);
    }

    /**
     * Admin/Operator lists all payments.
     */
    public function adminIndex(Request $request)
    {
        if (!in_array($request->authUser['role_id'], [1, 2])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $query = Payment::orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->query('payment_method'));
        }

        if ($request->filled('booking_id')) {
            $query->where('booking_id', $request->query('booking_id'));
        }

        if ($request->filled('job_post_id')) {
            $query->where('job_post_id', $request->query('job_post_id'));
        }

        $limit    = (int) $request->query('limit', 20);
        $payments = $query->paginate($limit);

        return response()->json(['data' => $payments], 200);
    }

    /**
     * Admin manually updates payment status.
     */
    public function adminUpdateStatus(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 1) {
             return response()->json(['message' => 'Only administrators can update payment status.'], 403);
        }

        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        $fields = $request->validate([
            'status' => 'required|string|in:pending,completed,failed,refunded',
        ]);

        $updateData = ['status' => $fields['status']];
        if ($fields['status'] === 'completed' && !$payment->paid_at) {
             $updateData['paid_at'] = now();
        }

        $payment->update($updateData);

        return response()->json([
            'message' => 'Payment status updated.',
            'data'    => $payment->fresh(),
        ], 200);
    }
}
