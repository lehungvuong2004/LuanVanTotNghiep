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
     *
     * Body:
     * {
     *   "booking_id": 10,         // nullable
     *   "job_post_id": 5,         // nullable (one of booking or job_post is required)
     *   "reported_user_id": 8,
     *   "reason": "Rude behavior..."
     * }
     */
    public function store(Request $request)
    {
        // All authenticated roles may submit a report (customer=4, helper=3)
        if (!in_array($request->authUser['role_id'], [Role::CUSTOMER, Role::HELPER])) {
            return response()->json(['message' => 'Only customers and helpers can submit reports.'], Response::HTTP_FORBIDDEN);
        }

        $fields = $request->validate([
            'booking_id'       => 'nullable|integer|exists:bookings,id',
            'job_post_id'      => 'nullable|integer|exists:job_posts,id',
            'reported_user_id' => 'nullable|integer',
            'reason'           => 'required|string|max:1000',
        ]);

        if (empty($fields['booking_id']) && empty($fields['job_post_id'])) {
            return response()->json([
                'message' => 'A report must be linked to a booking or a job post.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Prevent self-reporting
        if (isset($fields['reported_user_id']) && $fields['reported_user_id'] == $request->authUser['id']) {
            return response()->json(['message' => 'You cannot report yourself.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $report = Report::create([
            'booking_id'       => $fields['booking_id'] ?? null,
            'job_post_id'      => $fields['job_post_id'] ?? null,
            'report_by'        => $request->authUser['id'],
            'reported_user_id' => $fields['reported_user_id'] ?? null,
            'reason'           => $fields['reason'],
            'status'           => 'pending',
        ]);

        return response()->json([
            'message' => 'Report submitted. Our team will review it shortly.',
            'data'    => $report,
        ], Response::HTTP_CREATED);
    }

    // =====================================================================
    //  ADMIN / OPERATOR — Manage reports
    // =====================================================================

    /**
     * List all violation reports.
     * Role: admin (1) or operator (4)
     * Filter: status, report_by, reported_user_id
     */
    public function adminIndex(Request $request)
    {
        if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $query = Report::orderByDesc('created_at');

        if ($request->filled('status'))            $query->where('status', $request->query('status'));
        if ($request->filled('report_by'))         $query->where('report_by', $request->query('report_by'));
        if ($request->filled('reported_user_id'))  $query->where('reported_user_id', $request->query('reported_user_id'));
        if ($request->filled('booking_id'))        $query->where('booking_id', $request->query('booking_id'));

        $limit   = (int) $request->query('limit', 20);
        $reports = $query->paginate($limit);

        return response()->json(['data' => $reports], Response::HTTP_OK);
    }

    public function adminShow(Request $request, $id)
    {
        if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $report = Report::with(['booking', 'jobPost'])->find($id);
        if (!$report) return response()->json(['message' => 'Report not found.'], Response::HTTP_NOT_FOUND);

        return response()->json(['data' => $report], Response::HTTP_OK);
    }

    /**
     * Process (resolve or dismiss) a report.
     * Role: admin (1) or operator (4)
     *
     * Body: { "status": "resolved" | "dismissed", "note": "..." }
     */
    public function process(Request $request, $id)
    {
        if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $report = Report::find($id);
        if (!$report) return response()->json(['message' => 'Report not found.'], Response::HTTP_NOT_FOUND);

        if ($report->status !== 'pending') {
            return response()->json(['message' => "Report is already '{$report->status}'."], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $fields = $request->validate([
            'status' => 'required|string|in:resolved,dismissed',
            'note'   => 'nullable|string|max:500',
        ]);

        $report->update(['status' => $fields['status']]);

        return response()->json([
            'message' => 'Report processed.',
            'data'    => $report->fresh(),
        ], Response::HTTP_OK);
    }
}
