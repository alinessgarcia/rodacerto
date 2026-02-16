// src/services/calculator.ts
// Motor de cálculo completo do RodaCerto
// "A matemática que o motorista não faz"

import type {
  SimulationInput,
  SimulationResult,
  CostBreakdown,
  Projections,
  ProjectionPeriod,
  AssessmentIndices,
  SimulationAlert,
  FuelType,
} from '@/types/simulation'

import {
  PLATFORM_FEES,
  WEEKS_PER_MONTH,
  MONTHS_PER_YEAR,
  SELIC_ANNUAL_RATE,
  CLT_EQUIVALENCE_FACTOR,
} from '@/types/simulation'

import { calculateDepreciation } from './depreciation'
import { runMonteCarlo } from './monte-carlo'
import { DEFAULT_BY_TYPE } from '@/lib/constants'

// ============================================================
// FUNÇÃO PRINCIPAL
// ============================================================

/**
 * Calcula a simulação completa.
 *
 * Fluxo:
 * 1. Resolva todos os inputs com defaults
 * 2. Calcule temporalidade (dias/mês, km/mês)
 * 3. Calcule custos (variáveis, fixos, probabilísticos)
 * 4. Calcule projeções (diário, mensal, anual)
 * 5. Calcule índices de avaliação
 * 6. Rode Monte Carlo
 * 7. Gere alertas
 */
export function calculateSimulation(input: SimulationInput): SimulationResult {
  // ========== 1. RESOLVER INPUTS ==========
  const defaults = DEFAULT_BY_TYPE[input.vehicle.vehicleType]
  const platformFeeRate = PLATFORM_FEES[input.usage.platform]

  const maintenance = {
    maintenanceCostYear: input.maintenance.maintenanceCostYear ?? defaults.maintenanceCostYear,
    tireCostSet: input.maintenance.tireCostSet ?? (defaults.tireCostSet),
    tireLifespanKm: input.maintenance.tireLifespanKm ?? defaults.tireLifespanKm,
    oilChangeCost: input.maintenance.oilChangeCost ?? defaults.oilChangeCost,
    oilChangeIntervalKm: input.maintenance.oilChangeIntervalKm ?? defaults.oilChangeIntervalKm,
    brakePadCost: input.maintenance.brakePadCost ?? defaults.brakePadCost,
    brakeLifespanKm: input.maintenance.brakeLifespanKm ?? defaults.brakeLifespanKm,
  }

  const fuelPrice = input.fuel.priceOverride ?? input.fuel.autoPrice ?? 6.00
  const consumption = input.vehicle.consumption

  // ========== 2. TEMPORALIDADE ==========
  const daysPerMonth = input.usage.daysWorkedWeek * WEEKS_PER_MONTH
  const hoursPerMonth = input.usage.hoursWorkedDay * daysPerMonth
  const kmPerDay = input.usage.avgKmDay
  const kmPerMonth = kmPerDay * daysPerMonth
  const kmPerYear = kmPerMonth * MONTHS_PER_YEAR
  const kmEmptyPerMonth = kmPerMonth * (input.usage.emptyKmPercentage / 100)

  // ========== 3. RECEITA ==========
  const grossMonthly = input.usage.grossEarningsDay * daysPerMonth
  const platformFee = grossMonthly * platformFeeRate
  const netEarnings = grossMonthly - platformFee

  // ========== 4. COMBUSTÍVEL ==========
  const litersPerMonth = kmPerMonth / consumption
  const fuelCostMonthly = litersPerMonth * fuelPrice

  // Recomendação etanol vs gasolina
  const fuelRecommendation = calculateFuelRecommendation(input, kmPerMonth, consumption)

  // ========== 5. MANUTENÇÃO VARIÁVEL ==========
  const tireCostMonthly = safeDivide(maintenance.tireCostSet, maintenance.tireLifespanKm) * kmPerMonth
  const oilCostMonthly = safeDivide(maintenance.oilChangeCost, maintenance.oilChangeIntervalKm) * kmPerMonth
  const brakeCostMonthly = safeDivide(maintenance.brakePadCost, maintenance.brakeLifespanKm) * kmPerMonth
  const generalMaintenanceMonthly = maintenance.maintenanceCostYear / MONTHS_PER_YEAR

  // Manutenção corretiva (probabilística baseada em km)
  const correctiveProb = getCorrectiveProbability(input.vehicle.currentKm)
  const correctiveCostAvg = getCorrectiveCost(input.vehicle.vehicleType)
  const correctiveMonthly = correctiveProb * correctiveCostAvg / MONTHS_PER_YEAR

  const totalMaintenanceMonthly = tireCostMonthly + oilCostMonthly + brakeCostMonthly
    + generalMaintenanceMonthly + correctiveMonthly

  // ========== 6. CUSTOS FIXOS ==========
  let fixedInsurance = 0
  let fixedIpva = 0
  let fixedLicensing = 0
  let depreciationMonthly = 0
  let rentalMonthly = 0
  let financingMonthly = 0

  switch (input.ownership.type) {
    case 'proprio':
      fixedInsurance = (input.ownership.insuranceYear ?? 0) / MONTHS_PER_YEAR
      fixedIpva = (input.ownership.ipvaYear ?? 0) / MONTHS_PER_YEAR
      fixedLicensing = (input.ownership.licensingYear ?? 0) / MONTHS_PER_YEAR

      const depResult = calculateDepreciation({
        currentValue: input.vehicle.currentValue,
        vehicleYear: input.vehicle.year,
        currentKm: input.vehicle.currentKm,
        avgKmMonth: kmPerMonth,
        baseRate: defaults.depreciationRate,
      })
      depreciationMonthly = depResult.monthlyDepreciation
      break

    case 'alugado':
      rentalMonthly = (input.ownership.rentalCostWeekly ?? 0) * WEEKS_PER_MONTH
      break

    case 'financiado':
      fixedInsurance = (input.ownership.insuranceYear ?? 0) / MONTHS_PER_YEAR
      fixedIpva = (input.ownership.ipvaYear ?? 0) / MONTHS_PER_YEAR
      fixedLicensing = (input.ownership.licensingYear ?? 0) / MONTHS_PER_YEAR
      financingMonthly = input.ownership.financeMonthlyPayment ?? 0

      const depResultFin = calculateDepreciation({
        currentValue: input.vehicle.currentValue,
        vehicleYear: input.vehicle.year,
        currentKm: input.vehicle.currentKm,
        avgKmMonth: kmPerMonth,
        baseRate: defaults.depreciationRate,
      })
      depreciationMonthly = depResultFin.monthlyDepreciation
      break
  }

  const totalFixedMonthly = fixedInsurance + fixedIpva + fixedLicensing
    + depreciationMonthly + rentalMonthly + financingMonthly

  // ========== 7. CUSTOS PROBABILÍSTICOS ==========
  // Multas: ajustado por horas trabalhadas
  const baseFineProb = 0.065 // ~6.5% ao mês (média Brasil)
  const hoursMultiplier = input.usage.hoursWorkedDay > 10
    ? 1 + (input.usage.hoursWorkedDay - 10) * 0.05
    : 1.0
  const adjustedFineProb = Math.min(baseFineProb * hoursMultiplier, 0.20)
  const avgFineValue = 195.00
  const expectedFineCostMonthly = adjustedFineProb * avgFineValue

  // ========== 8. TOTAIS ==========
  const totalVariable = fuelCostMonthly + totalMaintenanceMonthly
  const totalProbabilistic = expectedFineCostMonthly
  const totalCosts = totalVariable + totalFixedMonthly + totalProbabilistic

  const netProfit = netEarnings - totalCosts

  // ========== 9. COST BREAKDOWN ==========
  const costs: CostBreakdown = {
    fuel: round2(fuelCostMonthly),
    tireCost: round2(tireCostMonthly),
    oilCost: round2(oilCostMonthly),
    brakeCost: round2(brakeCostMonthly),
    generalMaintenance: round2(generalMaintenanceMonthly),
    correctiveMaintenance: round2(correctiveMonthly),
    insurance: round2(fixedInsurance),
    ipva: round2(fixedIpva),
    licensing: round2(fixedLicensing),
    depreciation: round2(depreciationMonthly),
    rental: round2(rentalMonthly),
    financing: round2(financingMonthly),
    fineExpected: round2(expectedFineCostMonthly),
    totalVariable: round2(totalVariable),
    totalFixed: round2(totalFixedMonthly),
    totalProbabilistic: round2(totalProbabilistic),
    total: round2(totalCosts),
  }

  // ========== 10. PROJEÇÕES ==========
  const costPerKm = kmPerMonth > 0 ? totalCosts / kmPerMonth : 0
  const hourlyWage = hoursPerMonth > 0 ? netProfit / hoursPerMonth : 0

  const monthlyProjection: ProjectionPeriod = {
    grossEarnings: round2(grossMonthly),
    platformFee: round2(platformFee),
    netEarnings: round2(netEarnings),
    totalCosts: round2(totalCosts),
    netProfit: round2(netProfit),
    costPerKm: round2(costPerKm),
    kmDriven: round2(kmPerMonth),
    kmEmpty: round2(kmEmptyPerMonth),
    hourlyWage: round2(hourlyWage),
  }

  const projections: Projections = {
    daily: scaleProjection(monthlyProjection, 1 / daysPerMonth),
    monthly: monthlyProjection,
    yearly: scaleProjection(monthlyProjection, MONTHS_PER_YEAR),
  }

  // ========== 11. ÍNDICES ==========
  const margin = grossMonthly > 0 ? (netProfit / grossMonthly) * 100 : 0

  const breakEvenKmDay = totalFixedMonthly > 0 && costPerKm < (netEarnings / kmPerMonth)
    ? (totalFixedMonthly / ((netEarnings / kmPerMonth) - safeDivide(totalVariable, kmPerMonth))) / daysPerMonth * WEEKS_PER_MONTH
    : kmPerDay

  const breakEvenDaysMonth = input.usage.grossEarningsDay > 0
    ? totalCosts / (input.usage.grossEarningsDay * (1 - platformFeeRate) - (totalVariable / daysPerMonth))
    : daysPerMonth

  const opportunityCost = input.ownership.type !== 'alugado'
    ? (input.vehicle.currentValue * SELIC_ANNUAL_RATE) / MONTHS_PER_YEAR
    : 0

  const cltEquivalent = netProfit * CLT_EQUIVALENCE_FACTOR

  const burnoutResult = calculateBurnout(input.usage.hoursWorkedDay, input.usage.daysWorkedWeek)

  const riskScore = Math.min(10, Math.round((totalCosts / Math.max(grossMonthly, 1)) * 10))

  const viabilityScore = calculateViability(margin, hourlyWage, riskScore, burnoutResult.score)

  const indices: AssessmentIndices = {
    viabilityScore,
    riskScore,
    burnoutLevel: burnoutResult.level,
    burnoutScore: burnoutResult.score,
    profitMargin: round2(margin),
    breakEvenKmDay: round2(Math.max(0, breakEvenKmDay)),
    breakEvenDaysMonth: round2(Math.min(Math.max(0, breakEvenDaysMonth), 31)),
    cltEquivalent: round2(cltEquivalent),
    opportunityCost: round2(opportunityCost),
  }

  // ========== 12. MONTE CARLO ==========
  const scenarios = runMonteCarlo({
    baseProfit: netProfit,
    grossEarnings: grossMonthly,
    fuelCost: fuelCostMonthly,
    fineProb: adjustedFineProb,
    fineAvgValue: avgFineValue,
    correctiveProb: correctiveProb,
    correctiveCost: correctiveCostAvg,
  })

  // ========== 13. ALERTAS ==========
  const alerts = generateAlerts(
    netProfit,
    margin,
    hourlyWage,
    burnoutResult,
    input,
    scenarios.probabilityLoss,
    opportunityCost
  )

  // ========== 14. RESULTADO ==========
  return {
    costs,
    projections,
    indices,
    scenarios,
    alerts,
    fuelRecommendation,
    metadata: {
      calculatedAt: new Date().toISOString(),
      inputHash: simpleHash(JSON.stringify(input)),
    },
  }
}

// ============================================================
// FUNÇÕES DE APOIO
// ============================================================

function calculateFuelRecommendation(
  input: SimulationInput,
  kmPerMonth: number,
  consumption: number
) {
  // Regra: Se etanol/gasolina < 0.70 → etanol é mais vantajoso
  const gasolinaPrice = input.fuel.autoPrice ?? input.fuel.priceOverride ?? 6.00
  // Assumir etanol ~63% do preço da gasolina como default
  const etanolPrice = gasolinaPrice * 0.63

  const ratio = etanolPrice / gasolinaPrice
  const etanolConsumption = consumption * 0.70 // Etanol rende ~70% da gasolina

  const gasolinaCost = (kmPerMonth / consumption) * gasolinaPrice
  const etanolCost = (kmPerMonth / etanolConsumption) * etanolPrice

  const recommended: FuelType = ratio < 0.70 ? 'etanol' : 'gasolina'
  const savings = Math.abs(gasolinaCost - etanolCost)

  return {
    recommended,
    savings: round2(savings),
    reason: ratio < 0.70
      ? `Etanol a ${round2(ratio * 100)}% do preço da gasolina. Economia de R$ ${round2(savings)}/mês.`
      : `Gasolina é mais vantajosa. Etanol a ${round2(ratio * 100)}% do preço (deveria ser < 70%).`,
  }
}

function getCorrectiveProbability(currentKm: number): number {
  if (currentKm < 30000) return 0.05
  if (currentKm < 60000) return 0.10
  if (currentKm < 100000) return 0.20
  if (currentKm < 150000) return 0.35
  return 0.50
}

function getCorrectiveCost(vehicleType: 'carro' | 'moto'): number {
  return vehicleType === 'carro' ? 2000 : 800
}

function calculateBurnout(
  hoursDay: number,
  daysWeek: number
): { level: 'baixo' | 'moderado' | 'alto' | 'critico'; score: number } {
  const weeklyHours = hoursDay * daysWeek

  if (weeklyHours >= 72 || hoursDay >= 14) return { level: 'critico', score: 10 }
  if (weeklyHours >= 60 || hoursDay >= 12) return { level: 'alto', score: 8 }
  if (weeklyHours >= 48 || hoursDay >= 10) return { level: 'moderado', score: 5 }
  return { level: 'baixo', score: 2 }
}

function calculateViability(
  margin: number,
  hourlyWage: number,
  riskScore: number,
  burnoutScore: number
): number {
  // Combina: margem (40%), valor/hora (30%), risco inverso (20%), burnout inverso (10%)
  const marginScore = Math.min(10, Math.max(0, margin / 5))         // 50% = 10
  const hourlyScore = Math.min(10, Math.max(0, hourlyWage / 4))     // R$40/h = 10
  const riskInverse = 10 - riskScore
  const burnoutInverse = 10 - burnoutScore

  const score = marginScore * 0.4 + hourlyScore * 0.3 + riskInverse * 0.2 + burnoutInverse * 0.1
  return round2(Math.min(10, Math.max(0, score)))
}

function generateAlerts(
  netProfit: number,
  margin: number,
  hourlyWage: number,
  burnout: { level: string; score: number },
  input: SimulationInput,
  lossProb: number,
  opportunityCost: number
): SimulationAlert[] {
  const alerts: SimulationAlert[] = []

  // Margem negativa
  if (netProfit < 0) {
    alerts.push({
      type: 'danger',
      icon: '🚨',
      title: 'Prejuízo!',
      message: `Você está PERDENDO R$ ${Math.abs(round2(netProfit))}/mês. Revise seus custos ou aumente o faturamento.`,
    })
  }

  // Margem < 15%
  if (margin > 0 && margin < 15) {
    alerts.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Margem Muito Baixa',
      message: `Sua margem de lucro é de apenas ${round2(margin)}%. Qualquer imprevisto pode gerar prejuízo.`,
    })
  }

  // Hora trabalhada < salário mínimo (~R$7.50/h)
  if (hourlyWage > 0 && hourlyWage < 7.50) {
    alerts.push({
      type: 'danger',
      icon: '💰',
      title: 'Abaixo do Salário Mínimo',
      message: `Seu ganho líquido é de R$ ${round2(hourlyWage)}/h. O salário mínimo hora é ~R$ 7,50.`,
    })
  }

  // Hora trabalhada < R$15
  if (hourlyWage >= 7.50 && hourlyWage < 15) {
    alerts.push({
      type: 'warning',
      icon: '⏰',
      title: 'Valor da Hora Baixo',
      message: `Você ganha R$ ${round2(hourlyWage)}/h líquido. Um emprego CLT equivalente pagaria mais com benefícios.`,
    })
  }

  // Burnout
  if (burnout.level === 'critico') {
    alerts.push({
      type: 'danger',
      icon: '🔥',
      title: 'Risco Crítico de Burnout',
      message: `${input.usage.hoursWorkedDay}h/dia × ${input.usage.daysWorkedWeek} dias/semana é insustentável. Risco de acidentes aumenta 400%.`,
    })
  } else if (burnout.level === 'alto') {
    alerts.push({
      type: 'warning',
      icon: '😰',
      title: 'Carga Alta de Trabalho',
      message: `Trabalhar ${input.usage.hoursWorkedDay}h/dia por ${input.usage.daysWorkedWeek} dias consome saúde e produtividade.`,
    })
  }

  // Km vazio alto
  if (input.usage.emptyKmPercentage > 40) {
    alerts.push({
      type: 'warning',
      icon: '🛣️',
      title: 'Muitos Km Vazios',
      message: `${input.usage.emptyKmPercentage}% dos seus km são sem passageiro. Tente posicionar-se em áreas de demanda.`,
    })
  }

  // Probabilidade de prejuízo
  if (lossProb > 15) {
    alerts.push({
      type: 'warning',
      icon: '🎲',
      title: 'Risco de Prejuízo',
      message: `Há ${round2(lossProb)}% de chance de você ter prejuízo em um mês. Considere reduzir custos fixos.`,
    })
  }

  // Custo de oportunidade
  if (opportunityCost > 500 && input.ownership.type !== 'alugado') {
    alerts.push({
      type: 'info',
      icon: '📊',
      title: 'Custo de Oportunidade',
      message: `Se investisse o valor do carro (R$ ${input.vehicle.currentValue.toLocaleString('pt-BR')}), renderia ~R$ ${round2(opportunityCost)}/mês na Selic.`,
    })
  }

  // Lucro saudável
  if (margin >= 30 && hourlyWage >= 20) {
    alerts.push({
      type: 'success',
      icon: '✅',
      title: 'Boa Rentabilidade!',
      message: `Margem de ${round2(margin)}% e R$ ${round2(hourlyWage)}/h. Sua operação está saudável.`,
    })
  }

  return alerts
}

function scaleProjection(monthly: ProjectionPeriod, factor: number): ProjectionPeriod {
  return {
    grossEarnings: round2(monthly.grossEarnings * factor),
    platformFee: round2(monthly.platformFee * factor),
    netEarnings: round2(monthly.netEarnings * factor),
    totalCosts: round2(monthly.totalCosts * factor),
    netProfit: round2(monthly.netProfit * factor),
    costPerKm: monthly.costPerKm, // Custo/km não escala
    kmDriven: round2(monthly.kmDriven * factor),
    kmEmpty: round2(monthly.kmEmpty * factor),
    hourlyWage: monthly.hourlyWage, // Hora líquida não escala
  }
}

function safeDivide(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}
