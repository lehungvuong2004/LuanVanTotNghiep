<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Refund;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;

class RefundController extends Controller
{
    /**
     * Customer requests a refund for a payment.
     */
    public function store(Request $request)
    {
        if ($request->authUser['role_id'] !== Role::CUSTOMER) {
            return response()->json(['message' => 'Only customers can request refunds.'], Response::HTTP_FORBIDDEN);
        }

        $fields = $request->validate([
            'payment_id' => 'required|integer|exists:payments,id',
            'amount'     => 'required|numeric|min:0',
            'reason'     => 'nullable|string|max:500',
        ]);

        $payment = Payment::find($fields['payment_id']);

        if ($payment->status !== 'completed') {
             return response()->json(['message' => 'Cannot refund a payment that is not completed.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Check total refunded amount doesn't exceed payment amount
        $totalRefunded = Refund::where('payment_id', $payment->id)
                               ->whereIn('status', ['pending', 'approved', 'completed'])
                               ->sum('amount');

        if (($totalRefunded + $fields['amount']) > $payment->amount) {
            return response()->json(['message' => 'Refund amount exceeds payment amount.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $refund = Refund::create([
            'payment_id' => $fields['payment_id'],
            'amount'     => $fields['amount'],
            'reason'     => $fields['reason'] ?? null,
            'status'     => 'pending',
        ]);

        return response()->json([
            'message' => 'Refund request submitted successfully.',
            'data'    => $refund,
        ], Response::HTTP_CREATED);
    }

    /**
     * List all refunds for a specific payment.
     */
    public function getRefundsByPayment(Request $request, $paymentId)
    {
        // Admin (1), Operator (4), and Customer (2)
        if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR, Role::CUSTOMER])) {
             return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $refunds = Refund::where('payment_id', $paymentId)
                         ->orderByDesc('created_at')
                         ->get();

        return response()->json(['data' => $refunds], Response::HTTP_OK);
    }

    /**
     * Admin/Operator lists all refunds.
     */
    public function adminIndex(Request $request)
    {
        if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $query = Refund::with('payment')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $limit   = (int) $request->query('limit', 20);
        $refunds = $query->paginate($limit);

        return response()->json(['data' => $refunds], Response::HTTP_OK);
    }

    /**
     * Admin/Operator processes a refund (approve, reject, complete).
     */
    public function process(Request $request, $id)
    {
        if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $refund = Refund::find($id);

        if (!$refund) {
            return response()->json(['message' => 'Refund not found.'], Response::HTTP_NOT_FOUND);
        }

        $fields = $request->validate([
            'status' => 'required|string|in:approved,rejected,completed',
        ]);

        $refund->update(['status' => $fields['status']]);

        // If completed, update payment status to 'refunded' if full refund
        if ($fields['status'] === 'completed') {
             $payment = Payment::find($refund->payment_id);
             $totalRefunded = Refund::where('payment_id', $payment->id)
                                    ->where('status', 'completed')
                                    ->sum('amount');
             if ($totalRefunded >= $payment->amount) {
                 $payment->update(['status' => 'refunded']);
             }
        }

        return response()->json([
            'message' => 'Refund status updated.',
            'data'    => $refund->fresh(),
        ], Response::HTTP_OK);
    }
}
