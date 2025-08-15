import { describe, it, expect } from 'vitest';
import { normalizeNeoData } from '@/lib/nasa';
import { z } from 'zod';

// Mock NASA API response
const mockNasaResponse = {
  element_count: 2,
  near_earth_objects: {
    '2025-08-15': [
      {
        id: '123456',
        neo_reference_id: 'ref123',
        name: 'Test Asteroid 1',
        nasa_jpl_url: 'https://ssd.jpl.nasa.gov/test1',
        is_potentially_hazardous_asteroid: true,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.5,
            estimated_diameter_max: 1.5
          }
        },
        close_approach_data: [
          {
            close_approach_date: '2025-08-15',
            close_approach_date_full: '2025-Aug-15 12:34',
            epoch_date_close_approach: 1755555555000,
            relative_velocity: {
              kilometers_per_second: '15.123'
            },
            miss_distance: {
              kilometers: '1234567.89'
            },
            orbiting_body: 'Earth'
          }
        ]
      }
    ],
    '2025-08-16': [
      {
        id: '234567',
        neo_reference_id: 'ref234',
        name: 'Test Asteroid 2',
        nasa_jpl_url: 'https://ssd.jpl.nasa.gov/test2',
        is_potentially_hazardous_asteroid: false,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.2,
            estimated_diameter_max: 0.8
          }
        },
        close_approach_data: [
          {
            close_approach_date: '2025-08-16',
            close_approach_date_full: '2025-Aug-16 08:15',
            epoch_date_close_approach: 1755630000000,
            relative_velocity: {
              kilometers_per_second: '20.456'
            },
            miss_distance: {
              kilometers: '3456789.01'
            },
            orbiting_body: 'Earth'
          }
        ]
      }
    ]
  }
};

describe('normalizeNeoData', () => {
  it('should correctly normalize NASA feed response', () => {
    const result = normalizeNeoData(mockNasaResponse);
    
    // Validate result structure
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2025-08-15');
    expect(result[1].date).toBe('2025-08-16');
    
    // Check counts
    expect(result[0].count).toBe(1);
    expect(result[1].count).toBe(1);
    
    // Check NEO data normalization
    const neo1 = result[0].neos[0];
    expect(neo1.id).toBe('123456');
    expect(neo1.name).toBe('Test Asteroid 1');
    expect(neo1.hazardous).toBe(true);
    expect(neo1.avgDiameterKm).toBe(1);
    
    const neo2 = result[1].neos[0];
    expect(neo2.id).toBe('234567');
    expect(neo2.name).toBe('Test Asteroid 2');
    expect(neo2.hazardous).toBe(false);
    expect(neo2.avgDiameterKm).toBe(0.5);
  });
  
  it('should filter hazardous NEOs when hazardousOnly is true', () => {
    const result = normalizeNeoData(mockNasaResponse, true);
    
    // Should only include the hazardous NEO
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2025-08-15');
    expect(result[0].count).toBe(1);
    expect(result[0].neos[0].hazardous).toBe(true);
  });
  
  it('should sort NEOs by approach date', () => {
    // Create a response with multiple NEOs on the same day with different approach times
    const mockResponseWithMultipleNEOs = {
      element_count: 3,
      near_earth_objects: {
        '2025-08-15': [
          {
            id: '123456',
            neo_reference_id: 'ref123',
            name: 'Test Asteroid 1',
            nasa_jpl_url: 'https://ssd.jpl.nasa.gov/test1',
            is_potentially_hazardous_asteroid: true,
            estimated_diameter: {
              kilometers: {
                estimated_diameter_min: 0.5,
                estimated_diameter_max: 1.5
              }
            },
            close_approach_data: [
              {
                close_approach_date: '2025-08-15',
                close_approach_date_full: '2025-Aug-15 12:34',
                epoch_date_close_approach: 1755555555000,
                relative_velocity: {
                  kilometers_per_second: '15.123'
                },
                miss_distance: {
                  kilometers: '1234567.89'
                },
                orbiting_body: 'Earth'
              }
            ]
          },
          {
            id: '345678',
            neo_reference_id: 'ref345',
            name: 'Test Asteroid 3',
            nasa_jpl_url: 'https://ssd.jpl.nasa.gov/test3',
            is_potentially_hazardous_asteroid: true,
            estimated_diameter: {
              kilometers: {
                estimated_diameter_min: 1.0,
                estimated_diameter_max: 2.0
              }
            },
            close_approach_data: [
              {
                close_approach_date: '2025-08-15',
                close_approach_date_full: '2025-Aug-15 08:15',
                epoch_date_close_approach: 1755540000000, // Earlier time
                relative_velocity: {
                  kilometers_per_second: '18.789'
                },
                miss_distance: {
                  kilometers: '2345678.90'
                },
                orbiting_body: 'Earth'
              }
            ]
          }
        ]
      }
    };
    
    // Test ascending sort
    const resultAsc = normalizeNeoData(mockResponseWithMultipleNEOs, false, 'approach_asc');
    expect(resultAsc[0].neos[0].id).toBe('345678'); // Earlier approach should be first
    expect(resultAsc[0].neos[1].id).toBe('123456');
    
    // Test descending sort
    const resultDesc = normalizeNeoData(mockResponseWithMultipleNEOs, false, 'approach_desc');
    expect(resultDesc[0].neos[0].id).toBe('123456'); // Later approach should be first
    expect(resultDesc[0].neos[1].id).toBe('345678');
  });
  
  it('should validate the structure of the normalized data', () => {
    const result = normalizeNeoData(mockNasaResponse);
    
    // Define a schema for validation
    const ApproachSchema = z.object({
      datetime: z.string().nullable(),
      epoch: z.number().nullable().optional(),
      velocityKps: z.number().nullable().optional(),
      missDistanceKm: z.number().nullable().optional(),
      orbitingBody: z.string().nullable().optional(),
    });
    
    const NeoSchema = z.object({
      id: z.string(),
      name: z.string(),
      hazardous: z.boolean(),
      avgDiameterKm: z.number().nullable(),
      nearestApproach: ApproachSchema.nullable(),
      approachesCount: z.number(),
      nasaUrl: z.string(),
    });
    
    const DayGroupSchema = z.object({
      date: z.string(),
      count: z.number(),
      neos: z.array(NeoSchema),
    });
    
    // Validate each day group
    result.forEach(dayGroup => {
      const validationResult = DayGroupSchema.safeParse(dayGroup);
      expect(validationResult.success).toBe(true);
    });
  });
});
