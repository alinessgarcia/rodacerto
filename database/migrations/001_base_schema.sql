-- ============================================================
-- MIGRATION 001: Schema Base do RodaCerto
-- Aplique este SQL no Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Dropar tabelas existentes (se quiser recomeçar do zero)
-- CUIDADO: Descomente apenas se quiser limpar tudo
-- DROP TABLE IF EXISTS user_simulations CASCADE;
-- DROP TABLE IF EXISTS fine_statistics CASCADE;
-- DROP TABLE IF EXISTS vehicles_base CASCADE;
-- DROP TABLE IF EXISTS fuel_prices CASCADE;
-- DROP TABLE IF EXISTS vehicle_categories CASCADE;

-- ============================================================
-- TABELA: vehicle_categories
-- Categorias com custos médios de manutenção
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('carro', 'moto')),
    avg_maintenance_cost_year NUMERIC NOT NULL DEFAULT 0,
    avg_tire_cost_unit NUMERIC NOT NULL DEFAULT 0,
    tire_qty INT NOT NULL DEFAULT 4,
    tire_lifespan_km INT NOT NULL DEFAULT 40000,
    avg_oil_change_cost NUMERIC NOT NULL DEFAULT 0,
    oil_change_interval_km INT NOT NULL DEFAULT 10000,
    avg_brake_pad_cost NUMERIC NOT NULL DEFAULT 0,
    brake_lifespan_km INT NOT NULL DEFAULT 30000,
    depreciation_rate_year NUMERIC NOT NULL DEFAULT 0.10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: vehicles_base
-- Veículos com dados FIPE e consumo
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('carro', 'moto')),
    category_id UUID REFERENCES vehicle_categories(id),
    avg_consumption_city NUMERIC,
    avg_consumption_road NUMERIC,
    avg_consumption_mixed NUMERIC,
    fipe_value NUMERIC,
    fipe_code TEXT,
    engine_cc INT,
    fuel_type TEXT DEFAULT 'flex',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand, model, year)
);

-- ============================================================
-- TABELA: fuel_prices
-- Preços de combustível (atualizado via Python)
-- ============================================================
CREATE TABLE IF NOT EXISTS fuel_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code CHAR(2) NOT NULL,
    city TEXT,
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('gasolina', 'etanol', 'diesel', 'gnv')),
    price NUMERIC NOT NULL,
    price_min NUMERIC,
    price_max NUMERIC,
    sample_size INT,
    source TEXT DEFAULT 'ANP',
    reference_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: fine_statistics
-- Estatísticas de multas por estado/ano
-- ============================================================
CREATE TABLE IF NOT EXISTS fine_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code CHAR(2) NOT NULL,
    year INT NOT NULL,
    total_fines_issued BIGINT,
    total_drivers_licensed BIGINT,
    avg_fines_per_driver_year NUMERIC,
    avg_fine_value NUMERIC,
    most_common_fine_type TEXT,
    most_common_fine_value NUMERIC,
    probability_monthly NUMERIC,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(state_code, year)
);

-- ============================================================
-- TABELA: maintenance_benchmarks
-- Custo de manutenção por faixa de km
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES vehicle_categories(id),
    km_range_start INT NOT NULL,
    km_range_end INT NOT NULL,
    expected_maintenance_year NUMERIC NOT NULL,
    corrective_probability NUMERIC,
    avg_corrective_cost NUMERIC,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: user_simulations
-- Simulações dos usuários (sync opcional)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    simulation_name TEXT,

    -- Veículo
    vehicle_base_id UUID REFERENCES vehicles_base(id),
    vehicle_brand TEXT,
    vehicle_model TEXT,
    vehicle_year INT,
    vehicle_type TEXT CHECK (vehicle_type IN ('carro', 'moto')),
    current_value NUMERIC,
    current_km INT,
    is_financed BOOLEAN DEFAULT FALSE,
    finance_monthly_payment NUMERIC,
    finance_remaining_months INT,
    is_rented BOOLEAN DEFAULT FALSE,
    rental_cost_weekly NUMERIC,

    -- Uso
    avg_km_day NUMERIC NOT NULL,
    days_worked_week INT NOT NULL DEFAULT 6,
    hours_worked_day NUMERIC NOT NULL DEFAULT 10,
    empty_km_percentage NUMERIC NOT NULL DEFAULT 30,

    -- Receita
    gross_earnings_day NUMERIC NOT NULL,
    platform TEXT DEFAULT 'uber',

    -- Custos fixos
    insurance_cost_year NUMERIC DEFAULT 0,
    ipva_cost_year NUMERIC DEFAULT 0,
    licensing_cost_year NUMERIC DEFAULT 0,

    -- Consumo
    fuel_type TEXT DEFAULT 'gasolina',
    fuel_price_override NUMERIC,
    consumption_override NUMERIC,
    state_code CHAR(2),

    -- Resultados (snapshot)
    result_net_profit_monthly NUMERIC,
    result_cost_per_km NUMERIC,
    result_hourly_wage NUMERIC,
    result_risk_score NUMERIC,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: data_update_log
-- Log de atualizações automáticas
-- ============================================================
CREATE TABLE IF NOT EXISTS data_update_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'error')),
    records_processed INT,
    records_inserted INT,
    records_updated INT,
    error_message TEXT,
    execution_time_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: fuel_prices_history
-- Histórico semanal para tendências
-- ============================================================
CREATE TABLE IF NOT EXISTS fuel_prices_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code CHAR(2) NOT NULL,
    fuel_type TEXT NOT NULL,
    avg_price NUMERIC NOT NULL,
    reference_week DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(state_code, fuel_type, reference_week)
);
