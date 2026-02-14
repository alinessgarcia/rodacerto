// src/services/calculator.ts

interface SimulationInput {
  fuelPrice: number
  avgConsumption: number // km/l
  avgKmDay: number
  daysWorkedWeek: number
  emptyKmPercentage: number // 0-100
  grossEarningsDay: number
  maintenanceCostYear: number
  tireCostSet: number
  tireLifespanKm: number
  oilChangeCost: number
  oilChangeIntervalKm: number
  insuranceYear: number
  ipvaYear: number
  licensingYear: number
  depreciationYear: number
  rentalWeeklyCost: number // 0 se próprio
  isRented: boolean
}

interface SimulationResult {
  monthly: {
    grossEarnings: number
    fuelCost: number
    maintenanceCost: number
    fixedCosts: number // Seguro, IPVA, Licenciamento (rateado)
    rentalCost: number
    netProfit: number
    hourlyWage: number // Salário hora líquido
    riskFactor: number // 0-10 (probabilidade de quebra/multa)
  }
  daily: {
    netProfit: number
    kmDriven: number
    kmEmpty: number
  }
  insights: string[] // Dicas geradas (ex: "Seu lucro < 15%, cuidado")
}

export const calculateSimulation = (input: SimulationInput): SimulationResult => {
  const WEEKS_MONTH = 4.33
  const DAYS_MONTH = input.daysWorkedWeek * WEEKS_MONTH
  
  // 1. Receita Bruta
  const monthlyGross = input.grossEarningsDay * DAYS_MONTH
  
  // 2. Km Total
  const dailyKm = input.avgKmDay
  const monthlyKm = dailyKm * DAYS_MONTH
  const emptyKm = monthlyKm * (input.emptyKmPercentage / 100)
  
  // 3. Combustível
  const fuelCostMonthly = (monthlyKm / input.avgConsumption) * input.fuelPrice
  
  // 4. Manutenção Variável (Pneu + Óleo + Geral)
  // Pneu: (Custo Jogo / Vida Útil) * Km Mês
  const tireCostMonthly = (input.tireCostSet / input.tireLifespanKm) * monthlyKm
  // Óleo: (Custo Troca / Intervalo) * Km Mês
  const oilCostMonthly = (input.oilChangeCost / input.oilChangeIntervalKm) * monthlyKm
  // Manutenção Geral (Anual / 12) - Simplificado, ideal seria por Km
  const generalMaintenanceMonthly = input.maintenanceCostYear / 12
  
  const totalMaintenanceMonthly = tireCostMonthly + oilCostMonthly + generalMaintenanceMonthly
  
  // 5. Custos Fixos (Carro Próprio)
  let fixedCostsMonthly = 0
  let rentalCostMonthly = 0
  
  if (input.isRented) {
    rentalCostMonthly = input.rentalWeeklyCost * WEEKS_MONTH
  } else {
    fixedCostsMonthly = (input.insuranceYear + input.ipvaYear + input.licensingYear + input.depreciationYear) / 12
  }
  
  // 6. Lucro Líquido
  const totalCosts = fuelCostMonthly + totalMaintenanceMonthly + fixedCostsMonthly + rentalCostMonthly
  const netProfit = monthlyGross - totalCosts
  
  // 7. Salário Hora
  const hoursMonth = input.hoursWorkedDay * DAYS_MONTH
  const hourlyWage = netProfit / hoursMonth
  
  // 8. Insights
  const insights: string[] = []
  if (netProfit < 1500) insights.push("Alerta: Seu lucro está abaixo de um salário mínimo.")
  if (input.emptyKmPercentage > 40) insights.push("Dica: Você está rodando muito vazio. Tente posicionar-se melhor.")
  if (hourlyWage < 10) insights.push("Atenção: Sua hora trabalhada paga menos que R$ 10,00.")

  return {
    monthly: {
      grossEarnings: monthlyGross,
      fuelCost: fuelCostMonthly,
      maintenanceCost: totalMaintenanceMonthly,
      fixedCosts: fixedCostsMonthly,
      rentalCost: rentalCostMonthly,
      netProfit,
      hourlyWage,
      riskFactor: 5 // Mock, implementar lógica de Monte Carlo depois
    },
    daily: {
      netProfit: netProfit / DAYS_MONTH,
      kmDriven: dailyKm,
      kmEmpty: emptyKm / DAYS_MONTH
    },
    insights
  }
}
