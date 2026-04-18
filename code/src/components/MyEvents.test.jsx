import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const { mockOrder, mockFrom } = vi.hoisted(() => {
  const order = vi.fn();
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return {
    mockOrder: order,
    mockFrom: from,
  };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

import MyEvents from './MyEvents';

describe('MyEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state when user has no events', async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    render(
      <MemoryRouter>
        <MyEvents
          session={{ user: { id: 'member-1' } }}
          formatCompactDate={() => 'Apr 1'}
          formatTimeRange={() => '10:00 - 11:00'}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Submitted Events Yet')).toBeInTheDocument();
    });
  });

  it('groups pending and approved events', async () => {
    mockOrder.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: 'Pending Event',
          start_datetime: '2026-04-01T10:00:00',
          end_datetime: '2026-04-01T11:00:00',
          status: 'pending',
          organizations: { name: 'Org A' },
          event_tags: [{ tags: { name: 'Community' } }],
        },
        {
          id: 2,
          title: 'Approved Event',
          start_datetime: '2026-04-02T10:00:00',
          end_datetime: '2026-04-02T11:00:00',
          status: 'approved',
          organizations: { name: 'Org B' },
          event_tags: [{ tags: { name: 'Youth' } }],
        },
      ],
      error: null,
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MyEvents
          session={{ user: { id: 'member-1' } }}
          formatCompactDate={() => 'Apr 1'}
          formatTimeRange={() => '10:00 - 11:00'}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pending Event')).toBeInTheDocument();
      expect(screen.getByText('Approved Event')).toBeInTheDocument();
      expect(screen.getByText('Community')).toBeInTheDocument();
      expect(screen.getByText('Youth')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Pending Events/i }));
    expect(screen.queryByText('Pending Event')).not.toBeInTheDocument();
  });
});
