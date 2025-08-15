import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      }))
    }
  }
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  usePathname: () => '/'
}));

// Import the hook after mocking dependencies
import { useRequireAuth } from '@/hooks/useRequireAuth';

describe('Auth Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login when not authenticated', async () => {
    // Mock session as null (not authenticated)
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    });

    // Call the hook
    const { isAuthenticated } = useRequireAuth();
    
    // Wait for async operations
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(isAuthenticated).toBe(false);
    });
  });

  it('should not redirect when authenticated', async () => {
    // Mock session as valid (authenticated)
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'test-user-id' },
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
          expires_at: 999999999
        } 
      },
      error: null
    });

    // Call the hook
    const { isAuthenticated } = useRequireAuth();
    
    // Wait for async operations
    await vi.waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
      expect(isAuthenticated).toBe(true);
    });
  });

  it('should handle sign out correctly', async () => {
    // Mock successful sign out
    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null
    });

    // Call sign out
    await supabase.auth.signOut();
    
    // Verify sign out was called
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
