# School Configuration System

This document explains how to configure school-specific settings for the application.

## Configuration Files

1. `school-config.json` - The main configuration file that defines school-specific settings
2. `src/config/schoolConfig.js` - Auto-generated file that is created during the build process

## Configuration Options

The `school-config.json` file supports the following options:

- `name`: The name of the school
- `logo`: Base64 encoded logo or URL to the logo image (can be null)
- `level`: School level ('primary', 'middle', or 'high')
- `fundingType`: Funding type ('traditional' or 'ngo')
- `hasPG`: Boolean indicating if the school has Play Group classes
- `hasNursery`: Boolean indicating if the school has Nursery classes
- `hasKG`: Boolean indicating if the school has Kindergarten classes
- `gradingStructure`: Array of grading rules with the following properties:
  - `id`: Unique identifier for the rule
  - `minPercentage`: Minimum percentage for this grade
  - `maxPercentage`: Maximum percentage for this grade
  - `grade`: Grade letter (e.g., 'A+', 'A', 'B+', etc.)
  - `remarks`: Description of the grade (e.g., 'Excellent', 'Very Good', etc.)

## Building for a Specific School

To build the application for a specific school:

1. Modify the `school-config.json` file with the school's settings
2. Run the build command:
   ```
   npm run build:school
   ```

This will:
- Generate the `src/config/schoolConfig.js` file based on your `school-config.json`
- Build the application with the school-specific settings baked in

## Example Configuration

```json
{
  "name": "SEF High School Larkana",
  "logo": null,
  "level": "high",
  "fundingType": "ngo",
  "hasPG": true,
  "hasNursery": true,
  "hasKG": true,
  "gradingStructure": [
    { "id": 1, "minPercentage": 90, "maxPercentage": 100, "grade": "A+", "remarks": "Excellent" },
    { "id": 2, "minPercentage": 80, "maxPercentage": 89, "grade": "A", "remarks": "Very Good" },
    { "id": 3, "minPercentage": 70, "maxPercentage": 79, "grade": "B+", "remarks": "Good" },
    { "id": 4, "minPercentage": 60, "maxPercentage": 69, "grade": "B", "remarks": "Satisfactory" },
    { "id": 5, "minPercentage": 50, "maxPercentage": 59, "grade": "C", "remarks": "Average" },
    { "id": 6, "minPercentage": 40, "maxPercentage": 49, "grade": "D", "remarks": "Below Average" },
    { "id": 7, "minPercentage": 0, "maxPercentage": 39, "grade": "F", "remarks": "Fail" }
  ]
}
```

## Important Notes

- The configuration is baked into the build, so schools cannot modify these settings after receiving the application
- Only the developer (you) can change these settings by modifying the configuration file and rebuilding the application
- The Settings page in the application will display these values but will not allow modification in the distributed builds
- The early childhood education settings (PG, Nursery, KG) can be enabled or disabled based on the specific school's needs