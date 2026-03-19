-- MySQL schema for WebsiteShopPhuKien
-- Charset recommendation: utf8mb4 for Vietnamese

CREATE DATABASE IF NOT EXISTS shop_phukien CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shop_phukien;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  api_token CHAR(64) NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price INT NOT NULL,
  image_url VARCHAR(500) NULL,
  short_desc VARCHAR(255) NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address VARCHAR(255) NOT NULL,
  note VARCHAR(255) NULL,
  total_amount INT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  unit_price INT NOT NULL,
  quantity INT NOT NULL,
  line_total INT NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Seed products (simple demo data)
INSERT INTO products (name, price, image_url, short_desc, description) VALUES
('Chuột gaming XYZ', 199000, 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=60', 'Chuột gaming RGB, DPI cao.', 'Chuột gaming phù hợp học tập và chơi game, có đèn RGB, DPI tùy chỉnh.'),
('Bàn phím cơ ABC', 499000, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=60', 'Switch bền, gõ sướng.', 'Bàn phím cơ layout 87 phím, switch bền, phù hợp gõ bài và chơi game.'),
('Tai nghe chụp tai', 299000, 'https://images.unsplash.com/photo-1518447613690-d8c0cce2f787?auto=format&fit=crop&w=900&q=60', 'Âm thanh rõ, mic ổn.', 'Tai nghe chụp tai, mic đàm thoại, âm thanh cân bằng.'),
('Lót chuột size lớn', 89000, 'https://images.unsplash.com/photo-1622445272272-0f5b11d7f4e1?auto=format&fit=crop&w=900&q=60', 'Trơn, chống trượt.', 'Lót chuột cỡ lớn, bề mặt mịn, đế chống trượt.');

