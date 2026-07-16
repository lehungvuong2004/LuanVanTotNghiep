<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;
use Symfony\Component\HttpFoundation\Response;
use App\Constants\Role;

class ContactController extends Controller
{
  /**
   * Lấy danh sách liên hệ (Admin + Operator).
   * Filter: status (pending|processed)
   */
  public function index(Request $request)
  {
    $query = Contact::query();

    if ($request->filled('status')) {
      $query->where('status', $request->query('status'));
    }

    if ($request->filled('search')) {
      $search = $request->query('search');
      $query->where(function ($q) use ($search) {
        $q->where('full_name', 'like', "%{$search}%")
          ->orWhere('email', 'like', "%{$search}%")
          ->orWhere('phone', 'like', "%{$search}%");
      });
    }

    $limit = (int) $request->query('limit', 15);
    $contacts = $query->orderBy('id', 'desc')->paginate($limit);

    return response()->json([
      'data' => $contacts
    ], Response::HTTP_OK);
  }

  /**
   * Khách hàng gửi liên hệ mới (Public).
   */
  public function store(Request $request)
  {
    $fields = $request->validate([
      'full_name' => 'required|string|max:100',
      'phone'     => 'nullable|string|max:20',
      'email'     => 'required|email|max:191',
      'message'   => 'required|string',
    ], [
      'full_name.required' => 'Vui lòng nhập họ tên.',
      'email.required'     => 'Vui lòng nhập email.',
      'email.email'        => 'Email không đúng định dạng.',
      'message.required'   => 'Vui lòng nhập tin nhắn.',
    ]);

    $contact = Contact::create([
      'full_name' => $fields['full_name'],
      'phone'     => $fields['phone'] ?? null,
      'email'     => $fields['email'],
      'message'   => $fields['message'],
      'status'    => 'pending',
    ]);

    return response()->json([
      'message' => 'Gửi liên hệ thành công.',
      'data'    => $contact
    ], Response::HTTP_CREATED);
  }

  /**
   * Xử lý yêu cầu liên hệ (Admin + Operator).
   */
  public function process(Request $request, $id)
  {
    $contact = Contact::find($id);
    if (!$contact) {
      return response()->json(['message' => 'Không tìm thấy liên hệ.'], Response::HTTP_NOT_FOUND);
    }

    $authUser = auth('api')->user();
    if (!$authUser) {
      return response()->json(['message' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
    }

    $contact->update([
      'status'       => 'processed',
      'processed_by' => $authUser->id,
      'processed_at' => now(),
    ]);

    return response()->json([
      'message' => 'Xử lý liên hệ thành công.',
      'data'    => $contact
    ], Response::HTTP_OK);
  }

  /**
   * Xóa yêu cầu liên hệ (Chỉ Admin).
   */
  public function destroy($id)
  {
    $contact = Contact::find($id);
    if (!$contact) {
      return response()->json(['message' => 'Không tìm thấy liên hệ.'], Response::HTTP_NOT_FOUND);
    }

    $contact->delete();

    return response()->json([
      'message' => 'Xóa liên hệ thành công.'
    ], Response::HTTP_OK);
  }
}
