# Flexible Grading Structure Implementation

## Overview
The flexible grading structure allows schools to configure different class combinations based on their educational model. This implementation supports:
- Primary schools: PG, Nursery, KG (optional) + 1-5 (mandatory)
- Middle schools: PG, Nursery, KG (optional) + 1-8 (mandatory)
- High schools: PG, Nursery, KG (optional) + 1-10 (mandatory)

## Implementation Details

### Settings Configuration
The flexible grading structure is implemented through the settings system:

1. **School Levels Configuration**:
   - Each school level (Primary, Middle, High) has an `includePrePrimary` flag
   - Each school level has a `prePrimaryGrades` array defining which pre-primary grades to include
   - Each school level has a `classRange` defining the mandatory class range

2. **Class Validation**:
   - When adding new classes, the system validates against the configured school settings
   - Pre-primary classes (PG, Nursery, KG) are conditionally included based on settings
   - Mandatory class ranges are enforced based on school level

### UI Implementation

#### Settings Page
The SettingsPage component allows administrators to configure:
- School name and information
- School level (Primary, Middle, High)
- Pre-primary grade inclusion options
- Class range configuration

#### Class Management
The ClassesSection and ClassFormModal components implement:
- Dynamic class name dropdowns based on school settings
- Validation against configured school levels
- Proper error handling for invalid class configurations

### Redux Integration
The settingsSlice manages the school configuration state:

```javascript
{
  schoolInfo: {
    name: '',
    address: '',
    phone: '',
    email: '',
    schoolLevel: 'primary', // 'primary', 'middle', 'high'
    viewMode: 'fees'
  },
  levels: {
    primary: {
      includePrePrimary: true,
      prePrimaryGrades: ['PG', 'Nursery', 'KG'],
      classRange: { min: 1, max: 5 }
    },
    middle: {
      includePrePrimary: true,
      prePrimaryGrades: ['PG', 'Nursery', 'KG'],
      classRange: { min: 1, max: 8 }
    },
    high: {
      includePrePrimary: true,
      prePrimaryGrades: ['PG', 'Nursery', 'KG'],
      classRange: { min: 1, max: 10 }
    }
  }
}
```

### Key Components

#### SettingsPage.jsx
- Implements the UI for configuring school levels
- Manages form state for all settings
- Dispatches actions to update settings in the Redux store

#### ClassesSection.jsx
- Displays the list of configured classes
- Provides interface for adding new classes
- Validates class configurations against school settings

#### ClassFormModal.jsx
- Implements the form for adding/editing classes
- Uses dropdown for class names based on school settings
- Validates form data before submission

### Data Flow

1. **Configuration**: Administrator configures school settings through SettingsPage
2. **Storage**: Settings are stored in Redux store via settingsSlice
3. **Validation**: When adding classes, ClassFormModal validates against stored settings
4. **Display**: ClassesSection displays all configured classes

### Benefits

1. **Flexibility**: Schools can configure class structures that match their educational model
2. **Validation**: System prevents invalid class configurations
3. **Scalability**: Easy to extend for additional school levels or grade configurations
4. **User Experience**: Intuitive dropdown interfaces make class management simple

### Future Enhancements

1. **Custom Grade Ranges**: Allow schools to define completely custom grade ranges
2. **Section Management**: Add support for sections within classes
3. **Grade Progression**: Implement automatic grade progression for students
4. **Multi-campus Support**: Extend configuration for schools with multiple campuses