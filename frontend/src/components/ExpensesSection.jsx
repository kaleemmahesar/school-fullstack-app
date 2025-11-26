import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenses, addExpense, updateExpense, deleteExpense, addCategory } from '../store/expensesSlice';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMoneyBillWave, FaTag, FaChartBar, FaDownload, FaPrint } from 'react-icons/fa';
import ExpenseFormModal from './ExpenseFormModal';
import CategoryFormModal from './CategoryFormModal';
import Pagination from './common/Pagination';

const ExpensesSection = () => {
  const dispatch = useDispatch();
  const { expenses, categories, loading, error } = useSelector(state => state.expenses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleEdit = (expense) => {
    setCurrentExpense(expense);
    setShowExpenseModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      dispatch(deleteExpense(id));
    }
  };

  const handleExpenseSubmit = (expenseData) => {
    if (currentExpense) {
      dispatch(updateExpense({ ...currentExpense, ...expenseData }));
    } else {
      dispatch(addExpense(expenseData));
    }
    setShowExpenseModal(false);
    setCurrentExpense(null);
  };

  const handleCategorySubmit = (categoryName) => {
    dispatch(addCategory(categoryName));
    setShowCategoryModal(false);
  };

  // Export to CSV function
  const exportToCSV = () => {
    const csvContent = [
      ['Description', 'Category', 'Date', 'Amount'],
      ...filteredExpenses.map(expense => [
        `"${expense.description.replace(/"/g, '""')}"`,
        expense.category,
        expense.date,
        expense.amount
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'expenses_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print report function
  const printReport = () => {
    window.print();
  };

  const filteredExpenses = expenses.filter(expense => {
    // Text search
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredExpenses.length / itemsPerPage)));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // Calculate pagination variables
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredExpenses]);

  // Calculate total expenses based on filtered results (excluding salary expenses)
  const totalFilteredExpenses = filteredExpenses
    .filter(expense => expense.category !== 'Salary')
    .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Group expenses by category for summary based on filtered results (excluding salary)
  const filteredExpensesByCategory = filteredExpenses
    .filter(expense => expense.category !== 'Salary')
    .reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = { total: 0, count: 0 };
      }
      acc[expense.category].total += parseFloat(expense.amount);
      acc[expense.category].count += 1;
      return acc;
    }, {});

  // Use all categories for the dropdown, but show stats based on filtered results (excluding salary)
  const totalCategories = new Set(filteredExpenses
    .filter(expense => expense.category !== 'Salary')
    .map(expense => expense.category)).size;

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">Error: {error}</p>
      </div>
    </div>
  </div>;

  return (
    <>
      <div className="">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses Management</h1>
            <p className="mt-1 text-sm text-gray-600">Track and manage all school expenses</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaDownload className="mr-2" /> Export CSV
            </button>
            <button
              onClick={printReport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaPrint className="mr-2" /> Print
            </button>
            <button
              onClick={() => {
                setCurrentExpense(null);
                setShowExpenseModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <FaPlus className="mr-2" /> Add Expense
            </button>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <FaPlus className="mr-2" /> Add Category
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="my-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Total Expenses</p>
                  <p className="text-2xl font-bold mt-1">Rs {Math.round(totalFilteredExpenses)}</p>
                </div>
                <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full">
                  <FaMoneyBillWave size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium">Categories</p>
                  <p className="text-2xl font-bold mt-1">{totalCategories}</p>
                </div>
                <div className="p-2 bg-green-400 bg-opacity-30 rounded-full">
                  <FaTag size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium">Total Records</p>
                  <p className="text-2xl font-bold mt-1">{filteredExpenses.length}</p>
                </div>
                <div className="p-2 bg-purple-400 bg-opacity-30 rounded-full">
                  <FaChartBar size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Records</h3>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <FaTag className="text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          
          {/* Expenses Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{expense.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Rs {Math.round(expense.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="inline-flex items-center px-3 py-1 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredExpenses.length === 0 && (
              <div className="text-center py-12">
                <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredExpenses.length}
              paginate={paginate}
              nextPage={nextPage}
              prevPage={prevPage}
            />
          </div>
        </div>
      </div>

      {/* Expense Form Modal */}
      {showExpenseModal && (
        <ExpenseFormModal
          expenseData={currentExpense}
          categories={categories}
          onSubmit={handleExpenseSubmit}
          onClose={() => {
            setShowExpenseModal(false);
            setCurrentExpense(null);
          }}
        />
      )}

      {/* Category Form Modal */}
      {showCategoryModal && (
        <CategoryFormModal
          onSubmit={handleCategorySubmit}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </>
  );
};

export default ExpensesSection;