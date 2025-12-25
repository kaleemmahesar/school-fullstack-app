// Configuration constants for easy switching between environments
const BASENAME_CONFIG = {
  // For local development
  local: '/',  // Use empty string or '/' for local development
  
  // For production deployment to subdirectory
  production: '/dawn-school/'  // Use your subdirectory path for production
};

// Set the current environment (change this when switching environments)
const CURRENT_ENV = 'production'; // Change to 'local' for development

import { Provider } from 'react-redux'
import { store } from './store'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import StudentsSection from './components/StudentsSection'
import ExpensesSection from './components/ExpensesSection'
import StaffSection from './components/StaffSection'
import StaffDetails from './components/StaffDetails'
import StaffAttendanceReport from './components/staff/StaffAttendanceReport'
import ClassesSection from './components/ClassesSection'
import SubsidySection from './components/SubsidySection'
import MarksheetsSection from './components/MarksheetsSection'
import CertificatesSection from './components/CertificatesSection'
import ExaminationSection from './components/ExaminationSection'
import TimeTableSection from './components/timetable/TimeTableSection'
import AdmissionPage from './components/AdmissionPage'
import LoginPage from './components/LoginPage'
import SettingsPage from './components/SettingsPage'
import FeesSection from './components/fees/FeesSection'
import AttendanceManagement from './components/students/AttendanceManagement'
import StudentReportGenerator from './components/students/StudentReportGenerator'
import FinancialReporting from './components/FinancialReporting'
import StaffAttendance from './components/staff/StaffAttendance'
import BatchManagementPage from './components/BatchManagementPage'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import ProtectedRoute from './components/common/ProtectedRoute'
import UnauthorizedPage from './components/UnauthorizedPage'
import RBACTestPage from './components/RBACTestPage'

function App() {
  return (
    <Provider store={store}>
      <Router basename={BASENAME_CONFIG[CURRENT_ENV]}>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/students" element={
              <ProtectedRoute permission="students">
                <Layout><StudentsSection /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/students/admission" element={
              <ProtectedRoute permission="students">
                <Layout><AdmissionPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/students/attendance" element={
              <ProtectedRoute permission="attendance">
                <Layout><AttendanceManagement /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/students/reports" element={
              <ProtectedRoute permission="student-reports">
                <Layout><StudentReportGenerator /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/batches" element={
              <ProtectedRoute permission="students">
                <Layout><BatchManagementPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/fees" element={
              <ProtectedRoute permission="fees">
                <Layout><FeesSection /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute permission="expenses">
                <Layout><ExpensesSection /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/staff" element={
              <ProtectedRoute permission="staff">
                <Layout><StaffSection /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/staff/attendance" element={
              <ProtectedRoute permission="staff-attendance">
                <Layout><StaffAttendance /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/staff/attendance-reports" element={
              <ProtectedRoute permission="staff-attendance">
                <Layout><StaffAttendanceReport /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/staff/:id" element={
              <ProtectedRoute permission="staff">
                <Layout><StaffDetails /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/classes" element={
              <ProtectedRoute permission="classes">
                <Layout><ClassesSection /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/subsidies" element={
              <ProtectedRoute permission="subsidies">
                <Layout><SubsidySection /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/examinations" element={
              <ProtectedRoute permission="examinations">
                <Layout><ExaminationSection /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/marksheets" element={
              <ProtectedRoute permission="marksheets">
                <Layout><MarksheetsSection /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/certificates" element={
              <ProtectedRoute permission="certificates">
                <Layout><CertificatesSection /></Layout>
              </ProtectedRoute>
            } />
            {/* <Route path="/timetable" element={<Layout><TimeTableSection /></Layout>} /> */}
            <Route path="/settings" element={
              <ProtectedRoute permission="settings">
                <Layout><SettingsPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/financial-reporting" element={
              <ProtectedRoute permission="financial-reports">
                <Layout><FinancialReporting /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/rbac-test" element={
              <Layout><RBACTestPage /></Layout>
            } />
          </Routes>
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </Provider>
  )
}

export default App