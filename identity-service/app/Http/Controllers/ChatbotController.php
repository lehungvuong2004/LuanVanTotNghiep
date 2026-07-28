<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ChatbotKnowledge;

class ChatbotController extends Controller
{
  /**
   * Tra cứu câu hỏi từ Client và liên kết với RAG, n8n, Gemini, hoặc trả lời tự động nội bộ.
   */
  public function query(Request $request)
  {
    $fields = $request->validate([
      'message' => 'required|string|max:1000',
    ]);

    $message = $fields['message'];
    $lowerMsg = mb_strtolower($message, 'UTF-8');
    $normMsg = $this->normalizeText($message);

    // ==== BƯỚC 1: TRUY XUẤT NGỮ CẢNH RAG NỘI BỘ (Local Retrieval from MySQL) ====
    $allKnowledge = [];
    try {
      $allKnowledge = ChatbotKnowledge::all();
    } catch (\Exception $e) {
      Log::error('Chatbot RAG local database query failed (check if table chatbot_knowledges exists): ' . $e->getMessage());
    }

    $scoredKnowledge = [];

    foreach ($allKnowledge as $item) {
      $score = 0;

      // 1. Kiểm tra khớp từ khóa chính (Keyword matching)
      if ($item->keyword) {
        $keywordsList = explode(',', $item->keyword);
        foreach ($keywordsList as $kw) {
          $kwClean = trim(mb_strtolower($kw, 'UTF-8'));
          $kwNorm = $this->normalizeText($kwClean);
          if ($kwClean !== '') {
            // Khớp chính xác hoặc khớp không dấu
            if (str_contains($lowerMsg, $kwClean) || str_contains($normMsg, $kwNorm)) {
              $score += 30; // Cộng điểm lớn cho khớp từ khóa chính
              break;
            }
          }
        }
      }

      $questionClean = mb_strtolower($item->question, 'UTF-8');
      $questionNorm = $this->normalizeText($item->question);
      $contentClean = mb_strtolower($item->content, 'UTF-8');
      $contentNorm = $this->normalizeText($item->content);

      // 2. Kiểm tra khớp toàn bộ câu hỏi (Có dấu và không dấu)
      if (
        str_contains($lowerMsg, $questionClean) || str_contains($questionClean, $lowerMsg) ||
        str_contains($normMsg, $questionNorm) || str_contains($questionNorm, $normMsg)
      ) {
        $score += 15;
      }

      // 3. Tính điểm trùng lặp từ vựng đơn lẻ (Word intersection match)
      $inputWords = explode(' ', $lowerMsg);
      $normWords = explode(' ', $normMsg);

      // Trùng từ có dấu
      foreach ($inputWords as $word) {
        if (mb_strlen($word) > 2) {
          if (str_contains($questionClean, $word)) {
            $score += 4;
          }
          if (str_contains($contentClean, $word)) {
            $score += 1.5;
          }
        }
      }

      // Trùng từ không dấu
      foreach ($normWords as $word) {
        if (mb_strlen($word) > 2) {
          if (str_contains($questionNorm, $word)) {
            $score += 3;
          }
          if (str_contains($contentNorm, $word)) {
            $score += 1;
          }
        }
      }

      if ($score > 0) {
        $scoredKnowledge[] = [
          'item' => $item,
          'score' => $score
        ];
      }
    }

    // Sắp xếp các đoạn tri thức liên quan nhất lên đầu
    usort($scoredKnowledge, function ($a, $b) {
      return $b['score'] <=> $a['score'];
    });

    // Lấy Top 3 đoạn tri thức liên quan nhất
    $topKnowledges = array_slice($scoredKnowledge, 0, 3);

    // Ghép ngữ cảnh (Context)
    $contextText = "";
    $contextData = [];
    if (!empty($topKnowledges)) {
      $contextText = "Dưới đây là một số thông tin tham khảo chính thức về các dịch vụ và chính sách của Gia Đình Việt:\n";
      foreach ($topKnowledges as $k) {
        $item = $k['item'];
        $contextText .= "- " . $item->content . "\n";
        $contextData[] = [
          'question' => $item->question,
          'content' => $item->content,
        ];
      }
    }

    // ==== BƯỚC 2: CHUYỂN TIẾP CHO N8N WORKFLOW ĐỂ XỬ LÝ (Nếu có cấu hình) ====
    $n8nUrl = env('N8N_WORKFLOW_URL');
    if ($n8nUrl) {
      try {
        $response = Http::timeout(10)->post($n8nUrl, [
          'message' => $message,
          'context' => $contextData, // Gửi kèm Top 3 đoạn tri thức tìm được sang n8n
        ]);

        if ($response->successful()) {
          $data = $response->json();
          $reply = $data['response'] ?? $data['output'] ?? $data['reply'] ?? null;
          if ($reply) {
            return $this->successResponse([
              'reply' => $reply,
            ]);
          }
        }
      } catch (\Exception $e) {
        Log::error('Chatbot n8n error: ' . $e->getMessage());
      }
    }

    // ==== BƯỚC 3: GỌI GEMINI API PHÁT SINH PHẢN HỒI THEO NGỮ CẢNH (Nếu có API Key) ====
    $geminiKey = env('GEMINI_API_KEY');
    if ($geminiKey) {
      try {
        $response = Http::timeout(10)
          ->withHeaders(['Content-Type' => 'application/json'])
          ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$geminiKey}", [
            'contents' => [
              [
                'parts' => [
                  ['text' => "Bạn là trợ lý ảo CSKH hỗ trợ trực tuyến của Gia Đình Việt (dịch vụ dọn dẹp, giúp việc nhà, nấu ăn, trông trẻ, chăm sóc người cao tuổi).
Thông tin tham khảo từ hệ thống của chúng tôi:
{$contextText}
Dựa trên thông tin tham khảo trên, hãy trả lời câu hỏi sau của khách hàng một cách ngắn gọn, súc tích, lịch sự và chính xác nhất bằng tiếng Việt. Nếu thông tin tham khảo không liên quan hoặc không đầy đủ để trả lời câu hỏi, hãy tự trả lời ngắn gọn:
Câu hỏi của khách hàng: {$message}"]
                ]
              ]
            ]
          ]);

        if ($response->successful()) {
          $data = $response->json();
          $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
          if ($reply) {
            return $this->successResponse([
              'reply' => $reply,
            ]);
          }
        }
      } catch (\Exception $e) {
        Log::error('Chatbot Gemini error: ' . $e->getMessage());
      }
    }

    // ==== BƯỚC 4: FALLBACK THÔNG MINH TỪ TRI THỨC CỤC BỘ DƯỚI DATABASE ====
    if (!empty($topKnowledges)) {
      // Lấy đoạn tri thức có điểm trùng khớp cao nhất làm câu trả lời chính
      $bestMatch = $topKnowledges[0]['item'];
      $reply = "Dạ chào bạn, theo thông tin của Gia Đình Việt: " . $bestMatch->content;
    } else {
      // Khi không có kết quả phù hợp và các dịch vụ AI bên ngoài lỗi/chưa bật
      $reply = "Chào bạn! Cảm ơn bạn đã quan tâm đến dịch vụ Gia Đình Việt. Câu hỏi tuyển dụng/đặt lịch của bạn hiện chưa được ghi nhận trong cơ sở tri thức tức thời. Xin vui lòng liên hệ hotline (+84) 123-456-789 để được trợ giúp trực tiếp nhé!";
    }

    return $this->successResponse([
      'reply' => $reply,
    ]);
  }

  /**
   * Admin API: Lấy danh sách tri thức Chatbot (Phân trang và Tìm kiếm)
   */
  public function adminIndex(Request $request)
  {
    $q = $request->query('query');
    $query = ChatbotKnowledge::with('creator:id,full_name');

    if (!empty($q)) {
      $query->where('keyword', 'LIKE', "%{$q}%")
        ->orWhere('question', 'LIKE', "%{$q}%")
        ->orWhere('content', 'LIKE', "%{$q}%");
    }

    $knowledges = $query->orderBy('id', 'desc')->paginate(15);
    return $this->successResponse($knowledges);
  }

  /**
   * Admin API: Tạo mới một bản ghi tri thức
   */
  public function adminStore(Request $request)
  {
    $fields = $request->validate([
      'keyword' => 'nullable|string|max:100',
      'question' => 'required|string|unique:chatbot_knowledges,question',
      'content' => 'required|string',
    ], [
      'question.unique' => 'Câu hỏi này đã tồn tại trong cơ sở dữ liệu tri thức.',
    ]);

    $knowledge = ChatbotKnowledge::create([
      'keyword' => $fields['keyword'] ?: null,
      'question' => $fields['question'],
      'content' => $fields['content'],
      'created_by' => $request->user()?->id,
    ]);

    return $this->successResponse($knowledge, 'Thêm tri thức thành công.');
  }

  /**
   * Admin API: Cập nhật tri thức
   */
  public function adminUpdate(Request $request, $id)
  {
    $knowledge = ChatbotKnowledge::findOrFail($id);

    $fields = $request->validate([
      'keyword' => 'nullable|string|max:100',
      'question' => 'required|string|unique:chatbot_knowledges,question,' . $id,
      'content' => 'required|string',
    ], [
      'question.unique' => 'Câu hỏi này đã tồn tại trong cơ sở dữ liệu tri thức.',
    ]);

    $knowledge->update([
      'keyword' => $fields['keyword'] ?: null,
      'question' => $fields['question'],
      'content' => $fields['content'],
    ]);

    return $this->successResponse($knowledge, 'Cập nhật tri thức thành công.');
  }

  /**
   * Admin API: Xóa tri thức
   */
  public function adminDestroy($id)
  {
    $knowledge = ChatbotKnowledge::findOrFail($id);
    $knowledge->delete();

    return $this->successResponse(null, 'Xóa bản ghi tri thức thành công.');
  }

  /**
   * Admin API: Import tri thức từ file CSV/TEXT (Excel export)
   */
  public function adminImport(Request $request)
  {
    $request->validate([
      'file' => 'required|file',
    ]);

    $file = $request->file('file');
    $filePath = $file->getRealPath();

    $contentText = file_get_contents($filePath);

    // Xử lý UTF-8 BOM
    if (strpos($contentText, "\xEF\xBB\xBF") === 0) {
      $contentText = substr($contentText, 3);
    }

    $lines = preg_split('/\r\n|\r|\n/', trim($contentText));
    if (empty($lines)) {
      return $this->errorResponse('Tệp tải lên không chứa dữ liệu.', 400);
    }

    // Nhận biết dấu phân tách mặc định (dấu phẩy hoặc chấm phẩy từ excel)
    $delimiter = ',';
    if (strpos($lines[0], ';') !== false && strpos($lines[0], ',') === false) {
      $delimiter = ';';
    }

    $importedCount = 0;

    // Kiểm tra dòng đầu có phải tiêu đề bảng (header) không
    $headerLine = mb_strtolower($lines[0], 'UTF-8');
    $hasHeader = str_contains($headerLine, 'question') || str_contains($headerLine, 'content') || str_contains($headerLine, 'keyword') || str_contains($headerLine, 'chủ đề') || str_contains($headerLine, 'câu hỏi') || str_contains($headerLine, 'nội dung');

    $startIndex = $hasHeader ? 1 : 0;

    for ($i = $startIndex; $i < count($lines); $i++) {
      $line = trim($lines[$i]);
      if (empty($line)) {
        continue;
      }

      $fields = str_getcsv($line, $delimiter);

      if (count($fields) >= 2) {
        $keyword = count($fields) > 2 ? trim($fields[0]) : null;
        $question = count($fields) > 2 ? trim($fields[1]) : trim($fields[0]);
        $content = count($fields) > 2 ? trim($fields[2]) : trim($fields[1]);

        if (!empty($question) && !empty($content)) {
          ChatbotKnowledge::updateOrCreate(
            ['question' => $question],
            [
              'keyword' => $keyword ?: null,
              'content' => $content,
              'created_by' => $request->user()?->id,
            ]
          );
          $importedCount++;
        }
      }
    }

    return $this->successResponse([
      'imported' => $importedCount
    ], "Đã import thành công {$importedCount} dòng dữ liệu tri thức mới!");
  }

  /**
   * Admin API: Đồng bộ dữ liệu sang Vector Store thông qua n8n
   */
  public function adminSync(Request $request)
  {
    $n8nUrl = env('N8N_WORKFLOW_URL');
    $allKnowledge = ChatbotKnowledge::all();

    $contextData = [];
    foreach ($allKnowledge as $k) {
      $contextData[] = [
        'keyword' => $k->keyword,
        'question' => $k->question,
        'content' => $k->content,
      ];
    }

    if ($n8nUrl) {
      try {
        $response = Http::timeout(20)->post($n8nUrl, [
          'action' => 'sync_knowledge',
          'data' => $contextData
        ]);

        if ($response->successful()) {
          return $this->successResponse($response->json(), 'Đồng bộ tri thức lên n8n thành công!');
        }

        Log::warning('N8n sync response error: ' . $response->body());
      } catch (\Exception $e) {
        Log::error('Chatbot sync error: ' . $e->getMessage());
        return $this->errorResponse('Không thể kết nối đến máy chủ n8n để thực hiện đồng bộ: ' . $e->getMessage(), 500);
      }
    }

    return $this->successResponse(null, 'Tri thức đã được lưu cục bộ. Hãy thiết lập N8N_WORKFLOW_URL để có thể đồng bộ tự động sang Vector DB!');
  }

  /**
   * Chuẩn hóa tiếng Việt không dấu để so khớp từ vựng tối ưu
   */
  private function normalizeText($str)
  {
    if (!$str) return '';
    $str = mb_strtolower($str, 'UTF-8');

    $unicode = array(
      'a' => 'á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ',
      'd' => 'đ',
      'e' => 'é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ',
      'i' => 'í|ì|ỉ|ĩ|ị',
      'o' => 'ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ',
      'u' => 'ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự',
      'y' => 'ý|ỳ|ỷ|ỹ|ỵ',
    );
    foreach ($unicode as $nonUnicode => $uni) {
      $str = preg_replace("/($uni)/i", $nonUnicode, $str);
    }
    return trim($str);
  }
}
