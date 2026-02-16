-- ============================================================
-- MIGRATION 002: Índices e Views
-- Aplique APÓS a migration 001
-- ============================================================

-- ============================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_fuel_prices_state_type
    ON fuel_prices(state_code, fuel_type);

CREATE INDEX IF NOT EXISTS idx_fuel_prices_city
    ON fuel_prices(state_code, city) WHERE city IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fuel_prices_ref_date
    ON fuel_prices(reference_date DESC);

CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model
    ON vehicles_base(brand, model, year);

CREATE INDEX IF NOT EXISTS idx_vehicles_type
    ON vehicles_base(vehicle_type);

CREATE INDEX IF NOT EXISTS idx_vehicles_category
    ON vehicles_base(category_id);

CREATE INDEX IF NOT EXISTS idx_simulations_user
    ON user_simulations(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_simulations_local
    ON user_simulations(local_id) WHERE local_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fines_state_year
    ON fine_statistics(state_code, year);

CREATE INDEX IF NOT EXISTS idx_fuel_history_lookup
    ON fuel_prices_history(state_code, fuel_type, reference_week DESC);

CREATE INDEX IF NOT EXISTS idx_maintenance_bench_category
    ON maintenance_benchmarks(category_id, km_range_start, km_range_end);

CREATE INDEX IF NOT EXISTS idx_update_log_source
    ON data_update_log(source, created_at DESC);

-- ============================================================
-- VIEW: Preço mais recente por estado/tipo
-- ============================================================
CREATE OR REPLACE VIEW v_latest_fuel_prices AS
SELECT DISTINCT ON (state_code, fuel_type)
    id,
    state_code,
    fuel_type,
    price,
    price_min,
    price_max,
    sample_size,
    reference_date,
    created_at
FROM fuel_prices
ORDER BY state_code, fuel_type, reference_date DESC NULLS LAST, created_at DESC;

-- ============================================================
-- VIEW: Custo de manutenção por km por categoria
-- ============================================================
CREATE OR REPLACE VIEW v_maintenance_cost_per_km AS
SELECT
    vc.id AS category_id,
    vc.name AS category_name,
    vc.vehicle_type,
    ROUND(
        (vc.avg_tire_cost_unit * vc.tire_qty / NULLIF(vc.tire_lifespan_km, 0))
        + (vc.avg_oil_change_cost / NULLIF(vc.oil_change_interval_km, 0))
        + (vc.avg_brake_pad_cost / NULLIF(vc.brake_lifespan_km, 0))
        + (vc.avg_maintenance_cost_year / 36000.0)
    , 4) AS maintenance_cost_per_km,
    vc.depreciation_rate_year
FROM vehicle_categories vc;

-- ============================================================
-- VIEW: Resumo veículos com categoria
-- ============================================================
CREATE OR REPLACE VIEW v_vehicles_with_category AS
SELECT
    vb.id,
    vb.brand,
    vb.model,
    vb.year,
    vb.vehicle_type,
    vb.avg_consumption_city,
    vb.avg_consumption_road,
    vb.avg_consumption_mixed,
    vb.fipe_value,
    vb.fuel_type,
    vb.engine_cc,
    vc.name AS category_name,
    vc.avg_maintenance_cost_year,
    vc.avg_tire_cost_unit,
    vc.tire_qty,
    vc.tire_lifespan_km,
    vc.avg_oil_change_cost,
    vc.oil_change_interval_km,
    vc.avg_brake_pad_cost,
    vc.brake_lifespan_km,
    vc.depreciation_rate_year
FROM vehicles_base vb
LEFT JOIN vehicle_categories vc ON vb.category_id = vc.id;

-- ============================================================
-- FUNCTION: Atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE OR REPLACE TRIGGER trg_vehicle_categories_updated
    BEFORE UPDATE ON vehicle_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_vehicles_base_updated
    BEFORE UPDATE ON vehicles_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_user_simulations_updated
    BEFORE UPDATE ON user_simulations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
