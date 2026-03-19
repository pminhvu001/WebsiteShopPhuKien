<?php
declare(strict_types=1);

function auth_user(PDO $pdo): array {
  $token = bearer_token();
  if (!$token) {
    json_error('UNAUTHORIZED', 'Thiếu token đăng nhập.', 401);
  }
  $stmt = $pdo->prepare('SELECT id, name, email FROM users WHERE api_token = ? LIMIT 1');
  $stmt->execute([$token]);
  $user = $stmt->fetch();
  if (!$user) {
    json_error('UNAUTHORIZED', 'Token không hợp lệ.', 401);
  }
  return $user;
}

function issue_token(PDO $pdo, int $userId): string {
  $token = bin2hex(random_bytes(32));
  $stmt = $pdo->prepare('UPDATE users SET api_token = ? WHERE id = ?');
  $stmt->execute([$token, $userId]);
  return $token;
}

