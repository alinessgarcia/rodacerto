// src/services/depreciation.ts
// Modelo de depreciação inteligente para veículos

/**
 * Curva de depreciação brasileira ajustada.
 *
 * Veículos de aplicativo depreciam mais rápido por dois motivos:
 * 1. Km rodados muito acima da média
 * 2. Desgaste acelerado pela cidade (freadas, buracos)
 *
 * Modelo: Depreciação = Base × Fator de Uso Intenso × Curva por Idade
 */

interface DepreciationInput {
    currentValue: number
    vehicleYear: number
    currentKm: number
    avgKmMonth: number
    baseRate: number            // Taxa anual base (ex: 0.12)
}

interface DepreciationResult {
    monthlyDepreciation: number
    yearlyDepreciation: number
    valueIn1Year: number
    valueIn3Years: number
    depreciationPerKm: number
    adjustedRate: number         // Taxa ajustada pelo uso
}

/**
 * Calcula depreciação ajustada para uso intenso (motorista de app).
 *
 * Fórmulas:
 * - Fator Km: Se km > 15000/ano, multiplica proporcionalmente
 * - Fator Idade: Carro 0km deprecia ~20% no 1° ano, depois estabiliza
 * - Fator Uso: Uso 24/7 (app) = 1.2x vs uso pessoal
 */
export function calculateDepreciation(input: DepreciationInput): DepreciationResult {
    const currentYear = new Date().getFullYear()
    const vehicleAge = currentYear - input.vehicleYear

    // 1. Fator de idade (novos depreciam mais rápido)
    const ageFactor = getAgeFactor(vehicleAge)

    // 2. Fator de km (uso intenso)
    const annualKm = input.avgKmMonth * 12
    const avgAnnualKm = 15000 // Média brasileira
    const kmFactor = annualKm > avgAnnualKm
        ? 1 + ((annualKm - avgAnnualKm) / avgAnnualKm) * 0.3
        : 1.0

    // 3. Fator de uso app (desgaste acelerado)
    const appUseFactor = 1.15

    // 4. Taxa ajustada
    const adjustedRate = Math.min(
        input.baseRate * ageFactor * kmFactor * appUseFactor,
        0.35 // Cap em 35% ao ano
    )

    const yearlyDepreciation = input.currentValue * adjustedRate
    const monthlyDepreciation = yearlyDepreciation / 12
    const depreciationPerKm = annualKm > 0 ? yearlyDepreciation / annualKm : 0

    // Projeções
    const valueIn1Year = input.currentValue * (1 - adjustedRate)
    const valueIn3Years = input.currentValue * Math.pow(1 - adjustedRate, 3)

    return {
        monthlyDepreciation: round2(monthlyDepreciation),
        yearlyDepreciation: round2(yearlyDepreciation),
        valueIn1Year: round2(valueIn1Year),
        valueIn3Years: round2(valueIn3Years),
        depreciationPerKm: round4(depreciationPerKm),
        adjustedRate: round4(adjustedRate),
    }
}

/**
 * Fator de depreciação por idade do veículo.
 * Baseado na curva FIPE real brasileira.
 */
function getAgeFactor(age: number): number {
    if (age <= 0) return 1.6  // 0km → deprecia ~60% mais que a taxa base
    if (age === 1) return 1.3  // 1 ano
    if (age === 2) return 1.1  // 2 anos
    if (age === 3) return 1.0  // 3 anos (referência)
    if (age <= 5) return 0.9   // 4-5 anos
    if (age <= 8) return 0.8   // 6-8 anos
    return 0.7                  // 9+ anos (deprecia menos em valor absoluto)
}

function round2(n: number): number {
    return Math.round(n * 100) / 100
}

function round4(n: number): number {
    return Math.round(n * 10000) / 10000
}
