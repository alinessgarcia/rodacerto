-- ============================================================
-- MIGRATION 003: Row Level Security (RLS)
-- Aplique APÓS as migrations 001 e 002
-- ============================================================

-- ============================================================
-- Habilitar RLS em todas as tabelas
-- ============================================================
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fine_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_update_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_prices_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DADOS DE REFERÊNCIA: Leitura pública
-- Qualquer usuário (anon ou autenticado) pode ler
-- ============================================================

-- vehicle_categories: leitura pública
CREATE POLICY "vehicle_categories_select_public"
    ON vehicle_categories FOR SELECT
    USING (true);

-- vehicles_base: leitura pública
CREATE POLICY "vehicles_base_select_public"
    ON vehicles_base FOR SELECT
    USING (true);

-- fuel_prices: leitura pública
CREATE POLICY "fuel_prices_select_public"
    ON fuel_prices FOR SELECT
    USING (true);

-- fine_statistics: leitura pública
CREATE POLICY "fine_statistics_select_public"
    ON fine_statistics FOR SELECT
    USING (true);

-- maintenance_benchmarks: leitura pública
CREATE POLICY "maintenance_benchmarks_select_public"
    ON maintenance_benchmarks FOR SELECT
    USING (true);

-- fuel_prices_history: leitura pública
CREATE POLICY "fuel_prices_history_select_public"
    ON fuel_prices_history FOR SELECT
    USING (true);

-- ============================================================
-- USER SIMULATIONS: Somente o dono (ou anônimo)
-- ============================================================

-- Usuários autenticados: CRUD nas próprias simulações
CREATE POLICY "simulations_select_own"
    ON user_simulations FOR SELECT
    USING (
        user_id = auth.uid()
        OR user_id IS NULL
    );

CREATE POLICY "simulations_insert_own"
    ON user_simulations FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        OR user_id IS NULL
    );

CREATE POLICY "simulations_update_own"
    ON user_simulations FOR UPDATE
    USING (
        user_id = auth.uid()
        OR user_id IS NULL
    );

CREATE POLICY "simulations_delete_own"
    ON user_simulations FOR DELETE
    USING (
        user_id = auth.uid()
        OR user_id IS NULL
    );

-- ============================================================
-- DATA UPDATE LOG: Somente leitura pública
-- (Escrita via service_role nos scripts Python)
-- ============================================================
CREATE POLICY "update_log_select_public"
    ON data_update_log FOR SELECT
    USING (true);

-- ============================================================
-- NOTA: Os scripts Python usam a SERVICE_ROLE key,
-- que bypassa RLS automaticamente.
-- Nunca exponha a service_role key no frontend!
-- ============================================================
