import React from 'react';
import { useSelector } from 'react-redux';
import { useSchoolFunding } from '../hooks/useSchoolFunding';
import FundingConditional from './common/FundingConditional';

const FinancialReportPrintView = ({ 
  financialSummary, 
  getPeriodDescription, 
  dateRange,
  formatCurrency 
}) => {
  const { students } = useSelector(state => state.students);
  const { subsidies } = useSelector(state => state.subsidies);
  const { expenses } = useSelector(state => state.expenses);
  const { staff } = useSelector(state => state.staff);
  const { isNGOSchool } = useSchoolFunding();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Report</h1>
        <p className="text-lg text-gray-600">{getPeriodDescription()}</p>
        <p className="text-sm text-gray-500 mt-2">Generated on {new Date().toLocaleDateString()}</p>
      </div>
      
      {/* Income Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">Income Summary</h2>
        <div className="space-y-3">
          <FundingConditional showFor="traditional">
            <div className="flex justify-between">
              <span className="font-medium">Tuition Fees</span>
              <span>{formatCurrency(financialSummary.tuitionFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Admission Fees</span>
              <span>{formatCurrency(financialSummary.admissionFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Other Fees</span>
              <span>{formatCurrency(financialSummary.otherFees)}</span>
            </div>
          </FundingConditional>
          
          <FundingConditional showFor="ngo">
            <div className="flex justify-between">
              <span className="font-medium">Subsidies Received</span>
              <span>{formatCurrency(financialSummary.totalSubsidiesReceived)}</span>
            </div>
          </FundingConditional>
          
          <div className="flex justify-between">
            <span className="font-medium">Canteen Income</span>
            <span>{formatCurrency(financialSummary.totalCanteenIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Sponsorship Income</span>
            <span>{formatCurrency(financialSummary.totalSponsorshipIncome)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-300 font-bold">
            <span>Total Income</span>
            <span>{formatCurrency(financialSummary.totalIncome)}</span>
          </div>
        </div>
      </div>
      
      {/* Expenses Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">Expense Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">Staff Salaries</span>
            <span>{formatCurrency(financialSummary.totalStaffSalaries)}</span>
          </div>
          
          {Array.from(
            expenses.reduce((acc, expense) => {
              if (!acc[expense.category]) {
                acc[expense.category] = 0;
              }
              const expenseDate = expense.date ? new Date(expense.date) : null;
              const isInDateRange = (!dateRange.start || !expenseDate || expenseDate >= new Date(dateRange.start)) && 
                                    (!dateRange.end || !expenseDate || expenseDate <= new Date(dateRange.end));
              
              if (isInDateRange) {
                acc[expense.category] += typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount || 0;
              }
              return acc;
            }, {})
          )
            .map(([category, amount]) => (
              <div key={category} className="flex justify-between">
                <span className="font-medium">{category}</span>
                <span>{formatCurrency(amount)}</span>
              </div>
            ))}
          
          <div className="flex justify-between pt-3 border-t border-gray-300 font-bold">
            <span>Other Expenses Total</span>
            <span>{formatCurrency(financialSummary.otherExpenses)}</span>
          </div>
          
          <div className="flex justify-between pt-3 border-t border-gray-300 font-bold">
            <span>Total Expenses</span>
            <span>{formatCurrency(financialSummary.totalExpenses)}</span>
          </div>
        </div>
      </div>
      
      {/* Net Balance Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">Net Financial Position</h2>
        <div className={`p-4 rounded ${financialSummary.netBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Net Balance</span>
            <span className={`text-lg font-bold ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financialSummary.netBalance)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {financialSummary.netBalance >= 0 ? 'Profit' : 'Loss'} for the selected period
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-12 pt-4 border-t border-gray-300">
        <p>Financial Report - {new Date().toLocaleDateString()}</p>
        <p className="mt-1">Page 1 of 1</p>
      </div>
    </div>
  );
};

export default FinancialReportPrintView;