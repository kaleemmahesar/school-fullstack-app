import React, { useState } from 'react';
import { FaBuilding, FaUsers, FaChalkboardTeacher, FaMoneyBillWave, FaHandHoldingUsd, FaCog, FaArrowRight, FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';

const FirstRunWizard = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [schoolInfo, setSchoolInfo] = useState({
    name: '',
    level: 'primary',
    fundingType: 'ngo'
  });

  const steps = [
    {
      title: "Welcome to School Management System",
      description: "Let's set up your school in a few simple steps",
      content: (
        <div className="text-center py-6">
          <div className="mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-24 h-24 flex items-center justify-center mb-6">
            <FaBuilding className="text-white text-4xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Welcome!</h3>
          <p className="text-gray-600">
            This quick setup wizard will help you configure your school management system. 
            It should only take a few minutes to complete.
          </p>
        </div>
      )
    },
    {
      title: "School Information",
      description: "Tell us about your school",
      content: (
        <div className="space-y-6 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Name
            </label>
            <input
              type="text"
              value={schoolInfo.name}
              onChange={(e) => setSchoolInfo({...schoolInfo, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your school name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Level
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['primary', 'middle', 'high'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSchoolInfo({...schoolInfo, level})}
                  className={`p-4 border rounded-lg ${
                    schoolInfo.level === level
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium text-gray-900 capitalize">
                    {level}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {level === 'primary' && 'Grades 1-5'}
                    {level === 'middle' && 'Grades 6-8'}
                    {level === 'high' && 'Grades 9-10'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Funding Model",
      description: "Select your school's funding type",
      content: (
        <div className="space-y-6 py-4">
          <div className="text-sm text-gray-600 mb-4">
            This determines which features will be available in your system.
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <button
              type="button"
              onClick={() => setSchoolInfo({...schoolInfo, fundingType: 'traditional'})}
              className={`p-6 border rounded-lg text-left ${
                schoolInfo.fundingType === 'traditional'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mr-3 mt-0.5 ${
                  schoolInfo.fundingType === 'traditional' 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {schoolInfo.fundingType === 'traditional' && (
                    <FaCheck className="text-white text-xs" />
                  )}
                </div>
                <div>
                  <div className="flex items-center font-medium text-gray-900">
                    <FaMoneyBillWave className="text-green-500 mr-2" />
                    Traditional School
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Collect monthly fees from students. Features include challan generation, 
                    payment processing, and detailed fee tracking.
                  </p>
                  <div className="mt-3 text-xs text-gray-500">
                    <strong>Features:</strong> Fee management, challan printing, payment tracking
                  </div>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setSchoolInfo({...schoolInfo, fundingType: 'ngo'})}
              className={`p-6 border rounded-lg text-left ${
                schoolInfo.fundingType === 'ngo'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mr-3 mt-0.5 ${
                  schoolInfo.fundingType === 'ngo' 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {schoolInfo.fundingType === 'ngo' && (
                    <FaCheck className="text-white text-xs" />
                  )}
                </div>
                <div>
                  <div className="flex items-center font-medium text-gray-900">
                    <FaHandHoldingUsd className="text-blue-500 mr-2" />
                    NGO Funded School
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Operate with quarterly subsidies from NGOs. No student fees are collected. 
                    Track NGO subsidies and expenses exclusively.
                  </p>
                  <div className="mt-3 text-xs text-gray-500">
                    <strong>Features:</strong> Subsidy tracking, expense management, financial reporting
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Get Started",
      description: "Your school is now configured",
      content: (
        <div className="text-center py-6">
          <div className="mx-auto bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mb-6">
            <FaCheck className="text-green-600 text-4xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Setup Complete!</h3>
          <p className="text-gray-600 mb-4">
            Your school <strong>{schoolInfo.name || 'School'}</strong> has been configured as a{' '}
            <strong className="capitalize">{schoolInfo.level}</strong> level{' '}
            <strong className="capitalize">{schoolInfo.fundingType}</strong> school.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
            <ul className="list-disc pl-5 space-y-1 text-blue-800 text-sm">
              <li>Add classes and sections</li>
              <li>Register staff members</li>
              <li>Begin adding students</li>
              {schoolInfo.fundingType === 'traditional' ? (
                <li>Start generating fee challans</li>
              ) : (
                <li>Track NGO subsidies</li>
              )}
            </ul>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup
      onComplete(schoolInfo);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{steps[currentStep].title}</h2>
              <p className="text-blue-100 mt-1">{steps[currentStep].description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow p-6">
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Skip Setup
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              {currentStep === steps.length - 1 ? 'Finish Setup' : 'Next'}
              {currentStep !== steps.length - 1 && <FaArrowRight className="ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstRunWizard;