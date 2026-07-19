<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    // =====================================================================
    //  CUSTOMER & HELPER — Submit a report
    // =====================================================================

    /**
     * Submit a violation report.
     * Any authenticated user (customer or helper) may report.
     */
    public function store(Request $request)
    {
        if ($unauthorized = $this->authorizeRoles($request, [Role::CUSTOMER, Role::HELPER], 'Chỉ khách hàng và người giúp việc mới có thể gửi báo cáo vi phạm.')) {
            return $unauthorized;
        }

        $fields = $request->validate([
            'booking_id'       => 'nullable|integer|exists:bookings,id',
            'job_post_id'      => 'nullable|integer|exists:job_posts,id',
            'reported_user_id' => 'nullable|integer',
            'reason'           => 'required|string|max:1000',
        ]);

        if (empty($fields['booking_id']) && empty($fields['job_post_id'])) {
            return $this->errorResponse('Báo cáo phải được gắn với một đơn đặt lịch hoặc bài đăng công việc.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Prevent self-reporting
        if (isset($fields['reported_user_id']) && $fields['reported_user_id'] == $request->authUser['id']) {
            return $this->errorResponse('Bạn không thể tự báo cáo chính mình.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $report = Report::create([
            'booking_id'       => $fields['booking_id'] ?? null,
            'job_post_id'      => $fields['job_post_id'] ?? null,
            'report_by'        => $request->authUser['id'],
            'reported_user_id' => $fields['reported_user_id'] ?? null,
            'reason'           => $fields['reason'],
            'status'           => 'pending',
        ]);

        return $this->successResponse($report, 'Đã gửi báo cáo. Ban quản trị sẽ kiểm tra và xử lý sớm nhất.', Response::HTTP_CREATED);
    }

    // =====================================================================
    //  ADMIN / OPERATOR — Manage reports
    // =====================================================================

    /**
     * List all violation reports.
     * Role: admin (1) or operator (4)
     */
    public function adminIndex(Request $request)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $query = Report::orderByDesc('created_at');

        if ($request->filled('status'))            $query->where('status', $request->query('status'));
        if ($request->filled('report_by'))         $query->where('report_by', $request->query('report_by'));
        if ($request->filled('reported_user_id'))  $query->where('reported_user_id', $request->query('reported_user_id'));
        if ($request->filled('booking_id'))        $query->where('booking_id', $request->query('booking_id'));

        $limit   = $request->integer('limit', 20);
        $reports = $query->paginate($limit);

        return $this->successResponse($reports);
    }

    public function adminShow(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $report = Report::with(['booking', 'jobPost'])->find($id);
        if (!$report) return $this->notFoundResponse('Không tìm thấy báo cáo vi phạm.');

        return $this->successResponse($report);
    }

    /**
     * Process (resolve or dismiss) a report.
     * Role: admin (1) or operator (4)
     */
    public function process(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $report = Report::find($id);
        if (!$report) return $this->notFoundResponse('Không tìm thấy báo cáo vi phạm.');

        if ($report->status !== 'pending') {
            return $this->errorResponse("Báo cáo đã ở trạng thái '{$report->status}'.", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $fields = $request->validate([
            'status' => 'required|string|in:resolved,dismissed',
            'note'   => 'nullable|string|max:500',
        ]);

        $report->update(['status' => $fields['status']]);

        return $this->successResponse($report->fresh(), 'Đã xử lý báo cáo vi phạm thành công.');
    }

    /**
     * Delete a report.
     */
    public function destroy(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $report = Report::find($id);
        if (!$report) return $this->notFoundResponse('Không tìm thấy báo cáo vi phạm.');

        $report->delete();

        return $this->successResponse(null, 'Đã xóa báo cáo vi phạm.');
    }

    /**
     * Bulk delete reports.
     */
    public function bulkDestroy(Request $request)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $fields = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:reports,id',
        ]);

        Report::whereIn('id', $fields['ids'])->delete();

        return $this->successResponse(null, 'Đã xóa danh sách báo cáo vi phạm thành công.');
    }
}
