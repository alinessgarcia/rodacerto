// src/types/vehicle.ts
// Tipos para dados de veículos e referência

export interface VehicleCategory {
    id: string
    name: string
    vehicleType: 'carro' | 'moto'
    avgMaintenanceCostYear: number
    avgTireCostUnit: number
    tireQty: number
    tireLifespanKm: number
    avgOilChangeCost: number
    oilChangeIntervalKm: number
    avgBrakePadCost: number
    brakeLifespanKm: number
    depreciationRateYear: number
}

export interface VehicleBase {
    id: string
    brand: string
    model: string
    year: number
    vehicleType: 'carro' | 'moto'
    categoryId: string
    avgConsumptionCity: number
    avgConsumptionRoad: number
    avgConsumptionMixed: number
    fipeValue: number
    fipeCode?: string
    engineCc?: number
    fuelType: string
}

export interface VehicleWithCategory extends VehicleBase {
    categoryName: string
    avgMaintenanceCostYear: number
    avgTireCostUnit: number
    tireQty: number
    tireLifespanKm: number
    avgOilChangeCost: number
    oilChangeIntervalKm: number
    avgBrakePadCost: number
    brakeLifespanKm: number
    depreciationRateYear: number
}

export interface FuelPrice {
    id: string
    stateCode: string
    city?: string
    fuelType: 'gasolina' | 'etanol' | 'diesel' | 'gnv'
    price: number
    priceMin?: number
    priceMax?: number
    sampleSize?: number
    referenceDate?: string
}

export interface FineStatistic {
    id: string
    stateCode: string
    year: number
    avgFinesPerDriverYear: number
    avgFineValue: number
    mostCommonFineType: string
    mostCommonFineValue: number
    probabilityMonthly: number
}

export interface MaintenanceBenchmark {
    categoryId: string
    kmRangeStart: number
    kmRangeEnd: number
    expectedMaintenanceYear: number
    correctiveProbability: number
    avgCorrectiveCost: number
}

// ============================================================
// ESTADOS BRASILEIROS
// ============================================================

export const BRAZILIAN_STATES = [
    { code: 'AC', name: 'Acre' },
    { code: 'AL', name: 'Alagoas' },
    { code: 'AP', name: 'Amapá' },
    { code: 'AM', name: 'Amazonas' },
    { code: 'BA', name: 'Bahia' },
    { code: 'CE', name: 'Ceará' },
    { code: 'DF', name: 'Distrito Federal' },
    { code: 'ES', name: 'Espírito Santo' },
    { code: 'GO', name: 'Goiás' },
    { code: 'MA', name: 'Maranhão' },
    { code: 'MT', name: 'Mato Grosso' },
    { code: 'MS', name: 'Mato Grosso do Sul' },
    { code: 'MG', name: 'Minas Gerais' },
    { code: 'PA', name: 'Pará' },
    { code: 'PB', name: 'Paraíba' },
    { code: 'PR', name: 'Paraná' },
    { code: 'PE', name: 'Pernambuco' },
    { code: 'PI', name: 'Piauí' },
    { code: 'RJ', name: 'Rio de Janeiro' },
    { code: 'RN', name: 'Rio Grande do Norte' },
    { code: 'RS', name: 'Rio Grande do Sul' },
    { code: 'RO', name: 'Rondônia' },
    { code: 'RR', name: 'Roraima' },
    { code: 'SC', name: 'Santa Catarina' },
    { code: 'SP', name: 'São Paulo' },
    { code: 'SE', name: 'Sergipe' },
    { code: 'TO', name: 'Tocantins' },
] as const

export type StateCode = typeof BRAZILIAN_STATES[number]['code']
