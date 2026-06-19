<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{
    // form login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginValue = $request->input('email');
        $password = $request->input('password');

        // Kiểm tra xem là email hay số điện thoại để cấu hình credentials phù hợp
        $loginField = filter_var($loginValue, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $credentials = [
            $loginField => $loginValue,
            'password' => $password,
        ];

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Sai email, số điện thoại hoặc mật khẩu'
            ], 401);
        }

        return $this->responseWithToken($token, auth('api')->user());
    }

    // form register
    public function register(Request $request)
    {
        $fields = $request->validate([
            'full_name' => 'required|string|min:2|max:50',
            'email' => 'required|string|email|max:191|unique:users,email',
            'phone' => ['required', 'string', 'regex:/^(0[3|5|7|8|9])[0-9]{8}$/', 'unique:users,phone'],
            'password' => [
                'required',
                'string',
                'min:6',
                'max:32',
                function ($attribute, $value, $fail) {
                    if (preg_match('/\s/', $value)) {
                        $fail('Mật khẩu không được chứa khoảng trắng.');
                    }
                    if (!preg_match('/[A-Z]/', $value)) {
                        $fail('Mật khẩu phải chứa ít nhất 1 ký tự in hoa.');
                    }
                    if (!preg_match('/[a-z]/', $value)) {
                        $fail('Mật khẩu phải chứa ít nhất 1 ký tự in thường.');
                    }
                    if (!preg_match('/[0-9]/', $value)) {
                        $fail('Mật khẩu phải chứa ít nhất 1 ký tự số.');
                    }
                }
            ],
        ], [
            'full_name.required' => 'Vui lòng nhập họ và tên.',
            'full_name.min' => 'Họ và tên phải có ít nhất 2 ký tự.',
            'full_name.max' => 'Họ và tên không được vượt quá 50 ký tự.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Vui lòng nhập đúng định dạng email.',
            'email.unique' => 'Email này đã được đăng ký sử dụng.',
            'phone.required' => 'Vui lòng nhập số điện thoại.',
            'phone.regex' => 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09).',
            'phone.unique' => 'Số điện thoại này đã được đăng ký sử dụng.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'password.max' => 'Mật khẩu không được vượt quá 32 ký tự.',
        ]);

        $user = User::create([
            'role_id' => 2, 
            'full_name' => $fields['full_name'],
            'email' => $fields['email'],
            'phone' => $fields['phone'],
            'password' => Hash::make($fields['password']),
            'status' => 'active',
        ]);

        $token = auth('api')->login($user);

        return $this->responseWithToken($token, $user);
    }

    // 2.2. Xử lý sau khi Google trả về kết quả
    public function googleLogin(Request $request)
    {
        $token = $request->input('token');
        $action = $request->input('action', 'login'); // 'login' hoặc 'register'
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
                    'provider' => 'google',
                    'avatar' => $user->avatar ?: ($googleUser['picture'] ?? null),
                ]);
            } else {
                // Đăng ký (action === 'register')
                if ($user) {
                    return response()->json([
                        'message' => 'Tài khoản Google này đã được đăng ký trước đó. Vui lòng đăng nhập.'
                    ], 400);
                }

                $user = User::create([
                    'role_id' => 2, 
                    'full_name' => $googleUser['name'] ?? ($googleUser['given_name'] . ' ' . $googleUser['family_name']),
                    'email' => $googleUser['email'],
                    'google_id' => $googleUser['sub'],
                    'provider' => 'google',
                    'avatar' => $googleUser['picture'] ?? null,
                    'password' => null,
                    'status' => 'active',
                ]);
            }

            $token = auth('api')->login($user);
            return $this->responseWithToken($token, $user);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Xác thực Google thất bại: ' . $e->getMessage()], 500);
        }
    }

   // tạo token và lưu db
    public function responseWithToken($token, $user)
    {
        $refreshToken = Str::random(60);
        
        DB::table('user_tokens')->insert([
            'user_id' => $user->id,
            'refresh_token' => $refreshToken,
            'refresh_token_expires_at' => now()->addDays(30),
            'created_at' => now()
        ]);

        $user->load('role');

        return response()->json([
            'access_token' => $token,
            'refresh_token' => $refreshToken, 
            'token_type' => 'Bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $user
        ]);
    }

    // Lấy danh sách users (Admin lấy hết, User khác chỉ lấy chính mình)
    public function getUsers(Request $request)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Nếu là Admin (role_id === 1) -> Trả về tất cả các users kèm role
        if ($currentUser->role_id === 1) {
            $users = User::with('role')->get();
            return response()->json([
                'type' => 'all',
                'data' => $users
            ], 200);
        }

        // Nếu thuộc các roles còn lại (Customer, Helper, Operator) -> Chỉ trả về thông tin của chính họ
        $currentUser->load('role');
        return response()->json([
            'type' => 'self',
            'data' => $currentUser
        ], 200);
    }

    // Cập nhật thông tin cá nhân (Mọi User đăng nhập đều dùng được)
    public function updateProfile(Request $request)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $fields = $request->validate([
            'full_name' => 'sometimes|required|string|max:100',
            'phone' => 'sometimes|required|string|max:20|unique:users,phone,' . $user->id,
            'avatar' => 'nullable|string',
            'password' => 'sometimes|required|string|min:6',
        ], [
            'phone.unique' => 'Số điện thoại này đã được đăng ký sử dụng.',
        ]);

        if (isset($fields['password'])) {
            $fields['password'] = Hash::make($fields['password']);
        }

        $user->update($fields);

        $user->load('role');
        return response()->json([
            'message' => 'Cập nhật thông tin cá nhân thành công',
            'data' => $user
        ], 200);
    }

    // Admin cập nhật thông tin user khác (Chỉ Admin role_id = 1)
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
            'role_id' => 'sometimes|required|integer',
            'status' => 'sometimes|required|string|in:active,inactive',
            'full_name' => 'sometimes|required|string|max:100',
            'phone' => 'sometimes|required|string|max:20|unique:users,phone,' . $id,
            'avatar' => 'nullable|string',
        ], [
            'phone.unique' => 'Số điện thoại này đã được đăng ký sử dụng.',
        ]);

        $user->update($fields);

        $user->load('role');
        return response()->json([
            'message' => 'Cập nhật thông tin người dùng thành công',
            'data' => $user
        ], 200);
    }

    // Admin xóa user khác (Chỉ Admin role_id = 1)
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

        // Xóa các dữ liệu liên quan để tránh lỗi khóa ngoại (Foreign key constraint)
        DB::table('user_tokens')->where('user_id', $id)->delete();
        
        $user->delete();

        return response()->json([
            'message' => 'Xóa người dùng thành công.'
        ], 200);
    }

    // Yêu cầu OTP quên mật khẩu
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Định dạng email không hợp lệ.',
            'email.exists' => 'Email này không tồn tại trong hệ thống.',
        ]);

        $email = $request->input('email');
        $otp = sprintf("%06d", mt_rand(100000, 999999));

        // Lưu OTP vào Cache với thời hạn 15 phút (900 giây)
        Cache::put('password_reset_otp_' . $email, $otp, 900);
        \Log::info("Mã OTP cho {$email} là: {$otp}");

        // Gửi email chứa OTP
        try {
            Mail::raw("Mã OTP khôi phục mật khẩu của bạn là: {$otp}. Mã này có hiệu lực trong vòng 15 phút.", function ($message) use ($email) {
                $message->to($email)
                        ->subject("Khôi phục mật khẩu - Gia Đình Việt");
            });
        } catch (\Exception $e) {
            // Ghi OTP ra log để nhà phát triển có thể lấy và test nếu chưa cấu hình Gmail SMTP hoặc SMTP bị lỗi
            \Log::info("Không thể gửi email OTP tới {$email} do lỗi mail. Mã OTP test là: {$otp}. Chi tiết lỗi: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Mã OTP đã được tạo thành công trong hệ thống. Vì chưa cấu hình hoặc lỗi gửi mail Gmail SMTP nên email chưa gửi được, bạn hãy kiểm tra mã OTP tại file log: identity-service/storage/logs/laravel.log. Mã OTP test là: ' . $otp
            ], 200);
        }

        return response()->json([
            'message' => 'Mã OTP đã được gửi đến email của bạn.'
        ], 200);
    }

    // Xác nhận mã OTP
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ], [
            'otp.size' => 'Mã OTP phải có đúng 6 chữ số.',
        ]);

        $email = $request->input('email');
        $otp = $request->input('otp');

        $cachedOtp = Cache::get('password_reset_otp_' . $email);

        if (!$cachedOtp) {
            return response()->json([
                'message' => 'Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại yêu cầu.'
            ], 400);
        }

        if ($cachedOtp !== $otp) {
            return response()->json([
                'message' => 'Mã OTP không chính xác.'
            ], 400);
        }

        return response()->json([
            'message' => 'Xác thực OTP thành công.'
        ], 200);
    }

    // Đặt lại mật khẩu mới
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'password.confirmed' => 'Xác nhận mật khẩu không khớp.',
        ]);

        $email = $request->input('email');
        $otp = $request->input('otp');
        $password = $request->input('password');

        $cachedOtp = Cache::get('password_reset_otp_' . $email);

        if (!$cachedOtp || $cachedOtp !== $otp) {
            return response()->json([
                'message' => 'Xác thực mã OTP không hợp lệ hoặc đã hết hạn.'
            ], 400);
        }

        // Cập nhật mật khẩu cho user (đã gỡ cast hashed ở model để an toàn, dùng Hash::make tại đây)
        $user = User::where('email', $email)->first();
        if ($user) {
            $user->update([
                'password' => Hash::make($password)
            ]);
        }

        // Xóa OTP khỏi cache
        Cache::forget('password_reset_otp_' . $email);

        return response()->json([
            'message' => 'Đặt lại mật khẩu thành công.'
        ], 200);
    }
}
