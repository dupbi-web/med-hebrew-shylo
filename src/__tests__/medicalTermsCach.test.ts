import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBodyOrgansWords, getCategories } from '../cache/medicalTermsCache';
import { supabase } from '@/integrations/supabase/client';
import { openDB } from 'idb';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => {
  const mockEq = vi.fn();
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return {
    supabase: { from: mockFrom },
  };
});

//  Mock IndexedDB (idb)
vi.mock('idb', () => ({
  openDB: vi.fn(() => ({
    put: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    createObjectStore: vi.fn(),
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getBodyOrgansWords', () => {
  it('returns words successfully', async () => {
  const eqMock = vi.fn().mockResolvedValue({
    data: [{ id: 1, en: 'heart', he: 'לב' }],
    error: null,
  });

  supabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({ eq: eqMock }),
  });

  const result = await getBodyOrgansWords();

  expect(result).toEqual([{ id: 1, en: 'heart', he: 'לב' }]);
});

  it("handles Supabase errors gracefully", async () => {
  supabase.from = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: new Error("Test Supabase error")
      })
    }))
  }));

  const result = await getBodyOrgansWords();
  expect(result).toEqual([]); // or whatever fallback your function uses
});

describe('getCategories', () => {
  it('fetches and returns categories', async () => {
    const eqMock = vi.fn().mockResolvedValue({
    data: [{ id: 1, en: 'heart', he: 'לב' }],
    error: null,
  });

  supabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({ eq: eqMock }),
  });

  const result = await getBodyOrgansWords();

  expect(result).toEqual([{ id: 1, en: 'heart', he: 'לב' }]);
});


  it('throws when Supabase fails', async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        data: null,
        error: { message: 'Fetch failed' },
      }),
    });

    await expect(getCategories()).rejects.toThrow('Failed to fetch categories');
  });
  }); 
});