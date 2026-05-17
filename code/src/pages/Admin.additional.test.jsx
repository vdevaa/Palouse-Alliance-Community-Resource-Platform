import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockFrom } = vi.hoisted(() => {
  const mockEventsOrder = vi.fn(async () => ({
    data: [
      {
        id: 'event-1',
        title: 'Pending Event',
        description: 'Ready for review',
        start_datetime: '2026-04-15T10:00:00',
        end_datetime: '2026-04-15T12:00:00',
        status: 'pending',
        location: 'City Park',
        organizations: { name: 'Org A' },
        categories: { name: 'Community' },
        event_tags: [{ tag_id: 'tag-1' }],
      },
    ],
    error: null,
  }));

  const mockEventsSelect = vi.fn(() => ({ order: mockEventsOrder }));
  const mockTagsOrder = vi.fn(async () => ({ data: [{ id: 'tag-1', name: 'Outdoors' }], error: null }));
  const mockTagsSelect = vi.fn(() => ({ order: mockTagsOrder }));

  const mockFrom = vi.fn((table) => {
    if (table === 'events') {
      return { select: mockEventsSelect };
    }
    if (table === 'tags') {
      return { select: mockTagsSelect };
    }
    return { select: vi.fn(() => ({ order: vi.fn(async () => ({ data: [], error: null })) })) };
  });

  return { mockFrom };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' }, access_token: 'test-access-token' } } }),
    },
    from: mockFrom,
  },
}));

import Admin from './Admin';

describe('Admin page interactions', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens organization, user, and event management popups', async () => {
    fetchMock.mockImplementation(async (url) => {
      if (url.toString().endsWith('/api/organizations')) {
        return { ok: true, json: async () => [{ id: 'org-1', name: 'Org 1' }] };
      }
      if (url.toString().endsWith('/api/users')) {
        return {
          ok: true,
          json: async () => [
            { id: 'user-1', email: 'user@example.com', role: 'member', organization_id: 'org-1' },
          ],
        };
      }
      return { ok: true, json: async () => [] };
    });

    const user = userEvent.setup();
    render(<Admin session={{ user: { id: 'user-1' } }} />);

    await user.click(screen.getByRole('button', { name: /Manage Organizations/i }));
    const orgDialog = await screen.findByRole('dialog', { name: /Manage Organizations/i });

    await waitFor(() => {
      expect(within(orgDialog).getByRole('heading', { name: /Manage Organizations/i })).toBeInTheDocument();
    });
    expect(within(orgDialog).getByText('Org 1')).toBeInTheDocument();

    await user.click(within(orgDialog).getByRole('button', { name: /Close popup/i }));

    await user.click(screen.getByRole('button', { name: /Register Organization/i }));
    const registerOrgDialog = await screen.findByRole('dialog', { name: /Register Organization/i });

    await waitFor(() => {
      expect(within(registerOrgDialog).getByRole('heading', { name: /Register Organization/i })).toBeInTheDocument();
    });
    await user.click(within(registerOrgDialog).getByRole('button', { name: /^Cancel$/i }));

    await user.click(screen.getByRole('button', { name: /Register User/i }));
    const registerUserDialog = await screen.findByRole('dialog', { name: /Register User/i });

    await waitFor(() => {
      expect(within(registerUserDialog).getByRole('heading', { name: /Register User/i })).toBeInTheDocument();
    });
    await user.click(within(registerUserDialog).getByRole('button', { name: /^Cancel$/i }));

    await user.click(screen.getByRole('button', { name: /Manage Users/i }));
    const manageUsersDialog = await screen.findByRole('dialog', { name: /Manage Users/i });

    await waitFor(() => {
      expect(within(manageUsersDialog).getByRole('heading', { name: /Manage Users/i })).toBeInTheDocument();
    });
    expect(within(manageUsersDialog).getByText('user@example.com')).toBeInTheDocument();
    await user.click(within(manageUsersDialog).getByRole('button', { name: /^Close$/i }));

    await user.click(screen.getByRole('button', { name: /Manage Events/i }));
    const manageEventsDialog = await screen.findByRole('dialog', { name: /Manage Events/i });

    await waitFor(() => {
      expect(within(manageEventsDialog).getByRole('heading', { name: /Manage Events/i })).toBeInTheDocument();
    });
    await user.click(within(manageEventsDialog).getByRole('button', { name: /Pending Events/i }));
    expect(within(manageEventsDialog).getByText(/Pending Event/i)).toBeInTheDocument();
  });
});