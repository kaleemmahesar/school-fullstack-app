import React, { useState, useEffect } from 'react';
import { FaLock, FaUnlock, FaStar, FaChartLine, FaUsers, FaChalkboardTeacher, FaMoneyBillWave, FaHandHoldingUsd, FaCogs } from 'react-icons/fa';

const ProgressiveDisclosure = ({ userProgress, onFeatureUnlock }) => {
  const [unlockedFeatures, setUnlockedFeatures] = useState([]);

  // Define feature unlocking criteria
  const features = [
    {
      id: 'student-management',
      title: 'Student Management',
      icon: <FaUsers className="text-blue-600" />,
      description: 'Add, edit, and manage student records',
      requiredActions: ['add_student', 'view_student_list'],
      unlocked: true,
      category: 'basic'
    },
    {
      id: 'class-management',
      title: 'Class Management',
      icon: <FaChalkboardTeacher className="text-green-600" />,
      description: 'Organize students into classes and sections',
      requiredActions: ['add_class', 'assign_student_to_class'],
      unlocked: userProgress.classes >= 1,
      category: 'basic'
    },
    {
      id: 'staff-management',
      title: 'Staff Management',
      icon: <FaChalkboardTeacher className="text-indigo-600" />,
      description: 'Manage staff records and payroll',
      requiredActions: ['add_staff'],
      unlocked: userProgress.staff >= 1,
      category: 'basic'
    },
    {
      id: 'fee-processing',
      title: 'Fee Processing',
      icon: <FaMoneyBillWave className="text-yellow-600" />,
      description: 'Generate challans and process payments',
      requiredActions: ['generate_challan'],
      unlocked: userProgress.fees >= 5,
      category: 'advanced',
      condition: (progress) => progress.schoolType === 'traditional'
    },
    {
      id: 'subsidy-tracking',
      title: 'Subsidy Tracking',
      icon: <FaHandHoldingUsd className="text-blue-600" />,
      description: 'Track NGO subsidies and expenses',
      requiredActions: ['add_subsidy'],
      unlocked: userProgress.subsidies >= 2,
      category: 'advanced',
      condition: (progress) => progress.schoolType === 'ngo'
    },
    {
      id: 'expense-tracking',
      title: 'Expense Tracking',
      icon: <FaChartLine className="text-purple-600" />,
      description: 'Record and categorize school expenses',
      requiredActions: ['add_expense'],
      unlocked: userProgress.expenses >= 3,
      category: 'intermediate'
    },
    {
      id: 'financial-reporting',
      title: 'Financial Reporting',
      icon: <FaChartLine className="text-red-600" />,
      description: 'Generate financial reports and analytics',
      requiredActions: ['view_financial_report'],
      unlocked: userProgress.reports >= 2,
      category: 'advanced'
    },
    {
      id: 'bulk-operations',
      title: 'Bulk Operations',
      icon: <FaCogs className="text-gray-600" />,
      description: 'Perform actions on multiple records at once',
      requiredActions: ['bulk_challan_generation'],
      unlocked: userProgress.bulkOperations >= 1,
      category: 'advanced'
    }
  ];

  // Check which features should be unlocked based on user progress
  useEffect(() => {
    const newlyUnlocked = features.filter(feature => {
      // If already unlocked, keep it unlocked
      if (unlockedFeatures.includes(feature.id)) {
        return true;
      }
      
      // Check if feature should be unlocked based on conditions
      if (feature.condition && !feature.condition(userProgress)) {
        return false;
      }
      
      return feature.unlocked;
    }).map(f => f.id);
    
    setUnlockedFeatures(newlyUnlocked);
  }, [userProgress, unlockedFeatures]);

  const isFeatureUnlocked = (featureId) => {
    return unlockedFeatures.includes(featureId);
  };

  const handleFeatureClick = (feature) => {
    if (isFeatureUnlocked(feature.id)) {
      // Navigate to feature
      onFeatureUnlock(feature.id);
    }
  };

  const getFeatureStatus = (feature) => {
    if (isFeatureUnlocked(feature.id)) {
      return 'unlocked';
    }
    
    if (feature.condition && !feature.condition(userProgress)) {
      return 'not-applicable';
    }
    
    return 'locked';
  };

  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {});

  const categoryTitles = {
    basic: 'Getting Started',
    intermediate: 'Building Proficiency',
    advanced: 'Advanced Features'
  };

  const categoryDescriptions = {
    basic: 'Essential features to get you started',
    intermediate: 'Features that enhance your workflow',
    advanced: 'Powerful tools for advanced users'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Feature Progression</h3>
        <p className="text-gray-600">
          Unlock advanced features as you become more familiar with the system
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category}>
            <div className="mb-4">
              <h4 className="font-bold text-gray-900 text-lg flex items-center">
                <FaStar className="text-yellow-500 mr-2" />
                {categoryTitles[category]}
              </h4>
              <p className="text-gray-600 text-sm">{categoryDescriptions[category]}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryFeatures.map((feature) => {
                const status = getFeatureStatus(feature);
                
                return (
                  <div 
                    key={feature.id}
                    onClick={() => handleFeatureClick(feature)}
                    className={`
                      border rounded-lg p-4 transition-all cursor-pointer
                      ${status === 'unlocked' 
                        ? 'border-green-200 bg-green-50 hover:bg-green-100 hover:shadow-md' 
                        : status === 'not-applicable'
                          ? 'border-gray-200 bg-gray-50 opacity-60'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        {status === 'unlocked' ? (
                          <div className="bg-green-100 rounded-full p-2">
                            <FaUnlock className="text-green-600" />
                          </div>
                        ) : status === 'not-applicable' ? (
                          <div className="bg-gray-100 rounded-full p-2">
                            <FaLock className="text-gray-400" />
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded-full p-2">
                            <FaLock className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <div className="mr-2 text-lg">
                            {feature.icon}
                          </div>
                          <h5 className="font-bold text-gray-900">{feature.title}</h5>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
                        
                        {status === 'locked' && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                              <FaLock className="mr-1 text-xs" />
                              Locked
                            </span>
                          </div>
                        )}
                        
                        {status === 'not-applicable' && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                              Not applicable for your school type
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900">Your Progress</h4>
            <p className="text-gray-600 text-sm">
              {unlockedFeatures.length} of {features.length} features unlocked
            </p>
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${(unlockedFeatures.length / features.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveDisclosure;