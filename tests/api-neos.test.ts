import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/neos/route';

// Mock the NASA API fetch function
vi.mock('@/lib/nasa', () => ({
  fetchNeoFeed: vi.fn().mockImplementation(async () => {
    return {
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
  }),
  normalizeNeoData: vi.fn().mockImplementation(() => {
    return [
      {
        date: '2025-08-15',
        count: 1,
        neos: [
          {
            id: '123456',
            name: 'Test Asteroid 1',
            hazardous: true,
            avgDiameterKm: 1,
            nearestApproach: {
              datetime: '2025-Aug-15 12:34',
              epoch: 1755555555000,
              velocityKps: 15.123,
              missDistanceKm: 1234567.89,
              orbitingBody: 'Earth'
            },
            approachesCount: 1,
            nasaUrl: 'https://ssd.jpl.nasa.gov/test1'
          }
        ]
      },
      {
        date: '2025-08-16',
        count: 1,
        neos: [
          {
            id: '234567',
            name: 'Test Asteroid 2',
            hazardous: false,
            avgDiameterKm: 0.5,
            nearestApproach: {
              datetime: '2025-Aug-16 08:15',
              epoch: 1755630000000,
              velocityKps: 20.456,
              missDistanceKm: 3456789.01,
              orbitingBody: 'Earth'
            },
            approachesCount: 1,
            nasaUrl: 'https://ssd.jpl.nasa.gov/test2'
          }
        ]
      }
    ];
  })
}));

// Mock environment variables
vi.stubEnv('NASA_API_KEY', 'DEMO_KEY');

describe('NEOs API Route', () => {
  beforeEach(() => {
    // Clear any mocks between tests
    vi.clearAllMocks();
  });

  it('should return 400 for invalid date parameters', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/neos?start_date=invalid&end_date=2025-08-16')
    );
    
    const response = await GET(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('Invalid parameters');
  });

  it('should return normalized NEO data for valid parameters', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/neos?start_date=2025-08-15&end_date=2025-08-16')
    );
    
    const response = await GET(request);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveLength(2);
    expect(data[0].date).toBe('2025-08-15');
    expect(data[1].date).toBe('2025-08-16');
  });

  it('should apply hazardous filter when specified', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/neos?start_date=2025-08-15&end_date=2025-08-16&hazardous=true')
    );
    
    await GET(request);
    
    // Check that normalizeNeoData was called with hazardous=true
    const { normalizeNeoData } = await import('@/lib/nasa');
    expect(normalizeNeoData).toHaveBeenCalledWith(expect.anything(), true, expect.anything());
  });

  it('should apply sort order when specified', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/neos?start_date=2025-08-15&end_date=2025-08-16&sort=approach_desc')
    );
    
    await GET(request);
    
    // Check that normalizeNeoData was called with sort=approach_desc
    const { normalizeNeoData } = await import('@/lib/nasa');
    expect(normalizeNeoData).toHaveBeenCalledWith(expect.anything(), expect.anything(), 'approach_desc');
  });

  it('should use cache for repeated requests with same parameters', async () => {
    const url = 'http://localhost:3000/api/neos?start_date=2025-08-15&end_date=2025-08-16';
    
    // First request
    const request1 = new NextRequest(new URL(url));
    await GET(request1);
    
    // Second request with same parameters
    const request2 = new NextRequest(new URL(url));
    await GET(request2);
    
    // fetchNeoFeed should only be called once
    const { fetchNeoFeed } = await import('@/lib/nasa');
    expect(fetchNeoFeed).toHaveBeenCalledTimes(1);
  });
});
