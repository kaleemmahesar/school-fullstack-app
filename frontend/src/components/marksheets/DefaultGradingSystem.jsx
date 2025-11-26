import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import { SCHOOL_CONFIG } from '../../config/schoolConfig';

const DefaultGradingSystem = () => {
  const [gradingRules, setGradingRules] = useState(SCHOOL_CONFIG.gradingStructure);
  
  const [newRule, setNewRule] = useState({
    minPercentage: '',
    maxPercentage: '',
    grade: '',
    remarks: ''
  });

  // Add a new grading rule
  const addGradingRule = () => {
    if (newRule.minPercentage === '' || newRule.maxPercentage === '' || 
        newRule.grade === '' || newRule.remarks === '') {
      alert('Please fill in all fields');
      return;
    }
    
    const rule = {
      id: Date.now(),
      ...newRule,
      minPercentage: parseInt(newRule.minPercentage),
      maxPercentage: parseInt(newRule.maxPercentage)
    };
    
    setGradingRules([...gradingRules, rule]);
    setNewRule({
      minPercentage: '',
      maxPercentage: '',
      grade: '',
      remarks: ''
    });
  };

  // Remove a grading rule
  const removeGradingRule = (id) => {
    if (gradingRules.length <= 1) {
      alert('At least one grading rule is required');
      return;
    }
    setGradingRules(gradingRules.filter(rule => rule.id !== id));
  };

  // Update a grading rule
  const updateGradingRule = (id, field, value) => {
    setGradingRules(gradingRules.map(rule => 
      rule.id === id ? { ...rule, [field]: field.includes('Percentage') ? parseInt(value) : value } : rule
    ));
  };

  // Save grading rules
  const saveGradingRules = () => {
    // In a real implementation, this would dispatch an action to save the rules
    console.log('Saving grading rules:', gradingRules);
    alert('Grading rules saved successfully');
  };

  return (
    <>
      <PageHeader
        title="Default Grading System"
        subtitle="Set percentage-based grading rules and remarks"
        actionButton={
          <button
            onClick={saveGradingRules}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            <FaSave className="mr-2" /> Save Grading Rules
          </button>
        }
      />

      {/* Grading Rules Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Grading Rules</h3>
        
        <div className="overflow-hidden rounded-lg border border-gray-200 mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage Range</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gradingRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={rule.minPercentage}
                        onChange={(e) => updateGradingRule(rule.id, 'minPercentage', e.target.value)}
                        className="block w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={rule.maxPercentage}
                        onChange={(e) => updateGradingRule(rule.id, 'maxPercentage', e.target.value)}
                        className="block w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={rule.grade}
                      onChange={(e) => updateGradingRule(rule.id, 'grade', e.target.value)}
                      className="block w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={rule.remarks}
                      onChange={(e) => updateGradingRule(rule.id, 'remarks', e.target.value)}
                      className="block w-40 px-3 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => removeGradingRule(rule.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaTrash className="mr-1" /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Rule Form */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Add New Grading Rule</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Percentage</label>
              <input
                type="number"
                value={newRule.minPercentage}
                onChange={(e) => setNewRule({...newRule, minPercentage: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Percentage</label>
              <input
                type="number"
                value={newRule.maxPercentage}
                onChange={(e) => setNewRule({...newRule, maxPercentage: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
                placeholder="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <input
                type="text"
                value={newRule.grade}
                onChange={(e) => setNewRule({...newRule, grade: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="A+"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input
                type="text"
                value={newRule.remarks}
                onChange={(e) => setNewRule({...newRule, remarks: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Excellent"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={addGradingRule}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
              >
                <FaPlus className="mr-2" /> Add Rule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grading Scale Visualization */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Grading Scale Visualization</h3>
        
        <div className="space-y-4">
          {gradingRules
            .sort((a, b) => b.minPercentage - a.minPercentage)
            .map((rule, index) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-indigo-500' :
                      index === 3 ? 'bg-purple-500' :
                      index === 4 ? 'bg-yellow-500' :
                      index === 5 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}>
                      {rule.grade}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{rule.remarks}</h4>
                      <p className="text-sm text-gray-500">
                        {rule.minPercentage}% - {rule.maxPercentage}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{rule.grade}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default DefaultGradingSystem;