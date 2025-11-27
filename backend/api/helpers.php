<?php
// Helper function to convert string numbers to actual numbers
function formatStudentData($student) {
    if ($student) {
        // Convert numeric string fields to actual numbers
        $numericFields = ['monthlyFees', 'admissionFees', 'feesPaid', 'totalFees'];
        foreach ($numericFields as $field) {
            if (isset($student[$field])) {
                $student[$field] = (float)$student[$field];
            }
        }
        
        // Format fees history if it exists
        if (isset($student['feesHistory']) && is_array($student['feesHistory'])) {
            foreach ($student['feesHistory'] as &$fee) {
                $feeNumericFields = ['amount', 'fineAmount'];
                foreach ($feeNumericFields as $field) {
                    if (isset($fee[$field])) {
                        $fee[$field] = (float)$fee[$field];
                    }
                }
                // Convert paid field to boolean
                if (isset($fee['paid'])) {
                    $fee['paid'] = (bool)$fee['paid'];
                }
            }
        }
    }
    return $student;
}

// Helper function to format multiple students
function formatStudentsData($students) {
    foreach ($students as &$student) {
        $student = formatStudentData($student);
    }
    return $students;
}

// Helper function to convert staff data with salary history
function formatStaffData($staff) {
    if ($staff) {
        // Convert numeric string fields to actual numbers
        $numericFields = ['salary'];
        foreach ($numericFields as $field) {
            if (isset($staff[$field])) {
                $staff[$field] = (float)$staff[$field];
            }
        }
        
        // Format salary history if it exists
        if (isset($staff['salaryHistory']) && is_array($staff['salaryHistory'])) {
            foreach ($staff['salaryHistory'] as &$salary) {
                $salaryNumericFields = ['baseSalary', 'allowances', 'deductions', 'netSalary'];
                foreach ($salaryNumericFields as $field) {
                    if (isset($salary[$field])) {
                        $salary[$field] = (float)$salary[$field];
                    }
                }
            }
        }
    }
    return $staff;
}

// Helper function to format multiple staff members
function formatStaffDataArray($staffArray) {
    foreach ($staffArray as &$staff) {
        $staff = formatStaffData($staff);
    }
    return $staffArray;
}

// Generic helper function to convert specific fields to numbers
function convertFieldsToNumbers($data, $numericFields) {
    if ($data) {
        foreach ($numericFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = (float)$data[$field];
            }
        }
    }
    return $data;
}

// Generic helper function to convert specific fields to booleans
function convertFieldsToBooleans($data, $booleanFields) {
    if ($data) {
        foreach ($booleanFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = (bool)$data[$field];
            }
        }
    }
    return $data;
}