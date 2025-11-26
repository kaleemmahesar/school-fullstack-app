import { useSelector } from 'react-redux';

/**
 * Custom hook to access school funding information
 * @returns {Object} - Object containing funding type and helper functions
 */
export const useSchoolFunding = () => {
  const schoolInfo = useSelector(state => state.settings.schoolInfo);
  
  const fundingType = schoolInfo?.fundingType || 'traditional';
  const isNGOSchool = fundingType === 'ngo';
  const isTraditionalSchool = fundingType === 'traditional';
  
  return {
    fundingType,
    isNGOSchool,
    isTraditionalSchool,
    schoolInfo
  };
};