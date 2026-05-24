CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS resource_embedding (
    id              BIGSERIAL PRIMARY KEY,
    embedding_type  VARCHAR(50)  NOT NULL,
    target_id       BIGINT       NOT NULL,
    target_type     VARCHAR(50)  NOT NULL,
    embedding       vector(1024) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_embedding_type_target
    ON resource_embedding (embedding_type, target_id);

CREATE INDEX IF NOT EXISTS idx_embedding_vector
    ON resource_embedding USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
