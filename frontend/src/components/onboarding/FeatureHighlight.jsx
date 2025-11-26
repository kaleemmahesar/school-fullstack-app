import React, { useState, useEffect } from 'react';
import { FaStar, FaTimes, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const FeatureHighlight = ({ feature, isVisible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset step when feature changes
  useEffect(() => {
    setCurrentStep(0);
  }, [feature]);

  if (!isVisible || !feature) return null;

  const steps = feature.steps || [];
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDismiss = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <FaStar className="text-yellow-300 mr-2" />
            <h3 className="text-lg font-bold text-white">New Feature Spotlight</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {currentStepData ? (
            <>
              <h4 className="font-bold text-gray-900 text-lg mb-2">
                {currentStepData.title}
              </h4>
              <p className="text-gray-600 mb-4">
                {currentStepData.description}
              </p>
              
              {currentStepData.image && (
                <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={currentStepData.image} 
                    alt={currentStepData.title}
                    className="w-full h-auto"
                  />
                </div>
              )}
              
              {currentStepData.tips && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <h5 className="font-bold text-blue-800 text-sm mb-1">Pro Tips:</h5>
                  <ul className="text-blue-700 text-sm space-y-1">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <h4 className="font-bold text-gray-900 text-lg mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {steps.length > 1 ? `${currentStep + 1} of ${steps.length}` : ''}
          </div>
          <div className="flex space-x-2">
            {steps.length > 1 && currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FaArrowLeft className="mr-1" /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
              {currentStep !== steps.length - 1 && <FaArrowRight className="ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureHighlight;