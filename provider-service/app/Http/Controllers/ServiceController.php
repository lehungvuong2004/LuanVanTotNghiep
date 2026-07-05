<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServiceCategory;
use App\Models\Service;

class ServiceController extends Controller
{
    // =====================================================================
    //  PUBLIC — Không cần đăng nhập
    // =====================================================================

    /**
     * Danh sách danh mục dịch vụ đang hoạt động (public).
     */
    public function listCategories(Request $request)
    {
        $query = ServiceCategory::with([
            'services' => fn($q) => $q->where('status', 'active')
        ])->withCount('services');

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        $categories = $query->where('status', 'active')
                            ->orderBy('name')
                            ->get();

        return response()->json(['data' => $categories], 200);
    }

    /**
     * Chi tiết 1 danh mục (kèm danh sách dịch vụ active).
     */
    public function showCategory($id)
    {
        $category = ServiceCategory::with(['services' => fn($q) => $q->where('status', 'active')])
                                   ->where('status', 'active')
                                   ->find($id);

        if (!$category) {
            return response()->json(['message' => 'Không tìm thấy danh mục.'], 404);
        }

        return response()->json(['data' => $category], 200);
    }

    /**
     * Danh sách dịch vụ đang hoạt động (public).
     * Filter: category_id, price_type, min_price, max_price
     */
    public function listServices(Request $request)
    {
        $query = Service::with('category')->where('status', 'active');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->filled('price_type')) {
            $query->where('price_type', $request->query('price_type'));
        }

        if ($request->filled('min_price')) {
            $query->where('base_price', '>=', (float) $request->query('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('base_price', '<=', (float) $request->query('max_price'));
        }

        if ($request->filled('city')) {
            $city = $request->query('city');
            $query->whereHas('helperSkills.helperProfile', function($q) use ($city) {
                $q->where('status', 'active')
                  ->whereHas('workingAreas', fn($w) => $w->where('city', $city));
            });
        }

        if ($request->filled('district')) {
            $district = $request->query('district');
            $query->whereHas('helperSkills.helperProfile', function($q) use ($district) {
                $q->where('status', 'active')
                  ->whereHas('workingAreas', fn($w) => $w->where('district', $district));
            });
        }

        $limit    = (int) $request->query('limit', 50);
        $services = $query->orderBy('name')->paginate($limit);

        return response()->json(['data' => $services], 200);
    }

    /**
     * Chi tiết 1 dịch vụ (public).
     */
    public function showService($id)
    {
        $service = Service::with('category')
                          ->where('status', 'active')
                          ->find($id);

        if (!$service) {
            return response()->json(['message' => 'Không tìm thấy dịch vụ.'], 404);
        }

        return response()->json(['data' => $service], 200);
    }

    // =====================================================================
    //  ADMIN — Quản lý danh mục & dịch vụ (role_id = 1)
    // =====================================================================

    // -- CATEGORIES --

    public function adminListCategories(Request $request)
    {
        if ($request->authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $query = ServiceCategory::withCount('services');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        return response()->json(['data' => $query->orderBy('name')->get()], 200);
    }

    public function createCategory(Request $request)
    {
        if ($request->authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $fields = $request->validate([
            'name'        => 'required|string|max:100|unique:service_categories,name',
            'description' => 'nullable|string|max:500',
            'icon'        => 'nullable|string|max:255',
            'type'        => 'sometimes|string|in:booking,job,both',
            'status'      => 'sometimes|string|in:active,inactive',
        ], [
            'name.unique' => 'Tên danh mục đã tồn tại.',
        ]);

        $category = ServiceCategory::create($fields);

        return response()->json([
            'message' => 'Tạo danh mục thành công.',
            'data'    => $category,
        ], 201);
    }

    public function updateCategory(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $category = ServiceCategory::find($id);
        if (!$category) return response()->json(['message' => 'Không tìm thấy danh mục.'], 404);

        $fields = $request->validate([
            'name'        => 'sometimes|required|string|max:100|unique:service_categories,name,' . $id,
            'description' => 'sometimes|nullable|string|max:500',
            'icon'        => 'sometimes|nullable|string|max:255',
            'type'        => 'sometimes|string|in:booking,job,both',
            'status'      => 'sometimes|string|in:active,inactive',
        ]);

        $category->update($fields);

        return response()->json([
            'message' => 'Cập nhật danh mục thành công.',
            'data'    => $category,
        ], 200);
    }

    public function deleteCategory(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $category = ServiceCategory::find($id);
        if (!$category) return response()->json(['message' => 'Không tìm thấy danh mục.'], 404);

        // Kiểm tra còn service đang dùng danh mục này không
        if ($category->services()->exists()) {
            return response()->json(['message' => 'Không thể xóa danh mục đang có dịch vụ.'], 409);
        }

        $category->delete();
        return response()->json(['message' => 'Xóa danh mục thành công.'], 200);
    }

    // -- SERVICES --

    public function adminListServices(Request $request)
    {
        if ($request->authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $query = Service::with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $limit    = (int) $request->query('limit', 20);
        $services = $query->orderBy('name')->paginate($limit);

        return response()->json(['data' => $services], 200);
    }

    public function createService(Request $request)
    {
        if ($request->authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $fields = $request->validate([
            'category_id' => 'required|integer|exists:service_categories,id',
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'base_price'  => 'required|numeric|min:0',
            'price_type'  => 'required|string|in:hourly,fixed,daily',
            'status'      => 'sometimes|string|in:active,inactive',
        ]);

        $service = Service::create($fields);

        return response()->json([
            'message' => 'Tạo dịch vụ thành công.',
            'data'    => $service->load('category'),
        ], 201);
    }

    public function updateService(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $service = Service::find($id);
        if (!$service) return response()->json(['message' => 'Không tìm thấy dịch vụ.'], 404);

        $fields = $request->validate([
            'category_id' => 'sometimes|integer|exists:service_categories,id',
            'name'        => 'sometimes|required|string|max:100',
            'description' => 'sometimes|nullable|string',
            'base_price'  => 'sometimes|required|numeric|min:0',
            'price_type'  => 'sometimes|string|in:hourly,fixed,daily',
            'status'      => 'sometimes|string|in:active,inactive',
        ]);

        $service->update($fields);

        return response()->json([
            'message' => 'Cập nhật dịch vụ thành công.',
            'data'    => $service->load('category'),
        ], 200);
    }

    public function deleteService(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $service = Service::find($id);
        if (!$service) return response()->json(['message' => 'Không tìm thấy dịch vụ.'], 404);

        $service->delete(); // Thực hiện xóa cứng khỏi database
        return response()->json(['message' => 'Xóa dịch vụ thành công.'], 200);
    }
}
