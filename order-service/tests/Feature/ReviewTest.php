<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Review;
use Illuminate\Support\Facades\Http;

class ReviewTest extends TestCase
{
  private function generateJwt(int $userId, int $roleId, string $email): string
  {
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $payload = json_encode([
      'sub' => $userId,
      'role_id' => $roleId,
      'email' => $email,
      'exp' => time() + 3600
    ]);

    $base64UrlHeader = $this->base64UrlEncode($header);
    $base64UrlPayload = $this->base64UrlEncode($payload);

    $signingInput = $base64UrlHeader . '.' . $base64UrlPayload;
    $secret = env('JWT_SECRET', 'hirwP8f2A4NXdLgvEFkLTveCi6H8Xvu1llUhCUN8yeHmnOPXwoyUReZpGgydlZAe');
    $signature = hash_hmac('sha256', $signingInput, $secret, true);
    $base64UrlSignature = $this->base64UrlEncode($signature);

    return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
  }

  private function base64UrlEncode(string $data): string
  {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }

  public function test_customer_can_update_their_own_review(): void
  {
    Http::fake([
      'http://provider-service:8000/*' => Http::response(['status' => 'success'], 200),
    ]);

    // Create a dummy review in order-service DB
    $review = Review::create([
      'customer_id' => 4,
      'helper_id' => 3,
      'rating' => 5,
      'comment' => 'Initial comment',
    ]);

    $jwt = $this->generateJwt(4, 4, 'customer@gmail.com');

    $response = $this->withHeaders([
      'Authorization' => 'Bearer ' . $jwt,
    ])->putJson('/api/orders/reviews/' . $review->id, [
      'rating' => 4,
      'comment' => 'Updated comment',
    ]);

    $response->assertStatus(200);
    $response->assertJsonPath('data.rating', 4);
    $response->assertJsonPath('data.comment', 'Updated comment');

    $this->assertDatabaseHas('reviews', [
      'id' => $review->id,
      'rating' => 4,
      'comment' => 'Updated comment',
    ]);

    // Clean up
    $review->delete();
  }

  public function test_customer_cannot_update_others_review(): void
  {
    // Create review for customer 5
    $review = Review::create([
      'customer_id' => 5,
      'helper_id' => 3,
      'rating' => 5,
      'comment' => 'Other customer review',
    ]);

    $jwt = $this->generateJwt(4, 4, 'customer@gmail.com');

    $response = $this->withHeaders([
      'Authorization' => 'Bearer ' . $jwt,
    ])->putJson('/api/orders/reviews/' . $review->id, [
      'rating' => 1,
      'comment' => 'Sneaky edit',
    ]);

    $response->assertStatus(403);
    $response->assertJson(['message' => 'Bạn chỉ được sửa đánh giá của chính mình.']);

    // Clean up
    $review->delete();
  }

  public function test_customer_can_delete_their_own_review(): void
  {
    Http::fake([
      'http://provider-service:8000/*' => Http::response(['status' => 'success'], 200),
    ]);

    $review = Review::create([
      'customer_id' => 4,
      'helper_id' => 3,
      'rating' => 5,
      'comment' => 'To be deleted',
    ]);

    $jwt = $this->generateJwt(4, 4, 'customer@gmail.com');

    $response = $this->withHeaders([
      'Authorization' => 'Bearer ' . $jwt,
    ])->deleteJson('/api/orders/reviews/' . $review->id);

    $response->assertStatus(200);
    $response->assertJson(['message' => 'Xóa đánh giá thành công!']);

    $this->assertDatabaseMissing('reviews', [
      'id' => $review->id,
    ]);
  }
}
