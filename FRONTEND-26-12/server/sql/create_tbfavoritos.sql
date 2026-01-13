-- SQL schema for product favorites
-- Execute this script in the Cefoods database before deploying the feature

CREATE TABLE IF NOT EXISTS tbfavoritos (
  idUsuario BIGINT UNSIGNED NOT NULL,
  idProduto BIGINT UNSIGNED NOT NULL,
  dataFavorito DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idUsuario, idProduto),
  CONSTRAINT fk_favoritos_usuario FOREIGN KEY (idUsuario)
    REFERENCES tbusuario (idUsuario)
    ON DELETE CASCADE,
  CONSTRAINT fk_favoritos_produto FOREIGN KEY (idProduto)
    REFERENCES tbproduto (idProduto)
    ON DELETE CASCADE,
  INDEX idx_favoritos_usuario (idUsuario),
  INDEX idx_favoritos_produto (idProduto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
