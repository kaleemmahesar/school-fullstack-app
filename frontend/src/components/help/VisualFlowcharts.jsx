import React, { useState } from 'react';
import { FaSitemap, FaExchangeAlt, FaUsers, FaChalkboardTeacher, FaMoneyBillWave, FaHandHoldingUsd, FaChartLine, FaTimes } from 'react-icons/fa';

const VisualFlowcharts = ({ isOpen, onClose }) => {
  const [selectedFlowchart, setSelectedFlowchart] = useState('student-management');

  if (!isOpen) return null;

  const flowcharts = [
    {
      id: 'student-management',
      title: 'Student Management Flow',
      icon: <FaUsers className="text-blue-600" />,
      description: 'Complete workflow for student admission, management, and tracking',
      steps: [
        {
          id: 'admission',
          title: 'Student Admission',
          description: 'New student registration and information capture',
          color: 'bg-blue-500',
          connections: ['class-assignment']
        },
        {
          id: 'class-assignment',
          title: 'Class Assignment',
          description: 'Assign student to appropriate class and section',
          color: 'bg-green-500',
          connections: ['family-linking', 'fee-setup']
        },
        {
          id: 'family-linking',
          title: 'Family Linking',
          description: 'Connect student with siblings or family members',
          color: 'bg-purple-500',
          connections: ['ongoing-management']
        },
        {
          id: 'fee-setup',
          title: 'Fee Setup',
          description: 'Configure fee structure for traditional schools',
          color: 'bg-yellow-500',
          connections: ['ongoing-management']
        },
        {
          id: 'ongoing-management',
          title: 'Ongoing Management',
          description: 'Attendance, marks, and continuous updates',
          color: 'bg-indigo-500',
          connections: []
        }
      ]
    },
    {
      id: 'fee-processing',
      title: 'Fee Processing Flow',
      icon: <FaMoneyBillWave className="text-yellow-600" />,
      description: 'Fee challan generation, payment processing, and tracking (Traditional Schools)',
      steps: [
        {
          id: 'challan-generation',
          title: 'Challan Generation',
          description: 'Create fee challans for students or classes',
          color: 'bg-blue-500',
          connections: ['challan-distribution']
        },
        {
          id: 'challan-distribution',
          title: 'Challan Distribution',
          description: 'Distribute challans to parents/students',
          color: 'bg-green-500',
          connections: ['payment-collection']
        },
        {
          id: 'payment-collection',
          title: 'Payment Collection',
          description: 'Receive payments through various methods',
          color: 'bg-yellow-500',
          connections: ['payment-recording']
        },
        {
          id: 'payment-recording',
          title: 'Payment Recording',
          description: 'Record payments in the system',
          color: 'bg-purple-500',
          connections: ['reporting']
        },
        {
          id: 'reporting',
          title: 'Financial Reporting',
          description: 'Generate fee collection reports',
          color: 'bg-indigo-500',
          connections: []
        }
      ]
    },
    {
      id: 'subsidy-tracking',
      title: 'Subsidy Tracking Flow',
      icon: <FaHandHoldingUsd className="text-green-600" />,
      description: 'NGO subsidy management and expense tracking (NGO Schools)',
      steps: [
        {
          id: 'subsidy-planning',
          title: 'Subsidy Planning',
          description: 'Plan for expected NGO subsidies',
          color: 'bg-blue-500',
          connections: ['subsidy-receipt']
        },
        {
          id: 'subsidy-receipt',
          title: 'Subsidy Receipt',
          description: 'Record received subsidies',
          color: 'bg-green-500',
          connections: ['expense-tracking']
        },
        {
          id: 'expense-tracking',
          title: 'Expense Tracking',
          description: 'Record all school expenditures',
          color: 'bg-yellow-500',
          connections: ['financial-reporting']
        },
        {
          id: 'financial-reporting',
          title: 'Financial Reporting',
          description: 'Generate financial reports and balance tracking',
          color: 'bg-purple-500',
          connections: []
        }
      ]
    },
    {
      id: 'staff-management',
      title: 'Staff Management Flow',
      icon: <FaChalkboardTeacher className="text-indigo-600" />,
      description: 'Staff recruitment, management, and payroll processing',
      steps: [
        {
          id: 'recruitment',
          title: 'Staff Recruitment',
          description: 'Add new staff members to the system',
          color: 'bg-blue-500',
          connections: ['assignment']
        },
        {
          id: 'assignment',
          title: 'Role Assignment',
          description: 'Assign positions, subjects, and classes',
          color: 'bg-green-500',
          connections: ['payroll-setup']
        },
        {
          id: 'payroll-setup',
          title: 'Payroll Setup',
          description: 'Configure salary and allowance structure',
          color: 'bg-yellow-500',
          connections: ['salary-processing']
        },
        {
          id: 'salary-processing',
          title: 'Salary Processing',
          description: 'Process monthly salaries and advances',
          color: 'bg-purple-500',
          connections: ['reporting']
        },
        {
          id: 'reporting',
          title: 'Staff Reporting',
          description: 'Generate staff analytics and reports',
          color: 'bg-indigo-500',
          connections: []
        }
      ]
    }
  ];

  const currentFlowchart = flowcharts.find(f => f.id === selectedFlowchart);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaSitemap className="text-white text-xl mr-3" />
              <h2 className="text-xl font-bold text-white">Visual Process Flowcharts</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <p className="text-blue-100 mt-1">Understand how processes flow through the system</p>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* Flowchart Selection Sidebar */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-3">Select Flowchart</h3>
            <div className="space-y-2">
              {flowcharts.map((flowchart) => (
                <button
                  key={flowchart.id}
                  onClick={() => setSelectedFlowchart(flowchart.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                    selectedFlowchart === flowchart.id
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="mr-3 text-lg">
                    {flowchart.icon}
                  </div>
                  <div>
                    <div className="font-medium">{flowchart.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{flowchart.description}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">How to Read These Flowcharts</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Boxes represent process steps</li>
                <li>• Arrows show the flow direction</li>
                <li>• Each step includes a brief description</li>
                <li>• Color coding helps identify process types</li>
              </ul>
            </div>
          </div>

          {/* Flowchart Visualization */}
          <div className="w-2/3 overflow-y-auto p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{currentFlowchart.title}</h3>
              <p className="text-gray-600">{currentFlowchart.description}</p>
            </div>

            <div className="space-y-8">
              {currentFlowchart.steps.map((step, index) => (
                <div key={step.id} className="relative">
                  {/* Step Card */}
                  <div className="flex items-start">
                    <div className={`${step.color} text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4`}>
                      {index + 1}
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex-grow shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                  </div>

                  {/* Connection Arrow */}
                  {index < currentFlowchart.steps.length - 1 && (
                    <div className="flex justify-center my-4">
                      <div className="w-px h-8 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-3">Process Type Legend</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <span className="text-xs">Initial Setup</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-xs">Assignment</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span className="text-xs">Processing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                  <span className="text-xs">Recording</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-indigo-500 rounded mr-2"></div>
                  <span className="text-xs">Reporting</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close Flowcharts
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualFlowcharts;