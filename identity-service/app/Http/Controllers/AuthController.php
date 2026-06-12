<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // form login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Sai email hoặc mật khẩu'
            ], 401);
        }

        return $this->responseWithToken($token, auth('api')->user());
    }

    // form register
    public function register(Request $request)
    {
        $fields = $request->validate([
            'full_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:191|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6',
        ], [
            'email.unique' => 'Email này đã được đăng ký sử dụng.',
            'phone.unique' => 'Số điện thoại này đã được đăng ký sử dụng.',
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
}
