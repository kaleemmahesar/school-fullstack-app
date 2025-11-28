// API functions for staff attendance operations
import { API_BASE_URL } from './apiConfig';

// Fetch all staff attendance records
export const fetchStaffAttendanceRecords = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}staffAttendance`);
    if (!response.ok) {
      throw new Error('Failed to fetch staff attendance records');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching staff attendance records:', error);
    throw error;
  }
};

// Add a new staff attendance record
export const addStaffAttendanceRecord = async (attendanceData) => {
  try {
    // First, check if attendance record for this date already exists
    const existingResponse = await fetch(`${API_BASE_URL}staffAttendance&date=${attendanceData.date}`);
    let existingRecords = [];
    if (existingResponse.ok) {
      const responseData = await existingResponse.json();
      // Ensure responseData is an array and each record has a records property that is an array
      if (Array.isArray(responseData)) {
        existingRecords = responseData.map(record => ({
          ...record,
          records: Array.isArray(record.records) ? record.records : []
        }));
      }
    }

    if (existingRecords && existingRecords.length > 0) {
      // Update existing record
      const existingRecord = existingRecords[0];
      const response = await fetch(`${API_BASE_URL}staffAttendance/${existingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update staff attendance record');
      }
      
      const result = await response.json();
      // Ensure the returned records is an array
      return {
        ...result,
        records: Array.isArray(result.records) ? result.records : []
      };
    } else {
      // Create new record
      const response = await fetch(`${API_BASE_URL}staffAttendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add staff attendance record');
      }
      
      const result = await response.json();
      // Ensure the returned records is an array
      return {
        ...result,
        records: Array.isArray(result.records) ? result.records : []
      };
    }
  } catch (error) {
    console.error('Error adding staff attendance record:', error);
    throw error;
  }
};

// Update an existing staff attendance record
export const updateStaffAttendanceRecord = async (attendanceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}staffAttendance/${attendanceData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attendanceData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update staff attendance record');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating staff attendance record:', error);
    throw error;
  }
};

// Get staff attendance records by date
export const getStaffAttendanceByDate = async (date) => {
  try {
    const response = await fetch(`${API_BASE_URL}staffAttendance&date=${date}`);
    if (!response.ok) {
      throw new Error('Failed to fetch staff attendance by date');
    }
    const data = await response.json();
    // Ensure the returned data is properly formatted
    if (Array.isArray(data)) {
      return data.map(record => ({
        ...record,
        records: Array.isArray(record.records) ? record.records : []
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching staff attendance by date:', error);
    throw error;
  }
};

// Get staff attendance records by staff member
export const getStaffAttendanceByStaff = async (staffId) => {
  try {
    const response = await fetch(`${API_BASE_URL}staffAttendance`);
    if (!response.ok) {
      throw new Error('Failed to fetch staff attendance by staff');
    }
    
    const allRecords = await response.json();
    const staffRecords = [];
    
    // Ensure allRecords is an array before iterating
    if (Array.isArray(allRecords)) {
      allRecords.forEach(record => {
        // Ensure record.records is an array before trying to find
        const recordsArray = Array.isArray(record.records) ? record.records : [];
        const staffRecord = recordsArray.find(r => r.staffId === staffId);
        if (staffRecord) {
          staffRecords.push({
            date: record.date,
            status: staffRecord.status
          });
        }
      });
    }
    
    return staffRecords;
  } catch (error) {
    console.error('Error fetching staff attendance by staff:', error);
    throw error;
  }
};

// Get staff attendance records by date range
export const getStaffAttendanceByDateRange = async (staffId, startDate, endDate) => {
  try {
    const response = await fetch(`${API_BASE_URL}staffAttendance`);
    if (!response.ok) {
      throw new Error('Failed to fetch staff attendance by date range');
    }
    
    const allRecords = await response.json();
    const staffRecords = [];
    
    // Ensure allRecords is an array before iterating
    if (Array.isArray(allRecords)) {
      allRecords.forEach(record => {
        if (record.date >= startDate && record.date <= endDate) {
          // Ensure record.records is an array before trying to find
          const recordsArray = Array.isArray(record.records) ? record.records : [];
          const staffRecord = recordsArray.find(r => r.staffId === staffId);
          if (staffRecord) {
            staffRecords.push({
              date: record.date,
              status: staffRecord.status
            });
          }
        }
      });
    }
    
    return staffRecords;
  } catch (error) {
    console.error('Error fetching staff attendance by date range:', error);
    throw error;
  }
};

// Generate staff attendance report
export const generateStaffAttendanceReport = async (startDate, endDate, department) => {
  try {
    const response = await fetch(`${API_BASE_URL}staffAttendance`);
    if (!response.ok) {
      throw new Error('Failed to generate staff attendance report');
    }
    
    const allRecords = await response.json();
    // Ensure allRecords is an array and filter properly
    const filteredRecords = Array.isArray(allRecords) 
      ? allRecords.filter(record => 
          record.date >= startDate && record.date <= endDate
        )
      : [];
    
    // Calculate statistics
    const stats = {
      totalDays: filteredRecords.length,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0
    };
    
    filteredRecords.forEach(record => {
      // Ensure record.records is an array before iterating
      const recordsArray = Array.isArray(record.records) ? record.records : [];
      recordsArray.forEach(staffRecord => {
        switch (staffRecord.status) {
          case 'present':
            stats.present++;
            break;
          case 'absent':
            stats.absent++;
            break;
          case 'late':
            stats.late++;
            break;
          case 'leave':
            stats.leave++;
            break;
        }
      });
    });
    
    return {
      records: filteredRecords,
      stats
    };
  } catch (error) {
    console.error('Error generating staff attendance report:', error);
    throw error;
  }
};