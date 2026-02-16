// src/services/monte-carlo.ts
// Simulação Monte Carlo simplificada para análise de risco

import type { ScenarioResult } from '@/types/simulation'

interface MonteCarloInput {
    baseProfit: number           // Lucro líquido mensal base
    grossEarnings: number        // Receita bruta mensal
    fuelCost: number             // Custo combustível mensal
    fineProb: number             // Probabilidade mensal de multa
    fineAvgValue: number         // Valor médio da multa
    correctiveProb: number       // Prob de manutenção corretiva
    correctiveCost: number       // Custo médio corretivo
}

/**
 * Simulação Monte Carlo com 1000 iterações.
 * Varia receita (±20%), combustível (±10%), e eventos probabilísticos.
 *
 * Roda inteiramente no client-side.
 * Para datasets maiores, poderia ser movido para Web Worker.
 */
export function runMonteCarlo(
    input: MonteCarloInput,
    iterations: number = 1000
): ScenarioResult {
    const results: number[] = []

    for (let i = 0; i < iterations; i++) {
        // 1. Variação na receita: ±20% (distribuição normal aproximada)
        const earningsVariation = gaussianRandom(1.0, 0.10)
        const adjustedEarnings = input.grossEarnings * earningsVariation

        // 2. Variação no combustível: ±10%
        const fuelVariation = gaussianRandom(1.0, 0.05)
        const adjustedFuel = input.fuelCost * fuelVariation

        // 3. Multa: evento binomial
        const gotFine = Math.random() < input.fineProb
        const fineCost = gotFine
            ? input.fineAvgValue * gaussianRandom(1.0, 0.3) // Valor varia ±30%
            : 0

        // 4. Manutenção corretiva: evento binomial
        const hadCorrective = Math.random() < input.correctiveProb
        const correctiveCost = hadCorrective
            ? input.correctiveCost * gaussianRandom(1.0, 0.4) // Valor varia ±40%
            : 0

        // Lucro desta iteração
        const iterationProfit = input.baseProfit
            + (adjustedEarnings - input.grossEarnings)  // Variação receita
            - (adjustedFuel - input.fuelCost)            // Variação combustível
            - fineCost
            - correctiveCost

        results.push(iterationProfit)
    }

    // Ordenar para percentis
    results.sort((a, b) => a - b)

    const pessimistic = percentile(results, 10)
    const realistic = percentile(results, 50)
    const optimistic = percentile(results, 90)
    const stdDev = standardDeviation(results)
    const lossCount = results.filter(r => r < 0).length
    const probabilityLoss = (lossCount / iterations) * 100

    return {
        pessimistic: round2(pessimistic),
        realistic: round2(realistic),
        optimistic: round2(optimistic),
        standardDeviation: round2(stdDev),
        probabilityLoss: round2(probabilityLoss),
    }
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Gera número aleatório com distribuição normal (Box-Muller).
 * @param mean - Média
 * @param stdDev - Desvio padrão
 */
function gaussianRandom(mean: number, stdDev: number): number {
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return mean + z * stdDev
}

/**
 * Calcula o percentil de um array ordenado.
 */
function percentile(sortedArr: number[], p: number): number {
    const index = (p / 100) * (sortedArr.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    if (lower === upper) return sortedArr[lower]
    const fraction = index - lower
    return sortedArr[lower] + (sortedArr[upper] - sortedArr[lower]) * fraction
}

/**
 * Desvio padrão amostral.
 */
function standardDeviation(arr: number[]): number {
    const n = arr.length
    if (n < 2) return 0
    const mean = arr.reduce((sum, val) => sum + val, 0) / n
    const variance = arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / (n - 1)
    return Math.sqrt(variance)
}

function round2(n: number): number {
    return Math.round(n * 100) / 100
}
