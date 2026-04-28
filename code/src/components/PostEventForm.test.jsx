import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

const { mockGetSession, mockFrom } = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockUsersEq = vi.fn(() => ({
    maybeSingle: async () => ({ data: { organization_id: 'org-1' }, error: null }),
  }));
  const mockUsersSelect = vi.fn(() => ({ eq: mockUsersEq }));
  const mockCategoriesOrder = vi.fn(async () => ({ data: [{ id: 'cat-1', name: 'Education' }], error: null }));
  const mockCategoriesSelect = vi.fn(() => ({ order: mockCategoriesOrder }));
  const mockTagsOrder = vi.fn(async () => ({ data: [{ id: 'tag-1', name: 'Outdoors' }], error: null }));
  const mockTagsSelect = vi.fn(() => ({ order: mockTagsOrder }));
  const mockEventInsertSingle = vi.fn(async () => ({ data: { id: 'event-1' }, error: null }));
  const mockEventInsertSelect = vi.fn(() => ({ single: mockEventInsertSingle }));
  const mockEventsInsert = vi.fn(() => ({ select: mockEventInsertSelect }));
  const mockEventTagsInsert = vi.fn(async () => ({ error: null }));
  const mockFrom = vi.fn((table) => {
    if (table === 'categories') {
      return { select: mockCategoriesSelect };
    }
    if (table === 'tags') {
      return { select: mockTagsSelect };
    }
    if (table === 'users') {
      return { select: mockUsersSelect };
    }
    if (table === 'events') {
      return { insert: mockEventsInsert };
    }
    if (table === 'event_tags') {
      return { insert: mockEventTagsInsert };
    }
    return { select: vi.fn(() => ({ order: vi.fn(async () => ({ data: [], error: null })) })) };
  });

  return {
    mockGetSession,
    mockFrom,
  };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
    },
    from: mockFrom,
  },
}));

import PostEventForm from './PostEventForm';

function formatLocalDateTime(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

describe('PostEventForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits a valid event and notifies success', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: { id: 'user-1' } } }, error: null });
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: { id: 'user-1' } } }, error: null });

    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<PostEventForm onSuccess={onSuccess} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/event title/i), 'Community Yoga');
    await user.type(screen.getByLabelText(/event description/i), 'A gentle outdoor session.');
    await user.click(screen.getByRole('button', { name: /Continue to Category/ }));

    await waitFor(() => {
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Continue to Date/ }));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2);

    await user.type(screen.getByLabelText(/event start/i), formatLocalDateTime(startDate));
    await user.type(screen.getByLabelText(/event end/i), formatLocalDateTime(endDate));
    await user.type(screen.getByLabelText(/physical location/i), 'Community Center');
    await user.type(screen.getByLabelText(/volunteer url/i), 'https://example.com');
    await user.click(screen.getByRole('button', { name: /Continue to Flyer Upload/ }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit for Review/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Submit for Review/ }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});