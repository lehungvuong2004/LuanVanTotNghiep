<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class ChatbotPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'chatbot_knowledge.view', 'module' => 'chatbot', 'description' => 'Xem tri thức chatbot RAG'],
    ['name' => 'chatbot_knowledge.create', 'module' => 'chatbot', 'description' => 'Thêm mới/Import tri thức chatbot RAG'],
    ['name' => 'chatbot_knowledge.update', 'module' => 'chatbot', 'description' => 'Chỉnh sửa/Đồng bộ tri thức chatbot RAG'],
    ['name' => 'chatbot_knowledge.delete', 'module' => 'chatbot', 'description' => 'Xóa tri thức chatbot RAG'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
