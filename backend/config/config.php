<?php
declare(strict_types=1);

return [
  // Update these values for your local MySQL
  'db' => [
    'host' => '127.0.0.1',
    'port' => 3306,
    'name' => 'shop_phukien',
    'user' => 'root',
    'pass' => '',
    'charset' => 'utf8mb4',
  ],
  // For simple dev CORS; set to your Vercel domain in production
  'cors' => [
    'allow_origin' => '*',
  ],
];

