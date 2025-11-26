import React from 'react';

const PageHeader = ({ title, subtitle, actionButton, quarterYearFilters, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        {children && <div className="mt-2">{children}</div>}
      </div>
      <div className="flex items-center space-x-2 mt-4 md:mt-0">
        {quarterYearFilters && <div className="flex space-x-2">{quarterYearFilters}</div>}
        {actionButton && <div>{actionButton}</div>}
      </div>
    </div>
  );
};

export default PageHeader;