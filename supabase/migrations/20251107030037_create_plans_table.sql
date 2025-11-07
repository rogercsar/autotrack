-- supabase/migrations/YYYYMMDDHHMMSS_create_plans_table.sql

-- Create the plans table
CREATE TABLE
  plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    price REAL NOT NULL,
    mercadopago_price_id TEXT,
    features TEXT[] NOT NULL
  );

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON plans FOR
SELECT
  USING (TRUE);

-- Insert the plans
INSERT INTO
  plans (name, price, features)
VALUES
  (
    'Básico',
    0,
    ARRAY['1 veículo', 'Registro de despesas', '1 grupo (até 2 membros)', 'Alerta de emergência', 'Visualizar oficinas próximas']
  ),
  (
    'Avançado',
    9.90,
    ARRAY['Até 5 veículos', 'Todas as funcionalidades do Básico', '3 grupos (até 5 membros cada)', 'Exportação para PDF']
  ),
  (
    'Pro',
    19.90,
    ARRAY['Veículos ilimitados', 'Todas as funcionalidades do Avançado', 'Grupos ilimitados', 'Compartilhamento avançado', 'Relatórios e gráficos']
  );
