<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favorite;
use App\Models\HelperProfile;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;

class FavoriteController extends Controller
{
    /**
     * Danh sách helper yêu thích của Customer đang đăng nhập.
     * Role: customer (role_id = 4)
     */
    public function index(Request $request)
    {
        if ($request->authUser['role_id'] !== Role::CUSTOMER) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Khách hàng.'], Response::HTTP_FORBIDDEN);
        }

        $customerId = $request->authUser['id'];
        $limit      = (int) $request->query('limit', 20);

        $favorites = Favorite::with(['helperProfile.skills.service', 'helperProfile.workingAreas'])
                             ->where('customer_id', $customerId)
                             ->orderByDesc('created_at')
                             ->paginate($limit);

        return response()->json(['data' => $favorites], Response::HTTP_OK);
    }

    /**
     * Thêm helper vào danh sách yêu thích.
     * Body: không cần (helper_id truyền qua URL)
     * Role: customer (role_id = 4)
     */
    public function store(Request $request, $helperId)
    {
        if ($request->authUser['role_id'] !== Role::CUSTOMER) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Khách hàng.'], Response::HTTP_FORBIDDEN);
        }

        // Kiểm tra helper tồn tại và đang active
        $helper = HelperProfile::where('id', $helperId)->where('status', 'active')->first();
        if (!$helper) {
            return response()->json(['message' => 'Helper không tồn tại hoặc chưa được kích hoạt.'], Response::HTTP_NOT_FOUND);
        }

        $customerId = $request->authUser['id'];

        $existing = Favorite::where('customer_id', $customerId)
                            ->where('helper_id', $helperId)
                            ->first();

        if ($existing) {
            return response()->json(['message' => 'Helper này đã có trong danh sách yêu thích của bạn.'], Response::HTTP_CONFLICT);
        }

        $favorite = Favorite::create([
            'customer_id' => $customerId,
            'helper_id'   => $helperId,
        ]);

        return response()->json([
            'message' => 'Đã thêm vào danh sách yêu thích.',
            'data'    => $favorite,
        ], Response::HTTP_CREATED);
    }

    /**
     * Xóa helper khỏi danh sách yêu thích.
     * Role: customer (role_id = 4)
     */
    public function destroy(Request $request, $helperId)
    {
        if ($request->authUser['role_id'] !== Role::CUSTOMER) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Khách hàng.'], Response::HTTP_FORBIDDEN);
        }

        $customerId = $request->authUser['id'];

        $favorite = Favorite::where('customer_id', $customerId)
                            ->where('helper_id', $helperId)
                            ->first();

        if (!$favorite) {
            return response()->json(['message' => 'Helper này không có trong danh sách yêu thích của bạn.'], Response::HTTP_NOT_FOUND);
        }

        $favorite->delete();

        return response()->json(['message' => 'Đã xóa khỏi danh sách yêu thích.'], Response::HTTP_OK);
    }

    /**
     * Kiểm tra xem 1 helper có trong danh sách yêu thích không.
     * Trả về: { "is_favorite": true/false }
     * Role: customer (role_id = 4)
     */
    public function check(Request $request, $helperId)
    {
        if ($request->authUser['role_id'] !== Role::CUSTOMER) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Khách hàng.'], Response::HTTP_FORBIDDEN);
        }

        $isFavorite = Favorite::where('customer_id', $request->authUser['id'])
                              ->where('helper_id', $helperId)
                              ->exists();

        return response()->json(['is_favorite' => $isFavorite], Response::HTTP_OK);
    }
}
