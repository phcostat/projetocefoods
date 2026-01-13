-- Add status tracking for comentarios moderation
ALTER TABLE tbcomentario
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE';

-- Optional: initialize existing registros como aprovados
UPDATE tbcomentario
   SET status = 'APROVADO'
 WHERE status = 'PENDENTE' AND data < NOW() - INTERVAL 7 DAY;
