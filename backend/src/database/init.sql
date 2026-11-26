-- Executado pelo entrypoint oficial do PostgreSQL apenas quando o volume é criado.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  cpf VARCHAR(11) NOT NULL CONSTRAINT users_cpf_format CHECK (cpf ~ '^[0-9]{11}$'),
  password_hash TEXT NOT NULL,
  phone VARCHAR(30) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state CHAR(2) NOT NULL CHECK (state = UPPER(state)),
  address TEXT NOT NULL,
  profession VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(16) NOT NULL DEFAULT 'USER'
    CHECK (role IN ('USER', 'ADMIN')),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_lowercase CHECK (email = LOWER(email))
);

CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  type VARCHAR(32) NOT NULL
    CHECK (type IN ('EMAIL_VERIFICATION', 'LOGIN_OTP')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  attempts SMALLINT NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_tokens_user_id_idx
  ON auth_tokens (user_id);
CREATE INDEX IF NOT EXISTS auth_tokens_token_hash_idx
  ON auth_tokens (token_hash);
CREATE INDEX IF NOT EXISTS auth_tokens_user_type_active_idx
  ON auth_tokens (user_id, type, created_at DESC)
  WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS auth_tokens_expires_at_idx
  ON auth_tokens (expires_at);

CREATE OR REPLACE FUNCTION set_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at_trigger ON users;
CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_users_updated_at();
