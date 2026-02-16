-- ============================================================
-- MIGRATION 004: Seed Data (Dados Iniciais)
-- Aplique APÓS as migrations 001-003
-- ============================================================

-- ============================================================
-- CATEGORIAS DE VEÍCULOS com custos médios reais (2024/2025)
-- ============================================================
INSERT INTO vehicle_categories (name, vehicle_type, avg_maintenance_cost_year, avg_tire_cost_unit, tire_qty, tire_lifespan_km, avg_oil_change_cost, oil_change_interval_km, avg_brake_pad_cost, brake_lifespan_km, depreciation_rate_year)
VALUES
    -- Carros
    ('Hatch Popular', 'carro', 2500, 350, 4, 40000, 180, 10000, 250, 30000, 0.12),
    ('Hatch Médio', 'carro', 3200, 450, 4, 45000, 220, 10000, 300, 35000, 0.10),
    ('Sedan Compacto', 'carro', 3000, 400, 4, 45000, 200, 10000, 280, 35000, 0.11),
    ('Sedan Médio', 'carro', 4000, 550, 4, 50000, 250, 10000, 350, 35000, 0.09),
    ('SUV Compacto', 'carro', 4500, 600, 4, 45000, 280, 10000, 400, 30000, 0.10),
    ('SUV Médio', 'carro', 5500, 750, 4, 50000, 320, 10000, 500, 35000, 0.08),
    ('Minivan', 'carro', 4200, 500, 4, 45000, 250, 10000, 350, 30000, 0.11),
    -- Motos
    ('Moto 150-160cc', 'moto', 1200, 180, 2, 25000, 80, 5000, 120, 20000, 0.15),
    ('Moto 250-300cc', 'moto', 1800, 250, 2, 30000, 120, 6000, 150, 25000, 0.13),
    ('Moto 500cc+', 'moto', 2500, 350, 2, 30000, 150, 6000, 200, 25000, 0.12)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- VEÍCULOS POPULARES PARA APLICATIVO (dados aproximados)
-- ============================================================
INSERT INTO vehicles_base (brand, model, year, vehicle_type, category_id, avg_consumption_city, avg_consumption_road, avg_consumption_mixed, fipe_value, engine_cc, fuel_type)
VALUES
    -- Hatch Popular
    ('Chevrolet', 'Onix 1.0', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Hatch Popular'),
        12.5, 15.0, 13.2, 82000, 1000, 'flex'),
    ('Volkswagen', 'Gol 1.0', 2023, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Hatch Popular'),
        12.0, 14.5, 12.8, 65000, 1000, 'flex'),
    ('Fiat', 'Mobi 1.0', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Hatch Popular'),
        13.0, 15.5, 13.8, 72000, 1000, 'flex'),
    ('Hyundai', 'HB20 1.0', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Hatch Popular'),
        12.8, 15.2, 13.5, 88000, 1000, 'flex'),

    -- Hatch Médio
    ('Chevrolet', 'Onix 1.0 Turbo', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Hatch Médio'),
        11.5, 14.0, 12.3, 95000, 1000, 'flex'),
    ('Volkswagen', 'Polo 1.0 TSI', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Hatch Médio'),
        11.0, 14.0, 12.0, 98000, 1000, 'flex'),

    -- Sedan Compacto
    ('Chevrolet', 'Onix Plus 1.0', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Sedan Compacto'),
        12.0, 14.5, 12.8, 90000, 1000, 'flex'),
    ('Hyundai', 'HB20S 1.0', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Sedan Compacto'),
        12.5, 15.0, 13.2, 92000, 1000, 'flex'),
    ('Fiat', 'Cronos 1.0', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Sedan Compacto'),
        12.2, 14.8, 13.0, 85000, 1000, 'flex'),

    -- Sedan Médio
    ('Toyota', 'Corolla 2.0', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Sedan Médio'),
        10.0, 13.5, 11.0, 160000, 2000, 'flex'),
    ('Honda', 'Civic 2.0', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Sedan Médio'),
        10.5, 14.0, 11.5, 155000, 2000, 'flex'),
    ('Volkswagen', 'Virtus 1.0 TSI', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'Sedan Médio'),
        11.5, 14.5, 12.4, 110000, 1000, 'flex'),

    -- SUV Compacto
    ('Jeep', 'Renegade 1.3 Turbo', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'SUV Compacto'),
        9.5, 12.0, 10.3, 120000, 1300, 'flex'),
    ('Volkswagen', 'T-Cross 1.0 TSI', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'SUV Compacto'),
        10.5, 13.0, 11.3, 115000, 1000, 'flex'),
    ('Hyundai', 'Creta 1.0 Turbo', 2024, 'carro',
        (SELECT id FROM vehicle_categories WHERE name = 'SUV Compacto'),
        10.0, 13.5, 11.0, 125000, 1000, 'flex'),

    -- Motos
    ('Honda', 'CG 160 Fan', 2024, 'moto',
        (SELECT id FROM vehicle_categories WHERE name = 'Moto 150-160cc'),
        40.0, 45.0, 41.5, 14500, 160, 'flex'),
    ('Honda', 'CG 160 Titan', 2024, 'moto',
        (SELECT id FROM vehicle_categories WHERE name = 'Moto 150-160cc'),
        38.0, 43.0, 39.5, 16000, 160, 'flex'),
    ('Yamaha', 'Factor 150', 2024, 'moto',
        (SELECT id FROM vehicle_categories WHERE name = 'Moto 150-160cc'),
        39.0, 44.0, 40.5, 13000, 150, 'flex'),
    ('Honda', 'CB 300F Twister', 2024, 'moto',
        (SELECT id FROM vehicle_categories WHERE name = 'Moto 250-300cc'),
        30.0, 35.0, 31.5, 22000, 300, 'flex')
ON CONFLICT (brand, model, year) DO NOTHING;

-- ============================================================
-- PREÇOS DE COMBUSTÍVEL (Dados ANP aproximados - Fev 2025)
-- ============================================================
INSERT INTO fuel_prices (state_code, fuel_type, price, price_min, price_max, source, reference_date)
VALUES
    -- São Paulo
    ('SP', 'gasolina', 5.89, 5.29, 6.99, 'ANP', '2025-02-10'),
    ('SP', 'etanol', 3.69, 3.09, 4.49, 'ANP', '2025-02-10'),
    ('SP', 'diesel', 6.15, 5.69, 6.89, 'ANP', '2025-02-10'),
    -- Rio de Janeiro
    ('RJ', 'gasolina', 6.15, 5.59, 7.19, 'ANP', '2025-02-10'),
    ('RJ', 'etanol', 4.29, 3.59, 5.19, 'ANP', '2025-02-10'),
    ('RJ', 'diesel', 6.35, 5.89, 7.09, 'ANP', '2025-02-10'),
    -- Minas Gerais
    ('MG', 'gasolina', 5.99, 5.39, 6.89, 'ANP', '2025-02-10'),
    ('MG', 'etanol', 3.89, 3.29, 4.69, 'ANP', '2025-02-10'),
    ('MG', 'diesel', 6.25, 5.79, 6.99, 'ANP', '2025-02-10'),
    -- Bahia
    ('BA', 'gasolina', 6.29, 5.69, 7.29, 'ANP', '2025-02-10'),
    ('BA', 'etanol', 4.89, 3.99, 5.99, 'ANP', '2025-02-10'),
    ('BA', 'diesel', 6.45, 5.99, 7.19, 'ANP', '2025-02-10'),
    -- Paraná
    ('PR', 'gasolina', 5.95, 5.29, 6.79, 'ANP', '2025-02-10'),
    ('PR', 'etanol', 3.79, 3.19, 4.59, 'ANP', '2025-02-10'),
    ('PR', 'diesel', 6.19, 5.69, 6.89, 'ANP', '2025-02-10'),
    -- Rio Grande do Sul
    ('RS', 'gasolina', 6.05, 5.49, 6.89, 'ANP', '2025-02-10'),
    ('RS', 'etanol', 4.49, 3.69, 5.39, 'ANP', '2025-02-10'),
    ('RS', 'diesel', 6.29, 5.79, 6.99, 'ANP', '2025-02-10'),
    -- Santa Catarina
    ('SC', 'gasolina', 5.85, 5.29, 6.69, 'ANP', '2025-02-10'),
    ('SC', 'etanol', 4.19, 3.49, 5.09, 'ANP', '2025-02-10'),
    ('SC', 'diesel', 6.09, 5.59, 6.79, 'ANP', '2025-02-10'),
    -- Goiás
    ('GO', 'gasolina', 5.79, 5.19, 6.59, 'ANP', '2025-02-10'),
    ('GO', 'etanol', 3.59, 2.99, 4.39, 'ANP', '2025-02-10'),
    ('GO', 'diesel', 6.15, 5.69, 6.89, 'ANP', '2025-02-10'),
    -- Distrito Federal
    ('DF', 'gasolina', 5.99, 5.49, 6.79, 'ANP', '2025-02-10'),
    ('DF', 'etanol', 3.99, 3.29, 4.89, 'ANP', '2025-02-10'),
    ('DF', 'diesel', 6.29, 5.79, 6.99, 'ANP', '2025-02-10'),
    -- Ceará
    ('CE', 'gasolina', 6.19, 5.59, 7.09, 'ANP', '2025-02-10'),
    ('CE', 'etanol', 4.69, 3.89, 5.69, 'ANP', '2025-02-10'),
    ('CE', 'diesel', 6.39, 5.89, 7.09, 'ANP', '2025-02-10'),
    -- Pernambuco
    ('PE', 'gasolina', 6.09, 5.49, 6.99, 'ANP', '2025-02-10'),
    ('PE', 'etanol', 4.49, 3.69, 5.49, 'ANP', '2025-02-10'),
    ('PE', 'diesel', 6.35, 5.89, 7.09, 'ANP', '2025-02-10'),
    -- Pará
    ('PA', 'gasolina', 6.39, 5.79, 7.29, 'ANP', '2025-02-10'),
    ('PA', 'etanol', 4.99, 4.19, 5.99, 'ANP', '2025-02-10'),
    ('PA', 'diesel', 6.49, 5.99, 7.29, 'ANP', '2025-02-10'),
    -- Amazonas
    ('AM', 'gasolina', 6.49, 5.89, 7.39, 'ANP', '2025-02-10'),
    ('AM', 'etanol', 5.19, 4.39, 6.19, 'ANP', '2025-02-10'),
    ('AM', 'diesel', 6.59, 6.09, 7.39, 'ANP', '2025-02-10'),
    -- Maranhão
    ('MA', 'gasolina', 6.25, 5.69, 7.19, 'ANP', '2025-02-10'),
    ('MA', 'etanol', 4.79, 3.99, 5.79, 'ANP', '2025-02-10'),
    ('MA', 'diesel', 6.45, 5.99, 7.19, 'ANP', '2025-02-10'),
    -- Espírito Santo
    ('ES', 'gasolina', 5.95, 5.39, 6.79, 'ANP', '2025-02-10'),
    ('ES', 'etanol', 4.09, 3.39, 4.99, 'ANP', '2025-02-10'),
    ('ES', 'diesel', 6.19, 5.69, 6.89, 'ANP', '2025-02-10'),
    -- Mato Grosso
    ('MT', 'gasolina', 5.99, 5.39, 6.89, 'ANP', '2025-02-10'),
    ('MT', 'etanol', 3.89, 3.19, 4.79, 'ANP', '2025-02-10'),
    ('MT', 'diesel', 6.29, 5.79, 6.99, 'ANP', '2025-02-10'),
    -- Mato Grosso do Sul
    ('MS', 'gasolina', 5.89, 5.29, 6.79, 'ANP', '2025-02-10'),
    ('MS', 'etanol', 3.79, 3.09, 4.69, 'ANP', '2025-02-10'),
    ('MS', 'diesel', 6.19, 5.69, 6.89, 'ANP', '2025-02-10')
;

-- ============================================================
-- ESTATÍSTICAS DE MULTAS POR ESTADO (dados aproximados 2024)
-- ============================================================
INSERT INTO fine_statistics (state_code, year, avg_fines_per_driver_year, avg_fine_value, most_common_fine_type, most_common_fine_value, probability_monthly, source)
VALUES
    ('SP', 2024, 0.85, 195.00, 'Excesso de velocidade', 130.16, 0.071, 'DETRAN-SP/estimativa'),
    ('RJ', 2024, 0.92, 210.00, 'Excesso de velocidade', 130.16, 0.077, 'DETRAN-RJ/estimativa'),
    ('MG', 2024, 0.78, 185.00, 'Excesso de velocidade', 130.16, 0.065, 'DETRAN-MG/estimativa'),
    ('BA', 2024, 0.72, 175.00, 'Estacionamento irregular', 195.23, 0.060, 'DETRAN-BA/estimativa'),
    ('PR', 2024, 0.80, 190.00, 'Excesso de velocidade', 130.16, 0.067, 'DETRAN-PR/estimativa'),
    ('RS', 2024, 0.82, 192.00, 'Excesso de velocidade', 130.16, 0.068, 'DETRAN-RS/estimativa'),
    ('SC', 2024, 0.75, 182.00, 'Excesso de velocidade', 130.16, 0.063, 'DETRAN-SC/estimativa'),
    ('GO', 2024, 0.70, 170.00, 'Excesso de velocidade', 130.16, 0.058, 'DETRAN-GO/estimativa'),
    ('DF', 2024, 1.05, 220.00, 'Excesso de velocidade', 130.16, 0.088, 'DETRAN-DF/estimativa'),
    ('CE', 2024, 0.68, 168.00, 'Excesso de velocidade', 130.16, 0.057, 'DETRAN-CE/estimativa'),
    ('PE', 2024, 0.73, 178.00, 'Excesso de velocidade', 130.16, 0.061, 'DETRAN-PE/estimativa'),
    ('PA', 2024, 0.65, 165.00, 'Estacionamento irregular', 195.23, 0.054, 'DETRAN-PA/estimativa'),
    ('AM', 2024, 0.60, 160.00, 'Excesso de velocidade', 130.16, 0.050, 'DETRAN-AM/estimativa'),
    ('MA', 2024, 0.58, 155.00, 'Excesso de velocidade', 130.16, 0.048, 'DETRAN-MA/estimativa'),
    ('ES', 2024, 0.76, 183.00, 'Excesso de velocidade', 130.16, 0.063, 'DETRAN-ES/estimativa'),
    ('MT', 2024, 0.74, 180.00, 'Excesso de velocidade', 130.16, 0.062, 'DETRAN-MT/estimativa'),
    ('MS', 2024, 0.71, 172.00, 'Excesso de velocidade', 130.16, 0.059, 'DETRAN-MS/estimativa')
ON CONFLICT (state_code, year) DO NOTHING;

-- ============================================================
-- BENCHMARKS DE MANUTENÇÃO POR FAIXA DE KM
-- ============================================================
INSERT INTO maintenance_benchmarks (category_id, km_range_start, km_range_end, expected_maintenance_year, corrective_probability, avg_corrective_cost, source)
SELECT vc.id, ranges.km_start, ranges.km_end, ranges.maint_year, ranges.corr_prob, ranges.corr_cost, 'Estimativa mercado'
FROM vehicle_categories vc
CROSS JOIN (
    VALUES
        (0, 30000, 1500, 0.05, 800),
        (30000, 60000, 2500, 0.10, 1200),
        (60000, 100000, 3500, 0.20, 2000),
        (100000, 150000, 5000, 0.35, 3000),
        (150000, 999999, 7000, 0.50, 4500)
) AS ranges(km_start, km_end, maint_year, corr_prob, corr_cost)
WHERE vc.vehicle_type = 'carro';

INSERT INTO maintenance_benchmarks (category_id, km_range_start, km_range_end, expected_maintenance_year, corrective_probability, avg_corrective_cost, source)
SELECT vc.id, ranges.km_start, ranges.km_end, ranges.maint_year, ranges.corr_prob, ranges.corr_cost, 'Estimativa mercado'
FROM vehicle_categories vc
CROSS JOIN (
    VALUES
        (0, 20000, 800, 0.05, 500),
        (20000, 40000, 1200, 0.10, 800),
        (40000, 70000, 2000, 0.20, 1200),
        (70000, 100000, 3000, 0.35, 2000),
        (100000, 999999, 4000, 0.50, 3000)
) AS ranges(km_start, km_end, maint_year, corr_prob, corr_cost)
WHERE vc.vehicle_type = 'moto';
