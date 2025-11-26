# School Management Application

A comprehensive school management system built with React, Redux Toolkit, and Tailwind CSS.

## Features

- **Student Management**
  - Add, edit, and delete student records
  - Track admission details, fees, and class information
  - Search and filter students

- **Expense Management**
  - Track all school expenses
  - Categorize expenses (stationary, salary, utilities, etc.)
  - Add new expense categories
  - View expense summaries and analytics

- **Staff Management**
  - Maintain staff records
  - Track position, salary, and joining date
  - Search and filter staff members
  - View staff distribution by position

- **Class Management**
  - Manage class information
  - Define sections for each class
  - Track student count per section and class
  - Visualize student distribution

## Technologies Used

- React.js
- Redux Toolkit (State Management)
- Tailwind CSS (Styling)
- React Icons
- Formik (Form Handling - to be implemented)
- Yup (Form Validation - to be implemented)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx
│   ├── StudentsSection.jsx
│   ├── ExpensesSection.jsx
│   ├── StaffSection.jsx
│   └── ClassesSection.jsx
├── store/
│   ├── index.js
│   ├── studentsSlice.js
│   ├── expensesSlice.js
│   ├── staffSlice.js
│   └── classesSlice.js
├── App.jsx
└── main.jsx
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser to http://localhost:5173

## School Configuration System

This application includes a school-specific configuration system that allows you to customize the school name, logo, and grading structure for different schools.

### Configuration Files

- `school-config.json`: Main configuration file for school-specific settings
- `src/config/schoolConfig.js`: Auto-generated file during build process

### Building for a Specific School

To build the application for a specific school:

1. Modify the `school-config.json` file with the school's settings
2. Run the build command:
   ```
   npm run build:school
   ```

Or use the provided batch script:
```
build-for-school.bat school-config.json
```

This will:
- Generate the `src/config/schoolConfig.js` file based on your configuration
- Build the application with the school-specific settings baked in

### Configuration Options

The configuration file supports:
- School name
- Logo (Base64 encoded or URL)
- School level (primary, middle, high)
- Funding type (traditional, ngo)
- Customizable grading structure

## Improved UI Features

The application now features a completely redesigned, modern UI with:

- **Gradient Cards**: Beautiful gradient summary cards for key metrics
- **Enhanced Navigation**: Modern tab-based navigation with active state indicators
- **Responsive Design**: Fully responsive layout that works on all devices
- **Interactive Elements**: Hover effects and smooth transitions for better UX
- **Data Visualization**: Progress bars and charts for better data representation
- **Improved Forms**: Better organized forms with icons and proper validation
- **Search Functionality**: Enhanced search with real-time filtering
- **Action Buttons**: Consistent action buttons with hover effects
- **Clean Typography**: Better font hierarchy and spacing

## Redux Store Structure

The application uses Redux Toolkit for state management with the following slices:

- `studentsSlice`: Manages student data
- `expensesSlice`: Manages expense records and categories
- `staffSlice`: Manages staff information
- `classesSlice`: Manages class and section data

Each slice includes:
- Initial state with mock data
- Async thunks for CRUD operations
- Reducers for state updates

## Components

Each main feature is implemented as a separate component:
- `Dashboard`: Main dashboard with navigation and overview
- `StudentsSection`: Student management interface
- `ExpensesSection`: Expense tracking and management with category analytics
- `StaffSection`: Staff information management with position distribution
- `ClassesSection`: Class and section management with student distribution

## Future Enhancements

- Implement Formik and Yup for form handling and validation
- Add toast notifications for user feedback
- Implement data persistence (localStorage or backend API)
- Add authentication and user management
- Create detailed reports and analytics
- Add student attendance tracking
- Implement fee receipt generation
- Add certificate generation features

## License

This project is open source and available under the MIT License.