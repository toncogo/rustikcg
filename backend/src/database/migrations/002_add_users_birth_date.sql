-- Contas existentes mantêm a data de nascimento nula até que seja coletada.
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
