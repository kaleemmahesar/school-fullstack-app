import React from 'react';
import { useSchoolFunding } from '../../hooks/useSchoolFunding';

/**
 * Component that conditionally renders children based on school funding type
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render
 * @param {string} props.showFor - 'ngo', 'traditional', or 'both'
 * @param {React.ReactNode} props.fallback - Fallback content when condition is not met
 */
const FundingConditional = ({ children, showFor = 'both', fallback = null }) => {
  const { isNGOSchool, isTraditionalSchool } = useSchoolFunding();
  
  // Determine if content should be shown based on funding type
  const shouldShow = 
    showFor === 'both' ||
    (showFor === 'ngo' && isNGOSchool) ||
    (showFor === 'traditional' && isTraditionalSchool);
  
  return shouldShow ? children : fallback;
};

export default FundingConditional;