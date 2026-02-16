// src/lib/constants.ts
// Defaults inteligentes e constantes do RodaCerto

import type { CategoryDefaults, VehicleType } from '@/types/simulation'

/**
 * Defaults por categoria quando o usuário não tem dados específicos.
 * Valores baseados em pesquisa de mercado brasileiro 2024/2025.
 */
export const CATEGORY_DEFAULTS: Record<string, CategoryDefaults> = {
    'Hatch Popular': {
        maintenanceCostYear: 2500,
        tireCostSet: 1400,      // 4 × R$350
        tireLifespanKm: 40000,
        oilChangeCost: 180,
        oilChangeIntervalKm: 10000,
        brakePadCost: 250,
        brakeLifespanKm: 30000,
        depreciationRate: 0.12,
        tireQty: 4,
    },
    'Hatch Médio': {
        maintenanceCostYear: 3200,
        tireCostSet: 1800,
        tireLifespanKm: 45000,
        oilChangeCost: 220,
        oilChangeIntervalKm: 10000,
        brakePadCost: 300,
        brakeLifespanKm: 35000,
        depreciationRate: 0.10,
        tireQty: 4,
    },
    'Sedan Compacto': {
        maintenanceCostYear: 3000,
        tireCostSet: 1600,
        tireLifespanKm: 45000,
        oilChangeCost: 200,
        oilChangeIntervalKm: 10000,
        brakePadCost: 280,
        brakeLifespanKm: 35000,
        depreciationRate: 0.11,
        tireQty: 4,
    },
    'Sedan Médio': {
        maintenanceCostYear: 4000,
        tireCostSet: 2200,
        tireLifespanKm: 50000,
        oilChangeCost: 250,
        oilChangeIntervalKm: 10000,
        brakePadCost: 350,
        brakeLifespanKm: 35000,
        depreciationRate: 0.09,
        tireQty: 4,
    },
    'SUV Compacto': {
        maintenanceCostYear: 4500,
        tireCostSet: 2400,
        tireLifespanKm: 45000,
        oilChangeCost: 280,
        oilChangeIntervalKm: 10000,
        brakePadCost: 400,
        brakeLifespanKm: 30000,
        depreciationRate: 0.10,
        tireQty: 4,
    },
    'Moto 150-160cc': {
        maintenanceCostYear: 1200,
        tireCostSet: 360,       // 2 × R$180
        tireLifespanKm: 25000,
        oilChangeCost: 80,
        oilChangeIntervalKm: 5000,
        brakePadCost: 120,
        brakeLifespanKm: 20000,
        depreciationRate: 0.15,
        tireQty: 2,
    },
    'Moto 250-300cc': {
        maintenanceCostYear: 1800,
        tireCostSet: 500,
        tireLifespanKm: 30000,
        oilChangeCost: 120,
        oilChangeIntervalKm: 6000,
        brakePadCost: 150,
        brakeLifespanKm: 25000,
        depreciationRate: 0.13,
        tireQty: 2,
    },
}

/** Default genérico por tipo de veículo */
export const DEFAULT_BY_TYPE: Record<VehicleType, CategoryDefaults> = {
    carro: CATEGORY_DEFAULTS['Hatch Popular'],
    moto: CATEGORY_DEFAULTS['Moto 150-160cc'],
}

/** Defaults de uso para motorista de aplicativo típico */
export const USAGE_DEFAULTS = {
    avgKmDay: 200,
    daysWorkedWeek: 6,
    hoursWorkedDay: 10,
    emptyKmPercentage: 30,
    grossEarningsDay: 250,
}

/** Defaults de custos fixos */
export const FIXED_COST_DEFAULTS = {
    insuranceYear: 2500,
    ipvaYear: 3000,        // ~3-4% do valor FIPE
    licensingYear: 180,
    rentalCostWeekly: 850,
    financeMonthlyPayment: 1200,
}

/** Taxa IPVA por estado (%) */
export const IPVA_RATES: Record<string, number> = {
    SP: 0.04,
    RJ: 0.04,
    MG: 0.04,
    BA: 0.03,
    PR: 0.035,
    RS: 0.03,
    SC: 0.02,
    GO: 0.0375,
    DF: 0.035,
    CE: 0.03,
    PE: 0.03,
    PA: 0.025,
    AM: 0.03,
    MA: 0.025,
    ES: 0.02,
    MT: 0.03,
    MS: 0.035,
}

/** Calcula IPVA estimado com base no valor FIPE e estado */
export function estimateIPVA(fipeValue: number, stateCode: string): number {
    const rate = IPVA_RATES[stateCode] ?? 0.03
    return Math.round(fipeValue * rate)
}
