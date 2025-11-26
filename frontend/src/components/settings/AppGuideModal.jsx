import React from 'react';
import { FaTimes, FaBook, FaUsers, FaMoneyBillWave, FaChalkboardTeacher, FaBook as FaClasses, FaChartLine, FaDollarSign, FaHandHoldingUsd, FaCog, FaQuestionCircle, FaList } from 'react-icons/fa';

const AppGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <FaBook className="text-white text-xl mr-3" />
            <h2 className="text-xl font-bold text-white">School Management System - Complete Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow p-6">
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              This comprehensive guide explains all features and functionalities of the School Management System.
            </p>

            {/* Table of Contents */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                <FaList className="mr-2" /> Table of Contents
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li><a href="#overview" className="hover:underline">System Overview</a></li>
                <li><a href="#navigation" className="hover:underline">Navigation & Menu Structure</a></li>
                <li><a href="#students" className="hover:underline">Students Management</a></li>
                <li><a href="#classes" className="hover:underline">Classes Management</a></li>
                <li><a href="#staff" className="hover:underline">Staff Management</a></li>
                <li><a href="#fees" className="hover:underline">Fees Management</a></li>
                <li><a href="#expenses" className="hover:underline">Expenses Tracking</a></li>
                <li><a href="#ngo" className="hover:underline">NGO Subsidies</a></li>
                <li><a href="#financial" className="hover:underline">Financial Reporting</a></li>
                <li><a href="#settings" className="hover:underline">Settings & Configuration</a></li>
                <li><a href="#printing" className="hover:underline">Printing & Export Features</a></li>
              </ul>
            </div>

            {/* System Overview */}
            <section id="overview" className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <FaQuestionCircle className="mr-2 text-blue-600" /> System Overview
              </h3>
              <p className="mb-3">
                The School Management System is a comprehensive digital solution designed to streamline all administrative 
                tasks for educational institutions. The system supports two distinct school models:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-2">Traditional Schools</h4>
                  <p className="text-green-700 text-sm">
                    Collect monthly fees from students. Features include challan generation, payment processing, 
                    and detailed fee tracking.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-2">NGO-Funded Schools</h4>
                  <p className="text-blue-700 text-sm">
                    Operate with quarterly subsidies from NGOs. No student fees are collected. 
                    Track NGO subsidies and expenses exclusively.
                  </p>
                </div>
              </div>
              <p>
                The system automatically adjusts its interface and available features based on the school's funding model, 
                ensuring only relevant functionality is displayed.
              </p>
            </section>

            {/* Navigation */}
            <section id="navigation" className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <FaBook className="mr-2 text-blue-600" /> Navigation & Menu Structure
              </h3>
              <p className="mb-3">
                The application features a clean, intuitive navigation system with a sidebar menu containing all main sections:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Dashboard</strong> - Overview of key metrics and recent activities</li>
                <li><strong>Students</strong> - Comprehensive student management with dropdown submenu:
                  <ul className="list-circle pl-5 mt-1">
                    <li>All Students - Main student listing and management</li>
                    <li>Attendance - Track student attendance records</li>
                    <li>Reports - Generate student performance reports</li>
                    <li>Marksheets - Manage student academic records</li>
                    <li>Certificates - Generate student certificates</li>
                    <li>Examinations - Manage exam schedules and results</li>
                  </ul>
                </li>
                <li><strong>Classes</strong> - Manage class information, sections, and student distribution</li>
                <li><strong>Staff</strong> - Staff records, salaries, and position tracking</li>
                <li><strong>Fees</strong> - (Traditional schools only) Fee challan generation and payment tracking</li>
                <li><strong>Expenses</strong> - Track all school expenditures with category management</li>
                <li><strong>NGO Subsidies</strong> - (NGO schools only) Track quarterly NGO subsidies</li>
                <li><strong>Financial Report</strong> - Comprehensive financial overview and analytics</li>
                <li><strong>Settings</strong> - (Admin only) Configure school information and preferences</li>
              </ul>
            </section>

            {/* Students Management */}
            <section id="students" className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <FaUsers className="mr-2 text-blue-600" /> Students Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Student Admission</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    Add new students through a comprehensive admission form that includes:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Personal information (name, date of birth, address)</li>
                    <li>Family details and relationships</li>
                    <li>Academic history and current class assignment</li>
                    <li>Photo upload capability</li>
                    <li>Fee information (traditional schools) or funding notice (NGO schools)</li>
                  </ul>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Student Records</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    Maintain detailed student records with:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Search and filter capabilities</li>
                    <li>Family relationship tracking</li>
                    <li>Fee history and payment status</li>
                    <li>Academic performance records</li>
                    <li>Attendance tracking</li>
                  </ul>
                </div>
              </div>
              <p className="text-gray-600">
                Students can be organized into families, allowing for bulk fee management for siblings or family members.
              </p>
            </section>

            {/* Classes Management */}
            <section id="classes" className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <FaClasses className="mr-2 text-blue-600" /> Classes Management
              </h3>
              <p className="mb-3">
                Efficiently manage academic structure with:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Create and manage classes (e.g., Class 1, Class 2, etc.)</li>
                <li>Define sections within each class (e.g., Section A, Section B)</li>
                <li>Set monthly fee amounts for each class (traditional schools)</li>
                <li>Assign subjects and teachers to classes</li>
                <li>Visualize student distribution across classes and sections</li>
                <li>Track total student count per class and section</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Classes are automatically populated with students based on their enrollment records. 
                  The system maintains real-time student counts for each class and section.
                </p>
              </div>
            </section>

            {/* Staff Management */}
            <section id="staff" className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <FaChalkboardTeacher className="mr-2 text-blue-600" /> Staff Management
              </h3>
              <p className="mb-3">
                Comprehensive staff administration with:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Staff Records</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Personal and contact information</li>
                    <li>Position and subject assignments</li>
                    <li>Date of joining and employment history</li>
                    <li>Salary and allowance details</li>
                  </ul>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Financial Management</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Salary processing and payment tracking</li>
                    <li>Advance management</li>
                    <li>Historical salary records</li>
                    <li>Total salary expenditure calculation</li>
                  </ul>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Analytics</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Staff distribution by position</li>
                    <li>Salary expenditure analytics</li>
                    <li>Pending salary calculations</li>
                    <li>Prorated salary computations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Fees Management */}
            <section id="fees" className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <FaMoneyBillWave className="mr-2 text-blue-600" /> Fees Management (Traditional Schools)
              </h3>
              <p className="mb-3">
                Robust fee management system designed for traditional fee-collecting schools:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Challan Generation</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Individual challan creation for students</li>
                    <li>Bulk challan generation for entire classes</li>
                    <li>Auto-population of fees based on class settings</li>
                    <li>Customizable due dates and descriptions</li>
                    <li>Admission fee and monthly fee tracking</li>
                  </ul>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Payment Processing</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Multiple payment methods (Cash, Bank Transfer, EasyPaisa, JazzCash)</li>
                    <li>Bulk payment status updates</li>
                    <li>Payment history tracking</li>
                    <li>Real-time fee collection analytics</li>
                    <li>Pending vs. paid fee visualization</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm mb-4">
                <h4 className="font-bold text-gray-800 mb-2">Printing & Export</h4>
                <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                  <li>Thermal printer optimized challan printing</li>
                  <li>Standard printer compatible layouts</li>
                  <li>PDF export functionality</li>
                  <li>CSV export for financial reporting</li>
                  <li>Print preview for verification</li>
                </ul>
              </div>
            </section>

            {/* Expenses Tracking */}
            <section id="expenses" className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <FaDollarSign className="mr-2 text-blue-600" /> Expenses Tracking
              </h3>
              <p className="mb-3">
                Complete expense management for all school expenditures:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Expense Recording</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Detailed expense descriptions</li>
                    <li>Category-based organization</li>
                    <li>Custom category creation</li>
                    <li>Date tracking and filtering</li>
                    <li>Amount and payment method recording</li>
                  </ul>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Analytics & Reporting</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Category-wise expense breakdown</li>
                    <li>Total expenditure calculations</li>
                    <li>Date range filtering</li>
                    <li>Export to CSV for accounting</li>
                    <li>Visual expense distribution charts</li>
                  </ul>
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-800 text-sm">
                  <strong>Note:</strong> Salary expenses are automatically calculated from staff records and 
                  excluded from manual expense tracking to avoid duplication.
                </p>
              </div>
            </section>

            {/* NGO Subsidies */}
            <section id="ngo" className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <FaHandHoldingUsd className="mr-2 text-blue-600" /> NGO Subsidies (NGO Schools)
              </h3>
              <p className="mb-3">
                Specialized subsidy tracking for NGO-funded schools:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Subsidy Management</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Quarterly subsidy tracking (Q1-Q4)</li>
                    <li>NGO name and contact information</li>
                    <li>Expected vs. received subsidy status</li>
                    <li>Subsidy amount and date tracking</li>
                    <li>Historical subsidy records</li>
                  </ul>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Financial Overview</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Total subsidies received</li>
                    <li>Expected future subsidies</li>
                    <li>Active NGO partnerships count</li>
                    <li>Subsidy utilization analytics</li>
                    <li>Balance tracking against expenses</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Key Feature:</strong> NGO schools automatically hide all fee-related functionality 
                  and display funding information instead, ensuring a clean interface focused solely on subsidy management.
                </p>
              </div>
            </section>

            {/* Financial Reporting */}
            <section id="financial" className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <FaChartLine className="mr-2 text-blue-600" /> Financial Reporting
              </h3>
              <p className="mb-3">
                Comprehensive financial dashboard with real-time analytics:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Income Tracking</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Total fees collected (traditional schools)</li>
                    <li>Total subsidies received (NGO schools)</li>
                    <li>Combined income visualization</li>
                    <li>Historical income trends</li>
                  </ul>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Expense Analysis</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Total expenses (excluding salaries)</li>
                    <li>Category-wise expense breakdown</li>
                    <li>Net balance calculation</li>
                    <li>Profit/loss visualization</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm mb-4">
                <h4 className="font-bold text-gray-800 mb-2">Export & Print</h4>
                <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                  <li>Transaction history export to CSV</li>
                  <li>Financial summary reports</li>
                  <li>Print-friendly layouts</li>
                  <li>Date range filtering for reports</li>
                </ul>
              </div>
            </section>

            {/* Settings */}
            <section id="settings" className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <FaCog className="mr-2 text-blue-600" /> Settings & Configuration
              </h3>
              <p className="mb-3">
                Administrator-only section for system configuration:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">School Information</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>School name and logo management</li>
                    <li>Educational level settings (Primary/Middle/High)</li>
                    <li>Funding model selection (Traditional/NGO)</li>
                    <li>Contact information</li>
                  </ul>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Display Preferences</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Theme selection (Light/Dark/System)</li>
                    <li>Date format customization</li>
                    <li>Currency settings</li>
                    <li>Sidebar behavior preferences</li>
                  </ul>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 text-sm">
                  <strong>Important:</strong> Changing the funding model (Traditional/NGO) will immediately 
                  update the interface to show/hide relevant sections like Fees or NGO Subsidies.
                </p>
              </div>
            </section>

            {/* Printing & Export */}
            <section id="printing" className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Printing & Export Features</h3>
              <p className="mb-3">
                The system supports multiple output formats for all reports and documents:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Print Options</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Browser print functionality</li>
                    <li>Thermal printer optimized layouts</li>
                    <li>Standard office printer compatibility</li>
                    <li>Print preview for verification</li>
                  </ul>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Export Formats</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>CSV export for spreadsheet analysis</li>
                    <li>PDF generation for document sharing</li>
                    <li>Image export for presentations</li>
                    <li>Customizable export fields</li>
                  </ul>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">Document Types</h4>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Fee challans and receipts</li>
                    <li>Student admission forms</li>
                    <li>Financial reports and summaries</li>
                    <li>Staff records and payslips</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Conclusion */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Getting Started</h3>
              <p className="mb-3">
                To begin using the School Management System:
              </p>
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                <li>Configure school settings in the Settings section (Administrator access required)</li>
                <li>Select your funding model (Traditional or NGO) to customize the interface</li>
                <li>Add classes and sections in the Classes Management section</li>
                <li>Register staff members in the Staff section</li>
                <li>Begin adding students through the Students Admission process</li>
                <li>For traditional schools, start generating fee challans in the Fees section</li>
                <li>For NGO schools, track subsidies in the NGO Subsidies section</li>
                <li>Record expenses in the Expenses section</li>
                <li>Monitor financial health through the Financial Reporting dashboard</li>
              </ol>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  <strong>Tip:</strong> Use the search functionality in the header to quickly find students, 
                  staff, or any record across the entire system.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            School Management System v1.0
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppGuideModal;