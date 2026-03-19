<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$config = require __DIR__ . '/../config/config.php';

// CORS (dev-friendly)
$allowOrigin = $config['cors']['allow_origin'] ?? '*';
header('Access-Control-Allow-Origin: ' . $allowOrigin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require __DIR__ . '/../src/db.php';
require __DIR__ . '/../src/helpers.php';
require __DIR__ . '/../src/auth.php';
require __DIR__ . '/../src/controllers.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// If deployed under a subfolder, try to trim until "/api"
$apiPos = strpos($path, '/api/');
if ($apiPos !== false) {
  $path = substr($path, $apiPos + 4); // keep leading "/"
}

try {
  // Allow health check even if DB is down
  if ($method === 'GET' && ($path === '/' || $path === '' || $path === '/api')) {
    json_ok(['service' => 'shop-phukien-api', 'status' => 'ok']);
  }

  try {
    $pdo = db_connect($config);
  } catch (Throwable $e) {
    json_error('DB_DOWN', 'Chưa kết nối được MySQL. Hãy bật MySQL và import schema.', 503, [
      'detail' => $e->getMessage(),
    ]);
  }

  route($pdo, $method, $path);
} catch (Throwable $e) {
  json_error('SERVER_ERROR', 'Lỗi server.', 500, [
    'detail' => $e->getMessage(),
  ]);
}

