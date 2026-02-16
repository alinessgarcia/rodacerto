// src/types/simulation.ts
// Tipos completos para o motor de cálculo do RodaCerto

// ============================================================
// INPUTS
// ============================================================

export type VehicleType = 'carro' | 'moto'
export type FuelType = 'gasolina' | 'etanol' | 'diesel' | 'gnv'
export type Platform = 'uber' | '99' | 'indriver' | 'misto'
export type OwnershipType = 'proprio' | 'alugado' | 'financiado'

/** Dados do veículo */
export interface VehicleInput {
  brand: string
  model: string
  year: number
  vehicleType: VehicleType
  currentValue: number          // Valor atual do veículo
  currentKm: number             // Km atuais no hodômetro
  fuelType: FuelType
  consumption: number           // km/l (manual ou da base)
  categoryId?: string           // UUID da categoria
}

/** Dados de posse */
export interface OwnershipInput {
  type: OwnershipType
  // Próprio
  insuranceYear?: number
  ipvaYear?: number
  licensingYear?: number
  // Alugado
  rentalCostWeekly?: number
  // Financiado
  financeMonthlyPayment?: number
  financeRemainingMonths?: number
}

/** Dados de uso diário */
export interface UsageInput {
  avgKmDay: number              // Km rodados por dia
  daysWorkedWeek: number        // Dias trabalhados por semana
  hoursWorkedDay: number        // Horas por dia
  emptyKmPercentage: number     // % de km vazio (0-100)
  platform: Platform
  grossEarningsDay: number      // Faturamento bruto diário
  stateCode: string             // UF para preço combustível
}

/** Dados de manutenção (se o usuário quiser sobrescrever defaults) */
export interface MaintenanceInput {
  maintenanceCostYear?: number
  tireCostSet?: number           // Custo do jogo completo de pneus
  tireLifespanKm?: number
  oilChangeCost?: number
  oilChangeIntervalKm?: number
  brakePadCost?: number
  brakeLifespanKm?: number
}

/** Dados de combustível */
export interface FuelInput {
  priceOverride?: number         // Se quiser forçar preço
  autoPrice?: number             // Preço vindo do banco
}

/** Input completo da simulação */
export interface SimulationInput {
  vehicle: VehicleInput
  ownership: OwnershipInput
  usage: UsageInput
  maintenance: MaintenanceInput
  fuel: FuelInput
}

// ============================================================
// OUTPUTS
// ============================================================

/** Breakdown de custos */
export interface CostBreakdown {
  fuel: number
  tireCost: number
  oilCost: number
  brakeCost: number
  generalMaintenance: number
  correctiveMaintenance: number
  insurance: number
  ipva: number
  licensing: number
  depreciation: number
  rental: number
  financing: number
  fineExpected: number
  totalVariable: number
  totalFixed: number
  totalProbabilistic: number
  total: number
}

/** Projeções temporais */
export interface Projections {
  daily: ProjectionPeriod
  monthly: ProjectionPeriod
  yearly: ProjectionPeriod
}

export interface ProjectionPeriod {
  grossEarnings: number
  platformFee: number
  netEarnings: number            // Pós taxa plataforma
  totalCosts: number
  netProfit: number
  costPerKm: number
  kmDriven: number
  kmEmpty: number
  hourlyWage: number
}

/** Índices de avaliação */
export interface AssessmentIndices {
  viabilityScore: number         // 0-10
  riskScore: number              // 0-10
  burnoutLevel: 'baixo' | 'moderado' | 'alto' | 'critico'
  burnoutScore: number           // 0-10
  profitMargin: number           // percentual
  breakEvenKmDay: number         // Km/dia para empatar
  breakEvenDaysMonth: number     // Dias/mês para empatar
  cltEquivalent: number          // Salário CLT equivalente
  opportunityCost: number        // Se investisse o valor do carro
}

/** Cenários Monte Carlo */
export interface ScenarioResult {
  pessimistic: number            // Percentil 10
  realistic: number              // Percentil 50
  optimistic: number             // Percentil 90
  standardDeviation: number
  probabilityLoss: number        // % de chance de prejuízo
}

/** Alertas e insights */
export interface SimulationAlert {
  type: 'danger' | 'warning' | 'info' | 'success'
  icon: string
  title: string
  message: string
}

/** Resultado completo da simulação */
export interface SimulationResult {
  costs: CostBreakdown
  projections: Projections
  indices: AssessmentIndices
  scenarios: ScenarioResult
  alerts: SimulationAlert[]
  fuelRecommendation: {
    recommended: FuelType
    savings: number               // Economia mensal
    reason: string
  }
  metadata: {
    calculatedAt: string
    inputHash: string
  }
}

// ============================================================
// DEFAULTS INTELIGENTES
// ============================================================

export interface CategoryDefaults {
  maintenanceCostYear: number
  tireCostSet: number
  tireLifespanKm: number
  oilChangeCost: number
  oilChangeIntervalKm: number
  brakePadCost: number
  brakeLifespanKm: number
  depreciationRate: number
  tireQty: number
}

// ============================================================
// CONSTANTES
// ============================================================

export const PLATFORM_FEES: Record<Platform, number> = {
  uber: 0.25,
  '99': 0.20,
  indriver: 0.10,
  misto: 0.22,
}

export const WEEKS_PER_MONTH = 4.33
export const MONTHS_PER_YEAR = 12

/** Taxa Selic anual aproximada para cálculo de custo de oportunidade */
export const SELIC_ANNUAL_RATE = 0.1325

/** Fator CLT: 13°, férias, FGTS ~35% a mais */
export const CLT_EQUIVALENCE_FACTOR = 1.35

/** Motoristas de app rodam ~70% cidade, 30% estrada */
export const CITY_ROAD_MIX = { city: 0.70, road: 0.30 }
