// Utility functions for finance calculations

/**
 * Calculate running balance from income and expenses
 * @param {Array} income - Array of income items
 * @param {Array} expenses - Array of expense items
 * @param {string} academicYear - Academic year to filter by (optional)
 * @returns {Object} Financial summary with balance calculations
 */
export const calculateFinancialSummary = (income, expenses, academicYear = null) => {
  // Filter by academic year if specified
  let filteredIncome = income;
  let filteredExpenses = expenses;
  
  if (academicYear) {
    filteredIncome = income.filter(item => item.academicYear === academicYear);
    filteredExpenses = expenses.filter(item => item.academicYear === academicYear);
  }
  
  // Calculate total income
  const totalCanteenIncome = (filteredIncome.canteenIncome || [])
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    
  const totalSponsorshipIncome = (filteredIncome.sponsorshipIncome || [])
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    
  const totalIncome = totalCanteenIncome + totalSponsorshipIncome;
  
  // Calculate total expenses
  const totalExpenses = filteredExpenses
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  
  // Calculate running balance
  const runningBalance = totalIncome - totalExpenses;
  
  return {
    totalIncome,
    totalCanteenIncome,
    totalSponsorshipIncome,
    totalExpenses,
    runningBalance,
    academicYear: academicYear || 'All Years'
  };
};

/**
 * Get monthly financial summary
 * @param {Array} income - Array of income items
 * @param {Array} expenses - Array of expense items
 * @param {string} academicYear - Academic year to filter by (optional)
 * @returns {Array} Monthly financial summaries
 */
export const getMonthlyFinancialSummary = (income, expenses, academicYear = null) => {
  // Combine all income items
  const allIncome = [
    ...(income.canteenIncome || []),
    ...(income.sponsorshipIncome || [])
  ];
  
  // Filter by academic year if specified
  let filteredIncome = allIncome;
  let filteredExpenses = expenses;
  
  if (academicYear) {
    filteredIncome = allIncome.filter(item => item.academicYear === academicYear);
    filteredExpenses = expenses.filter(item => item.academicYear === academicYear);
  }
  
  // Group by month
  const monthlyData = {};
  
  // Process income
  filteredIncome.forEach(item => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthName,
        income: 0,
        expenses: 0,
        balance: 0
      };
    }
    
    monthlyData[monthKey].income += parseFloat(item.amount || 0);
  });
  
  // Process expenses
  filteredExpenses.forEach(item => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthName,
        income: 0,
        expenses: 0,
        balance: 0
      };
    }
    
    monthlyData[monthKey].expenses += parseFloat(item.amount || 0);
  });
  
  // Calculate balances
  Object.values(monthlyData).forEach(month => {
    month.balance = month.income - month.expenses;
  });
  
  // Sort by date
  return Object.values(monthlyData).sort((a, b) => {
    const [aYear, aMonth] = a.month.split(' ')[1] + a.month.split(' ')[0];
    const [bYear, bMonth] = b.month.split(' ')[1] + b.month.split(' ')[0];
    return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
  });
};

/**
 * Get academic year options from financial data
 * @param {Array} income - Array of income items
 * @param {Array} expenses - Array of expense items
 * @returns {Array} Unique academic years
 */
export const getAcademicYearOptions = (income, expenses) => {
  // Combine all academic years from income and expenses
  const allAcademicYears = new Set();
  
  // Add academic years from income
  if (income.canteenIncome) {
    income.canteenIncome.forEach(item => {
      if (item.academicYear) {
        allAcademicYears.add(item.academicYear);
      }
    });
  }
  
  if (income.sponsorshipIncome) {
    income.sponsorshipIncome.forEach(item => {
      if (item.academicYear) {
        allAcademicYears.add(item.academicYear);
      }
    });
  }
  
  // Add academic years from expenses
  expenses.forEach(item => {
    if (item.academicYear) {
      allAcademicYears.add(item.academicYear);
    }
  });
  
  // Convert to sorted array
  return Array.from(allAcademicYears).sort();
};

export default {
  calculateFinancialSummary,
  getMonthlyFinancialSummary,
  getAcademicYearOptions
};