import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

const { mockGetSession, mockFrom, mockStorageFrom, mockUpload, mockEventsInsert } = vi.hoisted(() => {
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
  const mockEventsInsert = vi.fn((payload) => ({
    select: mockEventInsertSelect,
    payload,
  }));
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
  const mockUpload = vi.fn(async () => ({ data: { path: 'flyers/test.png' }, error: null }));
  const mockRemove = vi.fn(async () => ({ data: [], error: null }));
  const mockStorageFrom = vi.fn(() => ({
    upload: mockUpload,
    remove: mockRemove,
    getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/flyers/test.png' } })),
  }));

  return {
    mockGetSession,
    mockFrom,
    mockStorageFrom,
    mockUpload,
    mockEventsInsert,
  };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
    },
    from: mockFrom,
    storage: {
      from: mockStorageFrom,
    },
  },
  getEventFlyerUrl: (flyerPath) => (flyerPath ? `https://example.com/${flyerPath}` : null),
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

  it('uploads a flyer before inserting the event record', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: { id: 'user-1' } } }, error: null });
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: { id: 'user-1' } } }, error: null });

    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<PostEventForm onSuccess={onSuccess} onClose={onClose} />);

    await user.type(screen.getByLabelText(/event title/i), 'Neighborhood Fair');
    await user.type(screen.getByLabelText(/event description/i), 'Outdoor market and local vendors.');
    await user.click(screen.getByRole('button', { name: /Continue to Category/ }));
    await user.click(screen.getByRole('button', { name: /Continue to Date/ }));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2);

    await user.type(screen.getByLabelText(/event start/i), formatLocalDateTime(startDate));
    await user.type(screen.getByLabelText(/event end/i), formatLocalDateTime(endDate));
    await user.type(screen.getByLabelText(/physical location/i), 'Town Square');
    await user.click(screen.getByRole('button', { name: /Continue to Flyer Upload/ }));

    const file = new File(['pdf-content'], 'flyer.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload flyer image/i).closest('div')?.querySelector('input') || screen.getByLabelText(/upload flyer image/i);
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: /Submit for Review/ }));

    await waitFor(() => {
      expect(mockStorageFrom).toHaveBeenCalledWith('event-flyers');
      expect(mockUpload).toHaveBeenCalledTimes(1);
      expect(mockEventsInsert).toHaveBeenCalled();
    });

    const insertArgs = mockEventsInsert.mock.calls[0][0]?.[0] || mockEventsInsert.mock.calls[0][0];
    expect(insertArgs).toMatchObject({ flyer_path: expect.any(String) });
    expect(insertArgs.flyer_path).toContain('.pdf');
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('rejects flyers above 2 MB or unsupported file types before upload', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: { id: 'user-1' } } }, error: null });
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: { id: 'user-1' } } }, error: null });

    const user = userEvent.setup();
    render(<PostEventForm onSuccess={vi.fn()} onClose={vi.fn()} />);

    await user.type(screen.getByLabelText(/event title/i), 'Bad Flyer Event');
    await user.type(screen.getByLabelText(/event description/i), 'This event should fail file validation.');
    await user.click(screen.getByRole('button', { name: /Continue to Category/ }));
    await user.click(screen.getByRole('button', { name: /Continue to Date/ }));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2);

    await user.type(screen.getByLabelText(/event start/i), formatLocalDateTime(startDate));
    await user.type(screen.getByLabelText(/event end/i), formatLocalDateTime(endDate));
    await user.type(screen.getByLabelText(/physical location/i), 'Event Hall');
    await user.click(screen.getByRole('button', { name: /Continue to Flyer Upload/ }));

    const badType = new File(['content'], 'flyer.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload flyer image/i).closest('div')?.querySelector('input') || screen.getByLabelText(/upload flyer image/i);
    await user.upload(input, badType);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/pdf, png, jpg, or jpeg/i);
    });
    expect(mockUpload).not.toHaveBeenCalled();

    const tooLarge = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'oversize.pdf', { type: 'application/pdf' });
    await user.upload(input, tooLarge);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/2 MB or smaller/i);
    });
    expect(mockUpload).not.toHaveBeenCalled();
  });
});