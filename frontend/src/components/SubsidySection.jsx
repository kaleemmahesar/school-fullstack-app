import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addSubsidy } from '../store/subsidiesSlice';
import { FaDollarSign, FaCalendar, FaBuilding, FaCheck, FaTimes, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';

const SubsidySection = () => {
  const dispatch = useDispatch();
  const ngoSubsidies = useSelector(state => state.subsidies.subsidies);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [subsidyData, setSubsidyData] = useState({
    quarter: '',
    year: new Date().getFullYear(),
    amount: '',
    ngoName: '',
    description: '',
    receivedDate: '',
    expectedDate: '',
    status: 'expected'
  });

  const handleAddSubsidy = (e) => {
  e.preventDefault();
  const newSubsidy = {
    ...subsidyData,
    status: subsidyData.receivedDate ? 'received' : 'expected',
    // Set expectedDate if not already set and status is expected
    expectedDate: subsidyData.expectedDate || (!subsidyData.receivedDate ? getDefaultExpectedDate(subsidyData.quarter, subsidyData.year) : '')
  };
  
  // Remove the manual ID setting since the server will generate it
  delete newSubsidy.id;
  
  dispatch(addSubsidy(newSubsidy));
  setSubsidyData({
    quarter: '',
    year: new Date().getFullYear(),
    amount: '',
    ngoName: '',
    description: '',
    receivedDate: '',
    expectedDate: '',
    status: 'expected'
  });
  setShowAddModal(false);
};

  // Helper function to get default expected date based on quarter and year
  const getDefaultExpectedDate = (quarter, year) => {
    if (!quarter || !year) return '';
    const quarterEndMonths = {
      'Q1': 3,  // March
      'Q2': 6,  // June
      'Q3': 9,  // September
      'Q4': 12  // December
    };
    const month = quarterEndMonths[quarter];
    if (!month) return '';
    return `${year}-${String(month).padStart(2, '0')}-15`; // 15th of the month
  };

  const filteredSubsidies = ngoSubsidies.filter(subsidy => {
    const matchesSearch = 
      subsidy.ngoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subsidy.quarter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subsidy.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || subsidy.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalReceived = ngoSubsidies
    .filter(s => s.status === 'received')
    .reduce((sum, subsidy) => sum + Number(subsidy.amount), 0);

  const totalExpected = ngoSubsidies
    .filter(s => s.status === 'expected')
    .reduce((sum, subsidy) => sum + Number(subsidy.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">NGO Subsidies</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track quarterly subsidies received from NGOs for school operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaDollarSign className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Received</p>
                <p className="text-2xl font-bold text-gray-900">Rs {totalReceived.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaCalendar className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expected Subsidies</p>
                <p className="text-2xl font-bold text-gray-900">Rs {totalExpected.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaBuilding className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active NGOs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(ngoSubsidies.map(s => s.ngoName))].length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search subsidies..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-gray-400" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="received">Received</option>
                    <option value="expected">Expected</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPlus className="mr-2" />
                Add Subsidy
              </button>
            </div>
          </div>
        </div>

        {/* Subsidies Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NGO Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quarter & Year
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubsidies.map((subsidy) => (
                  <tr key={subsidy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subsidy.ngoName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{subsidy.quarter} {subsidy.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rs {Number(subsidy.amount).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {subsidy.receivedDate || subsidy.expectedDate || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subsidy.status === 'received' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {subsidy.status === 'received' ? (
                          <>
                            <FaCheck className="mr-1" /> Received
                          </>
                        ) : (
                          <>
                            <FaTimes className="mr-1" /> Expected
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {subsidy.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Subsidy Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add NGO Subsidy</h3>
                <form onSubmit={handleAddSubsidy}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">NGO Name</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={subsidyData.ngoName}
                        onChange={(e) => setSubsidyData({...subsidyData, ngoName: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quarter</label>
                        <select
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          value={subsidyData.quarter}
                          onChange={(e) => setSubsidyData({...subsidyData, quarter: e.target.value})}
                        >
                          <option value="">Select Quarter</option>
                          <option value="Q1">Q1</option>
                          <option value="Q2">Q2</option>
                          <option value="Q3">Q3</option>
                          <option value="Q4">Q4</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Year</label>
                        <input
                          type="number"
                          required
                          min="2020"
                          max="2030"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          value={subsidyData.year}
                          onChange={(e) => setSubsidyData({...subsidyData, year: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount (Rs)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={subsidyData.amount}
                        onChange={(e) => setSubsidyData({...subsidyData, amount: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Received Date (Optional)</label>
                      <input
                        type="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={subsidyData.receivedDate}
                        onChange={(e) => setSubsidyData({...subsidyData, receivedDate: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows="3"
                        value={subsidyData.description}
                        onChange={(e) => setSubsidyData({...subsidyData, description: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Subsidy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubsidySection;