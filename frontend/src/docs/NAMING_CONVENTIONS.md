# Naming Conventions

## File Naming

1. **Component Files**: Use PascalCase with `.jsx` extension
   - ✅ `StudentList.jsx`
   - ✅ `UserManagement.jsx`
   - ❌ `studentList.jsx`
   - ❌ `user_management.jsx`

2. **Utility Files**: Use camelCase with `.js` extension
   - ✅ `dateUtils.js`
   - ✅ `validation.js`
   - ❌ `DateUtils.js`
   - ❌ `validation_utils.js`

3. **Hook Files**: Use camelCase with `use` prefix and `.js` extension
   - ✅ `useFormValidation.js`
   - ✅ `useStudentStats.js`
   - ❌ `UseFormValidation.js`
   - ❌ `formValidationHook.js`

## Component Naming

1. **Component Names**: Use PascalCase
   - ✅ `StudentList`
   - ✅ `UserManagement`
   - ❌ `studentList`
   - ❌ `user_management`

2. **Component Suffixes**:
   - Page components: `Page` suffix (e.g., `DashboardPage`)
   - Section components: `Section` suffix (e.g., `StudentsSection`)
   - Modal components: `Modal` suffix (e.g., `StudentModal`)
   - Form components: `Form` suffix (e.g., `StudentForm`)
   - List components: `List` suffix (e.g., `StudentList`)
   - Button components: `Button` suffix (e.g., `ActionButton`)

## Variable and Function Naming

1. **Variables**: Use camelCase
   - ✅ `studentData`
   - ✅ `totalFees`
   - ❌ `StudentData`
   - ❌ `total_fees`

2. **Functions**: Use camelCase with descriptive names
   - ✅ `calculateTotalFees`
   - ✅ `validateStudentForm`
   - ❌ `CalculateTotalFees`
   - ❌ `validate_student_form`

3. **Constants**: Use UPPER_SNAKE_CASE
   - ✅ `MAX_STUDENTS_PER_PAGE`
   - ✅ `API_ENDPOINT`
   - ❌ `maxStudentsPerPage`
   - ❌ `api_endpoint`

## CSS Classes

1. **Class Names**: Use kebab-case
   - ✅ `student-card`
   - ✅ `form-container`
   - ❌ `studentCard`
   - ❌ `FormContainer`

## Redux

1. **Action Types**: Use UPPER_SNAKE_CASE
   - ✅ `FETCH_STUDENTS_SUCCESS`
   - ✅ `ADD_STUDENT_FAILURE`
   - ❌ `fetchStudentsSuccess`
   - ❌ `add_student_failure`

2. **Reducer Names**: Use camelCase
   - ✅ `studentsReducer`
   - ✅ `userManagementReducer`
   - ❌ `StudentsReducer`
   - ❌ `user_management_reducer`

## Git Branches

1. **Branch Names**: Use kebab-case with descriptive names
   - ✅ `feature/student-management`
   - ✅ `bugfix/login-error`
   - ✅ `hotfix/critical-security-issue`
   - ❌ `feature_student_management`
   - ❌ `BugFix_LoginError`