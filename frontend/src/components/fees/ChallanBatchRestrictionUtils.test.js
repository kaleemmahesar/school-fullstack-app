import React from 'react';
import { isMonthInBatchRange } from './ChallanModals';

describe('Challan Batch Restriction Utilities', () => {
  test('isMonthInBatchRange - month within batch period', () => {
    const batch = {
      startDate: '2024-02-01',
      endDate: '2025-04-30'
    };
    
    // Test month within batch period
    expect(isMonthInBatchRange('2024-03', batch)).toBe(true);
    expect(isMonthInBatchRange('2024-02', batch)).toBe(true);
    expect(isMonthInBatchRange('2025-04', batch)).toBe(true);
  });

  test('isMonthInBatchRange - month outside batch period', () => {
    const batch = {
      startDate: '2024-02-01',
      endDate: '2025-04-30'
    };
    
    // Test month before batch period
    expect(isMonthInBatchRange('2024-01', batch)).toBe(false);
    
    // Test month after batch period
    expect(isMonthInBatchRange('2025-05', batch)).toBe(false);
  });

  test('isMonthInBatchRange - edge cases', () => {
    // Test with missing batch data
    expect(isMonthInBatchRange('2024-03', null)).toBe(true);
    expect(isMonthInBatchRange('2024-03', {})).toBe(true);
    expect(isMonthInBatchRange('2024-03', { startDate: null, endDate: null })).toBe(true);
    
    // Test with missing month
    const batch = {
      startDate: '2024-02-01',
      endDate: '2025-04-30'
    };
    expect(isMonthInBatchRange(null, batch)).toBe(true);
    expect(isMonthInBatchRange('', batch)).toBe(true);
  });

  test('isMonthInBatchRange - year boundary cases', () => {
    const batch = {
      startDate: '2024-12-01',
      endDate: '2025-01-31'
    };
    
    // Test December 2024 (within batch)
    expect(isMonthInBatchRange('2024-12', batch)).toBe(true);
    
    // Test January 2025 (within batch)
    expect(isMonthInBatchRange('2025-01', batch)).toBe(true);
    
    // Test November 2024 (outside batch)
    expect(isMonthInBatchRange('2024-11', batch)).toBe(false);
    
    // Test February 2025 (outside batch)
    expect(isMonthInBatchRange('2025-02', batch)).toBe(false);
  });
});