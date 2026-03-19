<?php
declare(strict_types=1);

function json_ok($data, int $status = 200): void {
  http_response_code($status);
  echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
  exit;
}

function json_error(string $code, string $message, int $status = 400, array $extra = []): void {
  http_response_code($status);
  echo json_encode(['ok' => false, 'error' => array_merge([
    'code' => $code,
    'message' => $message,
  ], $extra)], JSON_UNESCAPED_UNICODE);
  exit;
}

function read_json_body(): array {
  $raw = file_get_contents('php://input');
  if ($raw === false || trim($raw) === '') return [];
  $data = json_decode($raw, true);
  if (!is_array($data)) {
    json_error('INVALID_JSON', 'Body JSON không hợp lệ.', 400);
  }
  return $data;
}

function bearer_token(): ?string {
  $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!$auth) return null;
  if (preg_match('/Bearer\s+(.+)/i', $auth, $m)) {
    return trim($m[1]);
  }
  return null;
}

