-- Tabela de Categorias de Veículos (ex: Hatch, Sedan, SUV, Moto)
create table vehicle_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avg_maintenance_cost numeric, -- Custo médio anual de manutenção
  avg_tire_cost numeric, -- Custo médio de um pneu
  avg_oil_change_cost numeric, -- Custo médio de troca de óleo
  created_at timestamptz default now()
);

-- Tabela de Combustíveis (Atualizada via Python diariamente)
create table fuel_prices (
  id uuid primary key default gen_random_uuid(),
  state_code char(2) not null, -- UF
  city text, -- Cidade (opcional, se nulo = média do estado)
  fuel_type text not null, -- Gasolina, Etanol, Diesel, GNV
  price numeric not null,
  updated_at timestamptz default now()
);

-- Tabela de Veículos Base (Preenchida via script ou manual)
create table vehicles_base (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year int not null,
  category_id uuid references vehicle_categories(id),
  avg_consumption_city numeric, -- km/l
  avg_consumption_road numeric, -- km/l
  fipe_value numeric, -- Valor FIPE estimado
  created_at timestamptz default now()
);

-- Tabela de Simulações do Usuário (Local-first, mas sync opcional)
create table user_simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id), -- Opcional, se logado
  vehicle_name text, -- Nome personalizado (ex: "Meu Onix")
  
  -- Inputs do Veículo
  vehicle_base_id uuid references vehicles_base(id),
  current_value numeric, -- Valor do veículo
  is_rented boolean default false,
  rental_cost_weekly numeric, -- Custo semanal se alugado
  
  -- Inputs de Uso
  avg_km_day numeric, -- Km rodados por dia
  days_worked_week int, -- Dias trabalhados
  hours_worked_day numeric, -- Horas por dia
  empty_km_percentage numeric, -- % de km batendo lata
  
  -- Inputs Financeiros
  gross_earnings_day numeric, -- Faturamento bruto diário
  insurance_cost_year numeric, -- Seguro anual
  ipva_cost_year numeric, -- IPVA anual
  licensing_cost_year numeric, -- Licenciamento
  
  created_at timestamptz default now()
);

-- Tabela de Multas (Estatística)
create table fine_statistics (
  id uuid primary key default gen_random_uuid(),
  state_code char(2),
  avg_fines_per_driver_year numeric, -- Média de multas por motorista/ano
  avg_fine_value numeric, -- Valor médio da multa
  updated_at timestamptz default now()
);

-- Índices para performance
create index idx_fuel_prices_state on fuel_prices(state_code);
create index idx_vehicles_base_brand_model on vehicles_base(brand, model);
