<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserToken;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{

  public function login(Request $request)
  {
    $request->validate([
      'email'    => 'required|string',
      'password' => 'required|string',
    ]);

    $credentials = [
      'email'    => $request->input('email'),
      'password' => $request->input('password'),
    ];

    /** @var \Tymon\JWTAuth\JWTGuard $auth */
    $auth = auth('api');
    if (!$token = $auth->attempt($credentials)) {
      return response()->json([
        'message' => 'Sai email hoặc mật khẩu.'
      ], 401);
    }

    $user = auth('api')->user();
    if ($user->status !== 'active') {
      $auth->logout();
      return response()->json([
        'message' => 'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ hỗ trợ.'
      ], 403);
    }

    return $this->responseWithToken($token, $user);
  }

  // đăng ký
  public function register(Request $request)
  {
    $fields = $request->validate([
      'full_name' => 'required|string|min:2|max:50',
      'email'     => 'required|string|email|max:191|unique:users,email',
      'phone'     => ['required', 'string', 'regex:/^(0[3|5|7|8|9])[0-9]{8}$/', 'unique:users,phone'],
      'password'  => [
        'required',
        'string',
        'min:6',
        'max:32',
        function ($attribute, $value, $fail) {
          if (preg_match('/\s/', $value))          $fail('Mật khẩu không được chứa khoảng trắng.');
          if (!preg_match('/[A-Z]/', $value))      $fail('Mật khẩu phải chứa ít nhất 1 ký tự in hoa.');
          if (!preg_match('/[a-z]/', $value))      $fail('Mật khẩu phải chứa ít nhất 1 ký tự in thường.');
          if (!preg_match('/[0-9]/', $value))      $fail('Mật khẩu phải chứa ít nhất 1 ký tự số.');
        }
      ],
    ], [
      'full_name.required' => 'Vui lòng nhập họ và tên.',
      'full_name.min'      => 'Họ và tên phải có ít nhất 2 ký tự.',
      'full_name.max'      => 'Họ và tên không được vượt quá 50 ký tự.',
      'email.required'     => 'Vui lòng nhập email.',
      'email.email'        => 'Vui lòng nhập đúng định dạng email.',
      'email.unique'       => 'Email này đã được đăng ký sử dụng.',
      'phone.required'     => 'Vui lòng nhập số điện thoại.',
      'phone.regex'        => 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09).',
      'phone.unique'       => 'Số điện thoại này đã được đăng ký sử dụng.',
      'password.required'  => 'Vui lòng nhập mật khẩu.',
      'password.min'       => 'Mật khẩu phải có ít nhất 6 ký tự.',
      'password.max'       => 'Mật khẩu không được vượt quá 32 ký tự.',
    ]);

    $user = User::create([
      'role_id'  => 4, // Customer
      'full_name' => $fields['full_name'],
      'email'    => $fields['email'],
      'phone'    => $fields['phone'],
      'password' => Hash::make($fields['password']),
      'status'   => 'active',
    ]);

    $token = auth('api')->login($user);

    return $this->responseWithToken($token, $user);
  }

  /**
   * Đăng nhập / Đăng ký qua Google OAuth.
   */
  public function googleLogin(Request $request)
  {
    $token  = $request->input('token');
    $action = $request->input('action', 'login');

    if (!$token) {
      return response()->json(['error' => 'Token is required'], 400);
    }

    try {
      $response = Http::withoutVerifying()->withHeaders([
        'Authorization' => 'Bearer ' . $token,
      ])->get('https://www.googleapis.com/oauth2/v3/userinfo');

      if ($response->failed()) {
        return response()->json(['error' => 'Invalid Google token'], 401);
      }

      $googleUser = $response->json();

      $user = User::where('google_id', $googleUser['sub'])
        ->orWhere('email', $googleUser['email'])
        ->first();

      if ($action === 'login') {
        if (!$user) {
          return response()->json([
            'message' => 'Tài khoản Google này chưa được đăng ký trên hệ thống. Vui lòng đăng ký trước.'
          ], 400);
        }

        $user->update([
          'google_id' => $googleUser['sub'],
          'provider'  => 'google',
          'avatar'    => $user->avatar ?: ($googleUser['picture'] ?? null),
        ]);
      } else {
        // action = 'register'
        if ($user) {
          return response()->json([
            'message' => 'Tài khoản Google này đã được đăng ký. Vui lòng đăng nhập.'
          ], 400);
        }

        $user = User::create([
          'role_id'   => 4, // Customer
          'full_name' => $googleUser['name'] ?? (($googleUser['given_name'] ?? '') . ' ' . ($googleUser['family_name'] ?? '')),
          'email'     => $googleUser['email'],
          'google_id' => $googleUser['sub'],
          'provider'  => 'google',
          'avatar'    => $googleUser['picture'] ?? null,
          'password'  => null,
          'status'    => 'active',
        ]);
      }

      $jwtToken = auth('api')->login($user);
      return $this->responseWithToken($jwtToken, $user);
    } catch (\Exception $e) {
      return response()->json(['error' => 'Xác thực Google thất bại: ' . $e->getMessage()], 500);
    }
  }

  /**
   * Gửi OTP quên mật khẩu.
   */
  public function forgotPassword(Request $request)
  {
    $request->validate([
      'email' => 'required|email|exists:users,email',
    ], [
      'email.required' => 'Vui lòng nhập email.',
      'email.email'    => 'Định dạng email không hợp lệ.',
      'email.exists'   => 'Email này không tồn tại trong hệ thống.',
    ]);

    $email = $request->input('email');
    $otp   = sprintf("%06d", mt_rand(100000, 999999));

    Cache::put('password_reset_otp_' . $email, $otp, 900);
    \Log::info("Mã OTP cho {$email} là: {$otp}");

    try {
      Mail::raw("Mã OTP khôi phục mật khẩu của bạn là: {$otp}. Mã này có hiệu lực trong vòng 15 phút.", function ($message) use ($email) {
        $message->to($email)->subject("Khôi phục mật khẩu - Gia Đình Việt");
      });
    } catch (\Exception $e) {
      \Log::info("Không thể gửi email OTP tới {$email}. Mã OTP test là: {$otp}. Chi tiết: " . $e->getMessage());
      return response()->json([
        'message' => 'Mã OTP đã được tạo. Vì chưa cấu hình SMTP nên bạn hãy kiểm tra mã OTP tại file log: storage/logs/laravel.log. Mã OTP test là: ' . $otp
      ], 200);
    }

    return response()->json(['message' => 'Mã OTP đã được gửi đến email của bạn.'], 200);
  }

  /**
   * Xác nhận mã OTP.
   */
  public function verifyOtp(Request $request)
  {
    $request->validate([
      'email' => 'required|email',
      'otp'   => 'required|string|size:6',
    ], [
      'otp.size' => 'Mã OTP phải có đúng 6 chữ số.',
    ]);

    $email     = $request->input('email');
    $otp       = $request->input('otp');
    $cachedOtp = Cache::get('password_reset_otp_' . $email);

    if (!$cachedOtp) {
      return response()->json(['message' => 'Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại yêu cầu.'], 400);
    }

    if ($cachedOtp !== $otp) {
      return response()->json(['message' => 'Mã OTP không chính xác.'], 400);
    }

    return response()->json(['message' => 'Xác thực OTP thành công.'], 200);
  }

  /**
   * Đặt lại mật khẩu mới.
   */
  public function resetPassword(Request $request)
  {
    $request->validate([
      'email'    => 'required|email|exists:users,email',
      'otp'      => 'required|string|size:6',
      'password' => 'required|string|min:6|confirmed',
    ], [
      'password.min'       => 'Mật khẩu phải có ít nhất 6 ký tự.',
      'password.confirmed' => 'Xác nhận mật khẩu không khớp.',
    ]);

    $email     = $request->input('email');
    $otp       = $request->input('otp');
    $cachedOtp = Cache::get('password_reset_otp_' . $email);

    if (!$cachedOtp || $cachedOtp !== $otp) {
      return response()->json(['message' => 'Xác thực mã OTP không hợp lệ hoặc đã hết hạn.'], 400);
    }

    $user = User::where('email', $email)->first();
    if ($user) {
      $user->update(['password' => Hash::make($request->input('password'))]);
    }

    Cache::forget('password_reset_otp_' . $email);

    return response()->json(['message' => 'Đặt lại mật khẩu thành công.'], 200);
  }

    // =====================================================================
    //  AUTH — REQUIRES TOKEN
    // =====================================================================

  /**
   * Refresh JWT token bằng refresh_token lưu trong DB.
   */
  public function refreshToken(Request $request)
  {
    $request->validate([
      'refresh_token' => 'required|string',
    ]);

    $tokenRecord = UserToken::where('refresh_token', $request->input('refresh_token'))
      ->where('refresh_token_expires_at', '>', now())
      ->first();

    if (!$tokenRecord) {
      return response()->json(['message' => 'Refresh token không hợp lệ hoặc đã hết hạn.'], 401);
    }

    $user = User::find($tokenRecord->user_id);
    if (!$user || $user->status !== 'active') {
      return response()->json(['message' => 'Tài khoản không tồn tại hoặc đã bị khoá.'], 403);
    }

    // Xoá refresh token cũ
    $tokenRecord->delete();
    // Cấp JWT mới
    $newJwt = auth('api')->login($user);

    return $this->responseWithToken($newJwt, $user);
  }

  /**
   * Logout — Xoá JWT và refresh token khỏi DB.
   */
  public function logout(Request $request)
  {
    $user = auth('api')->user();
    if (!$user) {
      return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    // Xoá refresh token liên quan nếu client truyền lên
    if ($request->has('refresh_token')) {
      UserToken::where('user_id', $user->id)
        ->where('refresh_token', $request->input('refresh_token'))
        ->delete();
    }

    auth('api')->logout();

    return response()->json(['message' => 'Đăng xuất thành công.'], 200);
  }

    // =====================================================================
    //  PROFILE — Mọi role đăng nhập đều dùng được
    // =====================================================================

  /**
   * Lấy thông tin cá nhân của chính mình.
   */
  public function getProfile()
  {
    $user = auth('api')->user();
    if (!$user) {
      return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    $user->load('role');
    return response()->json(['data' => $user], 200);
  }

  /**
   * Cập nhật thông tin cá nhân (full_name, phone, avatar, password)., thiếu cập nhật gmail à ? 
   */
  public function updateProfile(Request $request)
  {
    $user = auth('api')->user();
    if (!$user) {
      return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    $fields = $request->validate([
      'full_name' => 'sometimes|required|string|max:100',
      'phone'     => 'sometimes|nullable|string|max:20|unique:users,phone,' . $user->id,
      'avatar'    => 'sometimes|nullable|string',
      'password'  => [
        'sometimes',
        'required',
        'string',
        'min:6',
        'max:32',
        function ($attribute, $value, $fail) {
          if (preg_match('/\s/', $value))     $fail('Mật khẩu không được chứa khoảng trắng.');
          if (!preg_match('/[A-Z]/', $value)) $fail('Mật khẩu phải chứa ít nhất 1 ký tự in hoa.');
          if (!preg_match('/[a-z]/', $value)) $fail('Mật khẩu phải chứa ít nhất 1 ký tự in thường.');
          if (!preg_match('/[0-9]/', $value)) $fail('Mật khẩu phải chứa ít nhất 1 ký tự số.');
        }
      ],
    ], [
      'phone.unique' => 'Số điện thoại này đã được đăng ký sử dụng.',
    ]);

    if (isset($fields['password'])) {
      $fields['password'] = Hash::make($fields['password']);
    }

    $user->update($fields);
    $user->load('role');

    return response()->json([
      'message' => 'Cập nhật thông tin cá nhân thành công.',
      'data'    => $user
    ], 200);
  }

    // =====================================================================
    //  ADMIN — Quản lý Users (Chỉ Admin role_id = 1)
    // =====================================================================

  /**
   * Lấy danh sách users — CHỈ ADMIN (role_id = 1).
   * Hỗ trợ filter: role_id, status, search (name/email), và phân trang.
   */
  public function getUsers(Request $request)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser) {
      return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    // Chỉ Admin mới được phép xem danh sách toàn bộ users
    if ($currentUser->role_id !== 1) {
      return response()->json([
        'message' => 'Bạn không có quyền truy cập danh sách người dùng.'
      ], 403);
    }

    // Gọi nội bộ lấy danh sách user_id đã có profile helper
    $helperUserIds = [];
    try {
      $response = \Illuminate\Support\Facades\Http::timeout(3)
        ->get('http://provider-service:8000/api/providers/helper-user-ids');
      if ($response->successful()) {
        $helperUserIds = $response->json() ?? [];
      }
    } catch (\Exception $e) {
      // ignore
    }

    $query = User::with('role')
      ->whereNotIn('id', $helperUserIds)
      ->where('role_id', 4);

    // Filter theo status (active | inactive | banned)
    if ($request->filled('status')) {
      $query->where('status', $request->query('status'));
    }

    // Tìm kiếm theo tên hoặc email
    if ($request->filled('search')) {
      $search = $request->query('search');
      $query->where(function ($q) use ($search) {
        $q->where('full_name', 'like', "%{$search}%")
          ->orWhere('email', 'like', "%{$search}%")
          ->orWhere('phone', 'like', "%{$search}%");
      });
    }

    $limit = (int) $request->query('limit', 20);
    $users = $query->orderBy('id', 'desc')->paginate($limit);

    $roleCounts = User::select('role_id', DB::raw('count(*) as count'))
        ->groupBy('role_id')
        ->pluck('count', 'role_id')
        ->toArray();

    return response()->json([
      'type' => 'all',
      'data' => $users,
      'role_counts' => [
          'admin' => $roleCounts[1] ?? 0,
          'operator' => $roleCounts[2] ?? 0,
          'helper' => $roleCounts[3] ?? 0,
          'customer' => $roleCounts[4] ?? 0,
          'total' => array_sum($roleCounts),
      ]
    ], 200);
  }

  /**
   * Lấy chi tiết 1 user — CHỈ ADMIN.
   */
  public function getUser($id)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser) {
      return response()->json(['message' => 'Unauthenticated.'], 401);
    }
    if ($currentUser->role_id !== 1) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
    }
    $user = User::with('role')->find($id);
    if (!$user) {
      return response()->json(['message' => 'Không tìm thấy người dùng.'], 404);
    }

    return response()->json(['data' => $user], 200);
  }

  /**
   * Admin tạo user mới (có thể tạo Helper, Operator, v.v.) — CHỈ ADMIN.
   */
  public function createUser(Request $request)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser || $currentUser->role_id !== 1) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
    }

    $fields = $request->validate([
      'role_id'   => 'required|integer|exists:roles,id',
      'full_name' => 'required|string|min:2|max:100',
      'email'     => 'required|string|email|max:191|unique:users,email',
      'phone'     => 'nullable|string|max:20|unique:users,phone',
      'password'  => 'required|string|min:6|max:32',
      'status'    => 'sometimes|string|in:active,inactive,banned',
      'avatar'    => 'nullable|string',
    ], [
      'email.unique' => 'Email này đã được đăng ký sử dụng.',
      'phone.unique' => 'Số điện thoại này đã được đăng ký sử dụng.',
    ]);

    $user = User::create([
      'role_id'   => $fields['role_id'],
      'full_name' => $fields['full_name'],
      'email'     => $fields['email'],
      'phone'     => $fields['phone'] ?? null,
      'password'  => Hash::make($fields['password']),
      'status'    => $fields['status'] ?? 'active',
      'avatar'    => $fields['avatar'] ?? null,
    ]);

    $user->load('role');

    return response()->json([
      'message' => 'Tạo người dùng thành công.',
      'data'    => $user
    ], 201);
  }

  /**
   * Admin cập nhật thông tin user khác — CHỈ ADMIN.
   */
  public function updateUser(Request $request, $id)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser || $currentUser->role_id !== 1) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
    }

    $user = User::find($id);
    if (!$user) {
      return response()->json(['message' => 'Không tìm thấy người dùng.'], 404);
    }

    $fields = $request->validate([
      'role_id'   => 'sometimes|required|integer|exists:roles,id',
      'full_name' => 'sometimes|required|string|max:100',
      'phone'     => 'sometimes|nullable|string|max:20|unique:users,phone,' . $id,
      'avatar'    => 'sometimes|nullable|string',
    ], [
      'phone.unique' => 'Số điện thoại này đã được đăng ký sử dụng.',
    ]);

    $user->update($fields);
    $user->load('role');

    return response()->json([
      'message' => 'Cập nhật thông tin người dùng thành công.',
      'data'    => $user
    ], 200);
  }

  /**
   * Admin khoá / mở khoá user — CHỈ ADMIN.
   * Body: { "status": "active" | "inactive" | "banned", "reason": "..." }
   */
  public function toggleUserStatus(Request $request, $id)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser || $currentUser->role_id !== 1) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
    }

    if ($currentUser->id == $id) {
      return response()->json(['message' => 'Bạn không thể tự thay đổi trạng thái tài khoản của chính mình.'], 400);
    }

    $user = User::find($id);
    if (!$user) {
      return response()->json(['message' => 'Không tìm thấy người dùng.'], 404);
    }

    $request->validate([
      'status' => 'required|string|in:active,inactive,banned',
      'reason' => 'nullable|string|max:255',
    ]);

    $user->update(['status' => $request->input('status')]);

    // Nếu bị khoá → xoá hết refresh tokens để buộc đăng xuất
    if ($request->input('status') !== 'active') {
      DB::table('user_tokens')->where('user_id', $id)->delete();
    }

    $user->load('role');

    return response()->json([
      'message' => 'Cập nhật trạng thái tài khoản thành công.',
      'data'    => $user
    ], 200);
  }

  /**
   * Admin xóa user — CHỈ ADMIN.
   */
  public function deleteUser($id)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser || $currentUser->role_id !== 1) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
    }

    if ($currentUser->id == $id) {
      return response()->json(['message' => 'Bạn không thể tự xóa tài khoản của chính mình.'], 400);
    }

    $user = User::find($id);
    if (!$user) {
      return response()->json(['message' => 'Không tìm thấy người dùng.'], 404);
    }

    DB::table('user_tokens')->where('user_id', $id)->delete();
    $user->delete();

    return response()->json(['message' => 'Xóa người dùng thành công.'], 200);
  }

  /**
   * Admin xóa hàng loạt users — CHỈ ADMIN.
   */
  public function bulkDeleteUsers(Request $request)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser || $currentUser->role_id !== 1) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
    }

    $request->validate([
      'ids' => 'required|array',
      'ids.*' => 'integer|exists:users,id',
    ]);

    $ids = $request->input('ids');

    if (in_array($currentUser->id, $ids)) {
      return response()->json(['message' => 'Bạn không thể tự xóa tài khoản của chính mình trong danh sách chọn.'], 400);
    }

    DB::transaction(function () use ($ids) {
      DB::table('user_tokens')->whereIn('user_id', $ids)->delete();
      User::whereIn('id', $ids)->delete();
    });

    return response()->json(['message' => 'Xóa danh sách người dùng thành công.'], 200);
  }

    // =====================================================================
    //  INTERNAL HELPER
    // =====================================================================

  /**
   * Tạo access token + refresh token và trả về response chuẩn.
   */
  public function responseWithToken($token, $user)
  {
    $refreshToken = Str::random(60);

    DB::table('user_tokens')->insert([
      'user_id'                  => $user->id,
      'refresh_token'            => $refreshToken,
      'refresh_token_expires_at' => now()->addDays(30),
      'created_at'               => now(),
    ]);

    $user->load('role');

    return response()->json([
      'access_token'  => $token,
      'refresh_token' => $refreshToken,
      'token_type'    => 'Bearer',
      'expires_in'    => auth('api')->factory()->getTTL() * 60,
      'user'          => $user,
    ]);
  }

  /**
   * Lấy chi tiết nhiều users theo danh sách IDs — CHỈ ADMIN/OPERATOR.
   */
  public function getUsersByIds(Request $request)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser || !in_array($currentUser->role_id, [1, 2])) {
      return response()->json(['message' => 'Forbidden.'], 403);
    }

    $request->validate([
      'ids' => 'required|array',
      'ids.*' => 'integer'
    ]);

    $ids = $request->input('ids');
    $users = User::with('role')->whereIn('id', $ids)->get();

    return response()->json(['data' => $users], 200);
  }

  /**
   * Tìm kiếm IDs người dùng theo từ khoá (tên, email, sđt) — CHỈ ADMIN/OPERATOR.
   */
  public function searchUserIds(Request $request)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser || !in_array($currentUser->role_id, [1, 2])) {
      return response()->json(['message' => 'Forbidden.'], 403);
    }

    $queryStr = $request->query('query');
    if (empty($queryStr)) {
      return response()->json([], 200);
    }

    $userIds = User::where('full_name', 'like', "%{$queryStr}%")
      ->orWhere('email', 'like', "%{$queryStr}%")
      ->orWhere('phone', 'like', "%{$queryStr}%")
      ->pluck('id')
      ->toArray();

    return response()->json($userIds, 200);
  }
}
