// src/services/comparator.ts
// Comparação entre dois cenários de simulação

import type { SimulationInput, SimulationResult } from '@/types/simulation'
import { calculateSimulation } from './calculator'

export interface ComparisonResult {
    scenarioA: {
        label: string
        result: SimulationResult
    }
    scenarioB: {
        label: string
        result: SimulationResult
    }
    differences: {
        netProfitMonthly: number     // A - B (positivo = A é melhor)
        netProfitYearly: number
        costPerKm: number
        hourlyWage: number
        riskScore: number
        viabilityScore: number
        breakEvenDays: number
    }
    recommendation: {
        winner: 'A' | 'B' | 'empate'
        reason: string
        details: string[]
    }
}

/**
 * Compara dois cenários de simulação.
 * Útil para: carro A vs carro B, próprio vs alugado, carro vs moto.
 */
export function compareSimulations(
    labelA: string,
    inputA: SimulationInput,
    labelB: string,
    inputB: SimulationInput
): ComparisonResult {
    const resultA = calculateSimulation(inputA)
    const resultB = calculateSimulation(inputB)

    const diffProfit = resultA.projections.monthly.netProfit - resultB.projections.monthly.netProfit
    const diffCostKm = resultA.projections.monthly.costPerKm - resultB.projections.monthly.costPerKm
    const diffHourly = resultA.projections.monthly.hourlyWage - resultB.projections.monthly.hourlyWage
    const diffRisk = resultA.indices.riskScore - resultB.indices.riskScore
    const diffViability = resultA.indices.viabilityScore - resultB.indices.viabilityScore
    const diffBreakEven = resultA.indices.breakEvenDaysMonth - resultB.indices.breakEvenDaysMonth

    // Determinar vencedor
    let scoreA = 0
    let scoreB = 0
    const details: string[] = []

    if (diffProfit > 50) {
        scoreA += 3
        details.push(`${labelA} lucra R$ ${round2(diffProfit)} a mais por mês`)
    } else if (diffProfit < -50) {
        scoreB += 3
        details.push(`${labelB} lucra R$ ${round2(Math.abs(diffProfit))} a mais por mês`)
    } else {
        details.push('Lucro mensal praticamente igual')
    }

    if (diffCostKm < -0.05) {
        scoreA += 2
        details.push(`${labelA} tem custo/km menor (R$ ${round2(Math.abs(diffCostKm))} de diferença)`)
    } else if (diffCostKm > 0.05) {
        scoreB += 2
        details.push(`${labelB} tem custo/km menor (R$ ${round2(Math.abs(diffCostKm))} de diferença)`)
    }

    if (diffRisk < -1) {
        scoreA += 1
        details.push(`${labelA} tem menor risco financeiro`)
    } else if (diffRisk > 1) {
        scoreB += 1
        details.push(`${labelB} tem menor risco financeiro`)
    }

    if (diffViability > 0.5) {
        scoreA += 1
        details.push(`${labelA} tem melhor viabilidade geral`)
    } else if (diffViability < -0.5) {
        scoreB += 1
        details.push(`${labelB} tem melhor viabilidade geral`)
    }

    let winner: 'A' | 'B' | 'empate'
    let reason: string

    if (scoreA > scoreB + 1) {
        winner = 'A'
        reason = `${labelA} é a melhor opção na maioria dos critérios.`
    } else if (scoreB > scoreA + 1) {
        winner = 'B'
        reason = `${labelB} é a melhor opção na maioria dos critérios.`
    } else {
        winner = 'empate'
        reason = 'As duas opções são muito parecidas. Considere fatores pessoais (conforto, segurança).'
    }

    return {
        scenarioA: { label: labelA, result: resultA },
        scenarioB: { label: labelB, result: resultB },
        differences: {
            netProfitMonthly: round2(diffProfit),
            netProfitYearly: round2(diffProfit * 12),
            costPerKm: round2(diffCostKm),
            hourlyWage: round2(diffHourly),
            riskScore: round2(diffRisk),
            viabilityScore: round2(diffViability),
            breakEvenDays: round2(diffBreakEven),
        },
        recommendation: { winner, reason, details },
    }
}

function round2(n: number): number {
    return Math.round(n * 100) / 100
}
