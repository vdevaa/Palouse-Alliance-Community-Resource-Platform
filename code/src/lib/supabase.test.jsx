import { describe, it, expect, vi } from 'vitest';

const mockCreateClient = vi.fn(() => ({ isClient: true }));

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

const { supabase } = await vi.importActual('./supabase.js');

describe('supabase client setup', () => {
  it('creates a supabase client using environment settings', () => {
    expect(supabase).toEqual({ isClient: true });
    expect(mockCreateClient).toHaveBeenCalled();
  });
});