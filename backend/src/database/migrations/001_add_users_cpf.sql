-- Contas existentes mantêm CPF nulo até que o dado seja coletado.
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf VARCHAR(11)
  CONSTRAINT users_cpf_format CHECK (cpf ~ '^[0-9]{11}$');
