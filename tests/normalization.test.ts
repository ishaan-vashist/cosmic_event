import { describe, it, expect } from 'vitest';
import { normalizeNeo, normalizeApproach } from '@/lib/nasa';

describe('normalizeApproach', () => {
  it('should correctly normalize approach data with all fields', () => {
    const mockApproach = {
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
    };

    const result = normalizeApproach(mockApproach);

    expect(result).toEqual({
      datetime: '2025-Aug-15 12:34',
      epoch: 1755555555000,
      velocityKps: 15.123,
      missDistanceKm: 1234567.89,
      orbitingBody: 'Earth'
    });
  });

  it('should handle missing fields gracefully', () => {
    const mockApproach = {
      close_approach_date: '2025-08-15',
      // Missing close_approach_date_full
      epoch_date_close_approach: null,
      // Missing relative_velocity
      miss_distance: {
        // Missing kilometers
      },
      orbiting_body: null
    };

    const result = normalizeApproach(mockApproach);

    expect(result).toEqual({
      datetime: '2025-08-15', // Falls back to close_approach_date
      epoch: null,
      velocityKps: null,
      missDistanceKm: null,
      orbitingBody: null
    });
  });
});

describe('normalizeNeo', () => {
  it('should correctly normalize NEO data with all fields', () => {
    const mockNeo = {
      id: '123456',
      neo_reference_id: 'ref123',
      name: 'Test Asteroid',
      nasa_jpl_url: 'https://ssd.jpl.nasa.gov/test',
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
        },
        {
          close_approach_date: '2025-08-20',
          close_approach_date_full: '2025-Aug-20 15:30',
          epoch_date_close_approach: 1756000000000,
          relative_velocity: {
            kilometers_per_second: '16.456'
          },
          miss_distance: {
            kilometers: '2345678.90'
          },
          orbiting_body: 'Earth'
        }
      ]
    };

    const result = normalizeNeo(mockNeo);

    expect(result).toEqual({
      id: '123456',
      name: 'Test Asteroid',
      hazardous: true,
      avgDiameterKm: 1, // (0.5 + 1.5) / 2
      nearestApproach: {
        datetime: '2025-Aug-15 12:34',
        epoch: 1755555555000,
        velocityKps: 15.123,
        missDistanceKm: 1234567.89,
        orbitingBody: 'Earth'
      },
      approachesCount: 2,
      nasaUrl: 'https://ssd.jpl.nasa.gov/test'
    });
  });

  it('should handle missing diameter data', () => {
    const mockNeo = {
      id: '123456',
      neo_reference_id: 'ref123',
      name: 'Test Asteroid',
      nasa_jpl_url: 'https://ssd.jpl.nasa.gov/test',
      is_potentially_hazardous_asteroid: false,
      estimated_diameter: {
        // Missing kilometers data
      },
      close_approach_data: []
    };

    const result = normalizeNeo(mockNeo);

    expect(result).toEqual({
      id: '123456',
      name: 'Test Asteroid',
      hazardous: false,
      avgDiameterKm: null,
      nearestApproach: null,
      approachesCount: 0,
      nasaUrl: 'https://ssd.jpl.nasa.gov/test'
    });
  });

  it('should select the earliest approach as the nearest approach', () => {
    const mockNeo = {
      id: '123456',
      neo_reference_id: 'ref123',
      name: 'Test Asteroid',
      nasa_jpl_url: 'https://ssd.jpl.nasa.gov/test',
      is_potentially_hazardous_asteroid: false,
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: 0.5,
          estimated_diameter_max: 1.5
        }
      },
      close_approach_data: [
        {
          close_approach_date: '2025-08-20',
          close_approach_date_full: '2025-Aug-20 15:30',
          epoch_date_close_approach: 1756000000000,
          relative_velocity: {
            kilometers_per_second: '16.456'
          },
          miss_distance: {
            kilometers: '2345678.90'
          },
          orbiting_body: 'Earth'
        },
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
    };

    const result = normalizeNeo(mockNeo);

    // Should select the approach with the earlier epoch
    expect(result.nearestApproach?.epoch).toBe(1755555555000);
    expect(result.nearestApproach?.datetime).toBe('2025-Aug-15 12:34');
  });
});
