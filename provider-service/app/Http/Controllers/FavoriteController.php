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
        if ($unauthorized = $this->authorizeCustomer($request)) {
            return $unauthorized;
        }

        $customerId = $request->authUser['id'];
        $limit      = $request->integer('limit', 20);

        $favorites = Favorite::with(['helperProfile.skills.service', 'helperProfile.workingAreas'])
                             ->where('customer_id', $customerId)
                             ->orderByDesc('created_at')
                             ->paginate($limit);

        return $this->successResponse($favorites);
    }

    /**
     * Thêm helper vào danh sách yêu thích.
     * Body: không cần (helper_id truyền qua URL)
     * Role: customer (role_id = 4)
     */
    public function store(Request $request, $helperId)
    {
        if ($unauthorized = $this->authorizeCustomer($request)) {
            return $unauthorized;
        }

        // Kiểm tra helper tồn tại và đang active
        $helper = HelperProfile::where('id', $helperId)->where('status', 'active')->first();
        if (!$helper) {
            return $this->notFoundResponse('Người giúp việc không tồn tại hoặc chưa được kích hoạt.');
        }

        $customerId = $request->authUser['id'];

        $existing = Favorite::where('customer_id', $customerId)
                            ->where('helper_id', $helperId)
                            ->first();

        if ($existing) {
            return $this->errorResponse('Người giúp việc này đã có trong danh sách yêu thích của bạn.', Response::HTTP_CONFLICT);
        }

        $favorite = Favorite::create([
            'customer_id' => $customerId,
            'helper_id'   => $helperId,
        ]);

        return $this->successResponse($favorite, 'Đã thêm vào danh sách yêu thích.', Response::HTTP_CREATED);
    }

    /**
     * Xóa helper khỏi danh sách yêu thích.
     * Role: customer (role_id = 4)
     */
    public function destroy(Request $request, $helperId)
    {
        if ($unauthorized = $this->authorizeCustomer($request)) {
            return $unauthorized;
        }

        $customerId = $request->authUser['id'];

        $favorite = Favorite::where('customer_id', $customerId)
                            ->where('helper_id', $helperId)
                            ->first();

        if (!$favorite) {
            return $this->notFoundResponse('Người giúp việc này không có trong danh sách yêu thích của bạn.');
        }

        $favorite->delete();

        return $this->successResponse(null, 'Đã xóa khỏi danh sách yêu thích.');
    }

    /**
     * Kiểm tra xem 1 helper có trong danh sách yêu thích không.
     * Trả về: { "is_favorite": true/false }
     * Role: customer (role_id = 4)
     */
    public function check(Request $request, $helperId)
    {
        if ($unauthorized = $this->authorizeCustomer($request)) {
            return $unauthorized;
        }

        $isFavorite = Favorite::where('customer_id', $request->authUser['id'])
                              ->where('helper_id', $helperId)
                              ->exists();

        return $this->successResponse(['is_favorite' => $isFavorite]);
    }
}
