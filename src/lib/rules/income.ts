export interface IncomeInputs {
  estimatedRetiredPay: number;
  memberVaPay: number;
  spouseVaPay?: number;
  civilianIncome?: number;
  otherIncome?: number;
}

export interface ExpenseMap {
  [category: string]: number;
}

export interface LocationComparisonResult {
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  remainingMonthlyCash: number;
  remainingAnnualCash: number;
  expenseToIncomeRatio: number;
  housingToIncomeRatio: number;
}

export function totalMonthlyIncome(input: IncomeInputs): number {
  return (
    (input.estimatedRetiredPay || 0) +
    (input.memberVaPay || 0) +
    (input.spouseVaPay || 0) +
    (input.civilianIncome || 0) +
    (input.otherIncome || 0)
  );
}

export function totalMonthlyExpenses(expenses: ExpenseMap): number {
  return Object.values(expenses).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

export function compareLocationCash(
  income: IncomeInputs,
  expenses: ExpenseMap,
): LocationComparisonResult {
  const totalIncome = totalMonthlyIncome(income);
  const totalExpenses = totalMonthlyExpenses(expenses);
  const remaining = totalIncome - totalExpenses;
  const housing =
    (expenses.housing || 0) +
    (expenses.rent || 0) +
    (expenses.property_tax || 0) +
    (expenses.home_or_renters_insurance || 0);

  return {
    totalMonthlyIncome: totalIncome,
    totalMonthlyExpenses: totalExpenses,
    remainingMonthlyCash: remaining,
    remainingAnnualCash: remaining * 12,
    expenseToIncomeRatio: totalIncome === 0 ? 0 : totalExpenses / totalIncome,
    housingToIncomeRatio: totalIncome === 0 ? 0 : housing / totalIncome,
  };
}

/** High-3 retirement pay estimate: high3 * years * multiplier (e.g. 0.025 for legacy). */
export function estimateRetiredPay(high3Monthly: number, yearsService: number, multiplier: number): number {
  return Math.round(high3Monthly * yearsService * multiplier * 100) / 100;
}

export const VA_SCENARIO_RATINGS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;
