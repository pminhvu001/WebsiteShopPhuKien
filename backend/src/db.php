<?php
declare(strict_types=1);

function db_connect(array $config): PDO {
  $db = $config['db'] ?? [];
  $host = $db['host'] ?? '127.0.0.1';
  $port = (int)($db['port'] ?? 3306);
  $name = $db['name'] ?? 'shop_phukien';
  $user = $db['user'] ?? 'root';
  $pass = $db['pass'] ?? '';
  $charset = $db['charset'] ?? 'utf8mb4';

  $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";
  $pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]);
  return $pdo;
}

