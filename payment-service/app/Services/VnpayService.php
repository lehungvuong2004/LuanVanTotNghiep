<?php

namespace App\Services;

class VnpayService
{
  private string $vnpUrl;
  private string $tmnCode;
  private string $hashSecret;
  private string $returnUrl;

  public function __construct()
  {
    $this->vnpUrl     = env('VNPAY_URL',        'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
    $this->tmnCode    = env('VNPAY_TMN_CODE',   '083AFOMK');
    $this->hashSecret = env('VNPAY_HASH_SECRET', 'FV63BLCGU8CZIS4BS3JSOBUVQ286XRZB');
    $this->returnUrl  = env('VNPAY_RETURN_URL',  'http://localhost:5173/thanh-toan/ket-qua');
  }

  /**
   * Build the VNPay redirect URL for a payment.
   *
   * @param  int    $paymentId   Internal payment record ID
   * @param  float  $amount      Amount in VNĐ (will be multiplied by 100 per VNPay spec)
   * @param  string $orderInfo   Short order description
   * @param  string $ipAddr      Client IP address
   * @param  string $locale      'vn' or 'en'
   * @return string              Full redirect URL to VNPay gateway
   */
  public function buildPaymentUrl(
    int    $paymentId,
    float  $amount,
    string $orderInfo = 'Thanh toan dich vu',
    string $ipAddr    = '127.0.0.1',
    string $locale    = 'vn',
    array  $billingInfo = []
  ): string {
    if (filter_var($ipAddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) === false) {
      $ipAddr = '127.0.0.1';
    }

    $createDate = date('YmdHis');
    $txnRef     = $paymentId . '_' . $createDate;      // unique per transaction

    $params = [
      'vnp_Version'    => '2.1.0',
      'vnp_Command'    => 'pay',
      'vnp_TmnCode'    => $this->tmnCode,
      'vnp_Amount'     => (int) ($amount * 100),     // VNPay requires amount × 100
      'vnp_CreateDate' => $createDate,
      'vnp_CurrCode'   => 'VND',
      'vnp_IpAddr'     => $ipAddr,
      'vnp_Locale'     => $locale,
      'vnp_OrderInfo'  => $orderInfo,
      'vnp_OrderType'  => 'other',
      'vnp_ReturnUrl'  => $this->returnUrl,
      'vnp_TxnRef'     => $txnRef,
    ];

    if (!empty($billingInfo)) {
      $params = array_merge($params, $billingInfo);
    }

    ksort($params);

    $query      = http_build_query($params, '', '&', PHP_QUERY_RFC1738);
    $hmac       = hash_hmac('sha512', $query, $this->hashSecret);
    $paymentUrl = $this->vnpUrl . '?' . $query . '&vnp_SecureHash=' . $hmac;

    return $paymentUrl;
  }

  /**
   * Verify the HMAC signature returned from VNPay (for both Return URL and IPN).
   *
   * @param  array  $data  All query params from VNPay (including vnp_SecureHash)
   * @return bool
   */
  public function verifySignature(array $data): bool
  {
    $secureHash = $data['vnp_SecureHash'] ?? '';

    // Remove hash fields before rebuilding the query
    $filtered = array_filter(
      $data,
      fn($key) => !in_array($key, ['vnp_SecureHash', 'vnp_SecureHashType']),
      ARRAY_FILTER_USE_KEY
    );

    ksort($filtered);
    $query = http_build_query($filtered, '', '&', PHP_QUERY_RFC1738);
    $hmac  = hash_hmac('sha512', $query, $this->hashSecret);

    return hash_equals($hmac, $secureHash);
  }

  /**
   * Extract the internal payment ID from a VNPay txn_ref (format: {id}_{createDate}).
   */
  public function extractPaymentId(string $txnRef): ?int
  {
    $parts = explode('_', $txnRef, 2);
    $id    = (int) ($parts[0] ?? 0);
    return $id > 0 ? $id : null;
  }
}
