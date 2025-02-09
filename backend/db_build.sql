CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(255) NOT NULL,
  second_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role ENUM('user', 'autor', 'admin') NOT NULL,
  is_active BOOLEAN NOT NULL,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS revoked_tokens (
  jti CHAR(36) PRIMARY KEY DEFAULT (UUID())
  user_id BIGINT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS articles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- For making different articles versions
CREATE TABLE IF NOT EXISTS article_version (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  article_id BIGINT NOT NULL,
  version_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  intro_image TEXT,
  source TEXT NOT NULL,
  is_seen BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Trigger for articles deletion on users logic deletion
DELIMITER //

CREATE TRIGGER delete_articles_if_inactive
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.is_active = FALSE AND OLD.is_active = TRUE THEN
        -- Удаляем все статьи пользователя, если их статус был изменен на неактивный
        DELETE FROM articles WHERE user_id = OLD.id;
    END IF;
END//

DELIMITER ;

-- Trigger to update last_seen field of user when a new article is created:
DELIMITER //

CREATE TRIGGER update_last_seen BEFORE INSERT ON articles
FOR EACH ROW
BEGIN
  UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = NEW.user_id;
END//

DELIMITER ;

-- Trigger for hiding other articles versions when the is_seen flag is set to TRUE on a different version
DELIMITER //

CREATE TRIGGER hide_first_version_before_update BEFORE UPDATE ON article_version
FOR EACH ROW
BEGIN
  IF NEW.is_seen = TRUE AND OLD.is_seen = FALSE THEN
    UPDATE article_version
    SET is_seen = FALSE
    WHERE article_id = NEW.article_id AND version_name = (
      SELECT MIN(version_name)
      FROM article_version
      WHERE article_id = NEW.article_id
    );
  END IF;
END//

DELIMITER ;
