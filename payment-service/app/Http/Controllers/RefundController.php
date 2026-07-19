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
        if ($unauthorized = $this->authorizeCustomer($request, 'Chỉ khách hàng mới có thể yêu cầu hoàn tiền.')) {
            return $unauthorized;
        }

        $fields = $request->validate([
            'payment_id' => 'required|integer|exists:payments,id',
            'amount'     => 'required|numeric|min:0',
            'reason'     => 'nullable|string|max:500',
        ]);

        $payment = Payment::find($fields['payment_id']);

        if ($payment->status !== 'completed') {
             return $this->errorResponse('Không thể hoàn tiền cho giao dịch chưa hoàn tất thanh toán.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Check total refunded amount doesn't exceed payment amount
        $totalRefunded = Refund::where('payment_id', $payment->id)
                               ->whereIn('status', ['pending', 'approved', 'completed'])
                               ->sum('amount');

        if (($totalRefunded + $fields['amount']) > $payment->amount) {
            return $this->errorResponse('Số tiền yêu cầu hoàn vượt quá số tiền của thanh toán gốc.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $refund = Refund::create([
            'payment_id' => $fields['payment_id'],
            'amount'     => $fields['amount'],
            'reason'     => $fields['reason'] ?? null,
            'status'     => 'pending',
        ]);

        return $this->successResponse($refund, 'Gửi yêu cầu hoàn tiền thành công.', Response::HTTP_CREATED);
    }

    /**
     * List all refunds for a specific payment.
     */
    public function getRefundsByPayment(Request $request, $paymentId)
    {
        if ($unauthorized = $this->authorizeCustomerOrAdmin($request)) {
             return $unauthorized;
        }

        $refunds = Refund::where('payment_id', $paymentId)
                         ->orderByDesc('created_at')
                         ->get();

        return $this->successResponse($refunds);
    }

    /**
     * Admin/Operator lists all refunds.
     */
    public function adminIndex(Request $request)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $query = Refund::with('payment')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $limit   = $request->integer('limit', 20);
        $refunds = $query->paginate($limit);

        return $this->successResponse($refunds);
    }

    /**
     * Admin/Operator processes a refund (approve, reject, complete).
     */
    public function process(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $refund = Refund::find($id);

        if (!$refund) {
            return $this->notFoundResponse('Không tìm thấy yêu cầu hoàn tiền.');
        }

        $fields = $request->validate([
            'status' => 'required|string|in:approved,rejected,completed',
        ]);

        $refund->update(['status' => $fields['status']]);

        if ($fields['status'] === 'completed') {
             $payment = Payment::find($refund->payment_id);
             $totalRefunded = Refund::where('payment_id', $payment->id)
                                    ->where('status', 'completed')
                                    ->sum('amount');
             if ($totalRefunded >= $payment->amount) {
                 $payment->update(['status' => 'refunded']);
             }
        }

        return $this->successResponse($refund->fresh(), 'Cập nhật trạng thái hoàn tiền thành công.');
    }
}
