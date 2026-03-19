<?php
declare(strict_types=1);

function route(PDO $pdo, string $method, string $path): void {
  // Health check
  if ($method === 'GET' && ($path === '/' || $path === '')) {
    json_ok(['service' => 'shop-phukien-api', 'status' => 'ok']);
  }

  // GET /products
  if ($method === 'GET' && $path === '/products') {
    $stmt = $pdo->query('SELECT id, name, price, image_url, short_desc FROM products ORDER BY id DESC');
    json_ok($stmt->fetchAll());
  }

  // GET /products/{id}
  if ($method === 'GET' && preg_match('#^/products/(\d+)$#', $path, $m)) {
    $id = (int)$m[1];
    $stmt = $pdo->prepare('SELECT id, name, price, image_url, short_desc, description FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $p = $stmt->fetch();
    if (!$p) json_error('NOT_FOUND', 'Không tìm thấy sản phẩm.', 404);
    json_ok($p);
  }

  // POST /auth/register {name,email,password}
  if ($method === 'POST' && $path === '/auth/register') {
    $body = read_json_body();
    $name = trim((string)($body['name'] ?? ''));
    $email = trim((string)($body['email'] ?? ''));
    $password = (string)($body['password'] ?? '');
    if ($name === '' || $email === '' || $password === '') {
      json_error('VALIDATION', 'Vui lòng nhập name/email/password.', 422);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      json_error('VALIDATION', 'Email không hợp lệ.', 422);
    }
    $hash = password_hash($password, PASSWORD_DEFAULT);
    try {
      $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
      $stmt->execute([$name, $email, $hash]);
      $userId = (int)$pdo->lastInsertId();
      $token = issue_token($pdo, $userId);
      json_ok(['token' => $token, 'user' => ['id' => $userId, 'name' => $name, 'email' => $email]], 201);
    } catch (PDOException $e) {
      if (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), 'duplicate')) {
        json_error('EMAIL_EXISTS', 'Email đã tồn tại.', 409);
      }
      throw $e;
    }
  }

  // POST /auth/login {email,password}
  if ($method === 'POST' && $path === '/auth/login') {
    $body = read_json_body();
    $email = trim((string)($body['email'] ?? ''));
    $password = (string)($body['password'] ?? '');
    if ($email === '' || $password === '') {
      json_error('VALIDATION', 'Vui lòng nhập email/password.', 422);
    }
    $stmt = $pdo->prepare('SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $u = $stmt->fetch();
    if (!$u || !password_verify($password, (string)$u['password_hash'])) {
      json_error('INVALID_LOGIN', 'Sai email hoặc mật khẩu.', 401);
    }
    $token = issue_token($pdo, (int)$u['id']);
    json_ok(['token' => $token, 'user' => ['id' => (int)$u['id'], 'name' => $u['name'], 'email' => $u['email']]]);
  }

  // POST /orders (auth) {full_name,phone,address,note,items:[{product_id,quantity}]}
  if ($method === 'POST' && $path === '/orders') {
    $user = auth_user($pdo);
    $body = read_json_body();

    $fullName = trim((string)($body['full_name'] ?? ''));
    $phone = trim((string)($body['phone'] ?? ''));
    $address = trim((string)($body['address'] ?? ''));
    $note = trim((string)($body['note'] ?? ''));
    $items = $body['items'] ?? null;

    if ($fullName === '' || $phone === '' || $address === '' || !is_array($items) || count($items) === 0) {
      json_error('VALIDATION', 'Thiếu thông tin đặt hàng hoặc giỏ hàng trống.', 422);
    }

    // Build totals from DB (don’t trust client price)
    $productIds = [];
    foreach ($items as $it) {
      $pid = (int)($it['product_id'] ?? 0);
      $qty = (int)($it['quantity'] ?? 0);
      if ($pid <= 0 || $qty <= 0) json_error('VALIDATION', 'Item không hợp lệ.', 422);
      $productIds[] = $pid;
    }
    $productIds = array_values(array_unique($productIds));

    $in = implode(',', array_fill(0, count($productIds), '?'));
    $stmt = $pdo->prepare("SELECT id, name, price FROM products WHERE id IN ($in)");
    $stmt->execute($productIds);
    $rows = $stmt->fetchAll();
    $byId = [];
    foreach ($rows as $r) $byId[(int)$r['id']] = $r;
    if (count($byId) !== count($productIds)) {
      json_error('VALIDATION', 'Có sản phẩm không tồn tại.', 422);
    }

    $orderItems = [];
    $total = 0;
    foreach ($items as $it) {
      $pid = (int)$it['product_id'];
      $qty = (int)$it['quantity'];
      $p = $byId[$pid];
      $unit = (int)$p['price'];
      $line = $unit * $qty;
      $total += $line;
      $orderItems[] = [
        'product_id' => $pid,
        'product_name' => (string)$p['name'],
        'unit_price' => $unit,
        'quantity' => $qty,
        'line_total' => $line,
      ];
    }

    $pdo->beginTransaction();
    try {
      $stmt = $pdo->prepare('INSERT INTO orders (user_id, full_name, phone, address, note, total_amount) VALUES (?, ?, ?, ?, ?, ?)');
      $stmt->execute([(int)$user['id'], $fullName, $phone, $address, $note ?: null, $total]);
      $orderId = (int)$pdo->lastInsertId();

      $stmtItem = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total) VALUES (?, ?, ?, ?, ?, ?)');
      foreach ($orderItems as $oi) {
        $stmtItem->execute([$orderId, $oi['product_id'], $oi['product_name'], $oi['unit_price'], $oi['quantity'], $oi['line_total']]);
      }

      $pdo->commit();
      json_ok(['order_id' => $orderId, 'total_amount' => $total], 201);
    } catch (Throwable $e) {
      $pdo->rollBack();
      throw $e;
    }
  }

  json_error('NOT_FOUND', 'Endpoint không tồn tại.', 404, [
    'method' => $method,
    'path' => $path,
  ]);
}

