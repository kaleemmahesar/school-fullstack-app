import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaPrint, FaCogs } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import ClassTimeTable from './ClassTimeTable';
import TimeTableForm from './TimeTableForm';
import TimeTableSettings from './TimeTableSettings';

const TimeTableSection = () => {
  const { classes } = useSelector(state => state.classes);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('timetable'); // 'timetable' or 'settings'
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'yearly'

  // Get sections for selected class
  const classSections = selectedClass 
    ? classes.find(c => c.id === selectedClass)?.sections || []
    : [];

  return (
    <>
      <PageHeader
        title="Section Timetable"
        subtitle="Manage monthly/yearly class schedules"
        actionButton={
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 print:hidden"
            >
              <FaCogs className="mr-1" /> Settings
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 print:hidden"
            >
              <FaPrint className="mr-1" /> Print
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 print:hidden"
            >
              <FaPlus className="mr-2" /> Add Slot
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 print:hidden">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timetable'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Timetable
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* View Mode Toggle */}
      {activeTab === 'timetable' && (
        <div className="bg-white shadow p-4 mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">View Mode</h3>
              <p className="text-sm text-gray-500">Switch between monthly and yearly timetable views</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'monthly'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'yearly'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Tab Content */}
      {activeTab === 'timetable' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection('');
                  }}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                >
                  <option value="">Select Section</option>
                  {classSections.map(section => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {selectedClass && selectedSection && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Current View:</strong> {viewMode === 'monthly' ? 'Monthly' : 'Yearly'} timetable for 
                  <strong> {classes.find(c => c.id === selectedClass)?.name} - {classSections.find(s => s.id === selectedSection)?.name}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Timetable Form Modal */}
          {showForm && (
            <TimeTableForm
              selectedClass={selectedClass}
              selectedSection={selectedSection}
              editingSlot={editingSlot}
              onClose={() => {
                setShowForm(false);
                setEditingSlot(null);
              }}
              onSubmit={() => {
                setShowForm(false);
                setEditingSlot(null);
              }}
            />
          )}

          {/* Timetable Display */}
          {selectedClass && selectedSection ? (
            <ClassTimeTable
              classId={selectedClass}
              sectionId={selectedSection}
              onEditSlot={(slot) => {
                setEditingSlot(slot);
                setShowForm(true);
              }}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <FaPrint className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Select Class and Section</h3>
              <p className="mt-2 text-sm text-gray-500">
                Please select a class and section to view or create a timetable.
              </p>
            </div>
          )}
        </>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && (
        <TimeTableSettings />
      )}
    </>
  );
};

export default TimeTableSection;