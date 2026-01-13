-- SQL schema for chat messages table (MySQL)
-- Run this file in your database (mysql CLI or any GUI) to create the table

CREATE TABLE IF NOT EXISTS tbmensagem (
  idMensagem BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sala VARCHAR(128) NOT NULL,
  idUsuarioEnviada BIGINT UNSIGNED NOT NULL,
  idUsuarioRecebida BIGINT UNSIGNED NOT NULL,
  mensagem TEXT NOT NULL,
  anexos JSON DEFAULT NULL,
  enviadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recebidoEm DATETIME DEFAULT NULL,
  visualizadoEm DATETIME DEFAULT NULL,
  lido BOOLEAN NOT NULL DEFAULT FALSE,
  entregue BOOLEAN NOT NULL DEFAULT FALSE,
  criadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizadoEm DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (idMensagem),
  INDEX idx_sala (sala),
  INDEX idx_de (idUsuarioEnviada),
  INDEX idx_para (idUsuarioRecebida),
  INDEX idx_enviadoEm (enviadoEm)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Explanation of columns:
-- sala: deterministic room identifier (e.g., "chat-{minId}-{maxId}")
-- idUsuarioEnviada: sender user ID
-- idUsuarioRecebida: receiver user ID
-- mensagem: text content
-- anexos: optional JSON array with attachment metadata (urls, mime, etc.)
-- enviadoEm: when the message was sent
-- recebidoEm: when the recipient's client acknowledged receipt
-- visualizadoEm: when the recipient opened/read the message
-- lido/entregue: boolean flags for quick queries
