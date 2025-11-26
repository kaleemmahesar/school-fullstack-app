import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUsers, FaMoneyBillWave, FaChalkboardTeacher, FaBook, FaGraduationCap, FaChartLine, FaDollarSign, FaClipboardList, FaChevronDown, FaQrcode, FaUsersCog, FaFileInvoice, FaTasks, FaListOl, FaFileAlt, FaEdit, FaGraduationCap as FaGraduationCapIcon, FaCalendarAlt, FaCertificate, FaUser, FaSignOutAlt, FaCog, FaTable, FaSearch, FaHandHoldingUsd } from 'react-icons/fa';
import Logo from '../img/logo.png';
import { logout, setCurrentUser } from '../store/usersSlice';
import { fetchStudents } from '../store/studentsSlice';
import { fetchExpenses } from '../store/expensesSlice';
import { fetchStaff } from '../store/staffSlice';
import { fetchClasses } from '../store/classesSlice';
import { fetchSubsidies } from '../store/subsidiesSlice';
import { useSchoolFunding } from '../hooks/useSchoolFunding';
import { usePermissions } from '../hooks/usePermissions';
import NotificationPanel from './NotificationPanel';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const students = useSelector(state => state.students.students);
  const expenses = useSelector(state => state.expenses.expenses);
  const staff = useSelector(state => state.staff.staff);
  const classes = useSelector(state => state.classes.classes);
  const { currentUser } = useSelector(state => state.users);
  const { isNGOSchool } = useSchoolFunding();
  const permissions = usePermissions();
  const { hasPermission, isOwner, isAdmin, isTeacher, isStaff } = permissions;
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Load all necessary data on initial load
  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchExpenses());
    dispatch(fetchStaff());
    dispatch(fetchClasses());
    dispatch(fetchSubsidies());
  }, [dispatch]);

  // Check for user in localStorage on initial load
  useEffect(() => {
    if (!currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          dispatch(setCurrentUser(parsedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('currentUser');
        }
      }
    }
  }, [currentUser, dispatch]);

  // Redirect to login if not authenticated (except for login page)
  useEffect(() => {
    if (!currentUser && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [currentUser, location.pathname, navigate]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container') && !e.target.closest('.user-menu')) {
        closeDropdowns();
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Navigation items configuration with dropdown functionality
  // Filter navigation based on user role
  const getNavItems = () => {
    // Only generate navigation items if user is authenticated
    if (!currentUser) {
      return [];
    }
    
    // Since we know currentUser exists here, we can safely call permission functions
    const baseItems = [
      {
        name: 'Dashboard',
        path: '/',
        icon: <FaChartLine className="mr-2" />,
        exact: true
      }
    ];

    // Batch Management section - available to Owner, Admin, Staff
    try {
      if (hasPermission('students')) {
        baseItems.push({
          name: 'Batch Management',
          path: '/batches',
          icon: <FaGraduationCapIcon className="mr-2" />
        });
      }
    } catch (e) {
      console.warn('Error checking batch management permissions:', e);
    }

    // Students section - available to Owner, Admin, Staff, Teacher
    try {
      if (hasPermission('students') || hasPermission('attendance') || hasPermission('marksheets') || hasPermission('reports') || hasPermission('certificates') || hasPermission('examinations')) {
        baseItems.push({
          name: 'Students',
          path: '/students',
          icon: <FaUsers className="mr-2" />,
          dropdown: [
            // { name: 'All Students', path: '/students' },
            { name: 'Attendance', path: '/students/attendance', permission: 'attendance' },
            { name: 'Reports', path: '/students/reports', permission: 'student-reports' },
            { name: 'Marksheets', path: '/marksheets', permission: 'marksheets' },
            { name: 'Certificates', path: '/certificates', permission: 'certificates' },
            { name: 'Examinations', path: '/examinations', permission: 'examinations' }
          ].filter(item => !item.permission || hasPermission(item.permission))
        });
      }
    } catch (e) {
      console.warn('Error checking student permissions:', e);
    }

    
    // Classes section - available to Owner, Admin, Staff
    try {
      if (hasPermission('classes')) {
        baseItems.push({
          name: 'Classes',
          path: '/classes',
          icon: <FaBook className="mr-2" />
        });
      }
    } catch (e) {
      console.warn('Error checking class permissions:', e);
    }

    // Staff section - available to Owner, Admin
    try {
      if (hasPermission('staff')) {
        baseItems.push({
          name: 'Staff',
          path: '/staff',
          icon: <FaChalkboardTeacher className="mr-2" />,
          dropdown: [
            { name: 'All Staff', path: '/staff' },
            { name: 'Attendance', path: '/staff/attendance', permission: 'staff-attendance' },
            { name: 'Attendance Reports', path: '/staff/attendance-reports', permission: 'staff-attendance' }
          ].filter(item => !item.permission || hasPermission(item.permission))
        });
      }
    } catch (e) {
      console.warn('Error checking staff permissions:', e);
    }

    // Fees section - available to Owner, Staff (traditional schools only)
    try {
      if (!isNGOSchool && (isOwner() || isStaff() || hasPermission('fees'))) {
        baseItems.push({
          name: 'Fees',
          path: '/fees',
          icon: <FaFileInvoice className="mr-2" />
        });
      }
    } catch (e) {
      console.warn('Error checking fee permissions:', e);
    }

    // Expenses section - available only to Owner
    try {
      if (isOwner() || hasPermission('expenses')) {
        baseItems.push({
          name: 'Expenses',
          path: '/expenses',
          icon: <FaMoneyBillWave className="mr-2" />
        });
      }
    } catch (e) {
      console.warn('Error checking expense permissions:', e);
    }

    // NGO Subsidies section - available only to Owner (NGO schools only)
    try {
      if (isNGOSchool && (isOwner() || hasPermission('subsidies'))) {
        baseItems.push({
          name: 'NGO Subsidies',
          path: '/subsidies',
          icon: <FaHandHoldingUsd className="mr-2" />
        });
      }
    } catch (e) {
      console.warn('Error checking subsidy permissions:', e);
    }

    // Financial Report section - available only to Owner
    try {
      if (isOwner() || hasPermission('financial-reports')) {
        baseItems.push({
          name: 'Financial Report',
          path: '/financial-reporting',
          icon: <FaChartLine className="mr-2" />
        });
      }
    } catch (e) {
      console.warn('Error checking financial report permissions:', e);
    }

    // Settings section - available only to Owner
    try {
      if (isOwner() || hasPermission('settings')) {
        baseItems.push({
          name: 'Settings',
          path: '/settings',
          icon: <FaCog className="mr-2" />
        });
      }
    } catch (e) {
      console.warn('Error checking settings permissions:', e);
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isLoginPage = location.pathname === '/login';
  
  // Determine what to render based on authentication state
  const renderContent = () => {
    // If not authenticated and not on login page, don't render the layout content
    if (!currentUser && !isLoginPage) {
      return null;
    }

    // For login page, just render children without layout
    if (isLoginPage) {
      return <div>{children}</div>;
    }

    // Render full layout for authenticated users
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-8xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="rounded-xl">
                  <img src={Logo} alt="Logo" className="h-14 w-auto" />
                </div>
                <h1 className="ml-3 text-2xl font-bold text-gray-900">ABC High School</h1>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationPanel />
                {currentUser ? (
                  <div className="relative user-menu">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full">
                        <FaUser className="text-white" />
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                        <p className="text-xs text-gray-500">{currentUser.role}</p>
                      </div>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                          <p className="text-xs text-gray-500">{currentUser.role}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <FaSignOutAlt className="mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-sm border-t border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex py-3 space-x-6">
              
              {navItems.map((item, index) => (
                <div key={index} className="dropdown-container relative">
                  {item.dropdown ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                          isActive(item.path) || item.dropdown.some(subItem => isActive(subItem.path))
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {item.icon}
                        {item.name}
                        <FaChevronDown className="ml-1 text-xs" />
                      </button>
                      
                      {openDropdown === item.name && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                          {item.dropdown.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              to={subItem.path}
                              className={`block px-4 py-2 text-sm ${
                                isActive(subItem.path)
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={closeDropdowns}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={closeDropdowns}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    );
  };

  return renderContent();
};

export default Layout;