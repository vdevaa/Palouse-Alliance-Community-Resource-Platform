import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const { mockEventsOrder, mockCategoriesOrder, mockFrom } = vi.hoisted(() => {
    const eventsOrder = vi.fn();
    const eventsEq = vi.fn(() => ({ order: eventsOrder }));
    const eventsSelect = vi.fn(() => ({ eq: eventsEq }));

    const categoriesOrder = vi.fn();
    const categoriesSelect = vi.fn(() => ({ order: categoriesOrder }));

    const from = vi.fn((table) => {
      if (table === 'events') {
        return { select: eventsSelect };
      }

      if (table === 'categories') {
        return { select: categoriesSelect };
      }

      return { select: vi.fn() };
    });

    return {
      mockEventsOrder: eventsOrder,
      mockCategoriesOrder: categoriesOrder,
      mockFrom: from,
    };
  });

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

import Home from './Home';

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders approved events and categories from supabase', async () => {
    mockEventsOrder.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: 'Food Drive',
          description: 'Collect canned foods',
          start_datetime: '2026-04-01T10:00:00',
          end_datetime: '2026-04-01T11:00:00',
          location: 'Downtown',
          status: 'approved',
          organizations: { name: 'Org A' },
          categories: { name: 'Food' },
        },
      ],
      error: null,
    });

    mockCategoriesOrder.mockResolvedValueOnce({
      data: [{ name: 'Food' }, { name: 'Health' }],
      error: null,
    });

    render(<Home session={null} />);

    await waitFor(() => {
      expect(screen.getByText('Food Drive')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Food' })).toBeInTheDocument();
    });
  });

  it('filters events by search query', async () => {
    mockEventsOrder.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: 'Food Drive',
          description: 'Collect canned foods',
          start_datetime: '2026-04-01T10:00:00',
          end_datetime: '2026-04-01T11:00:00',
          location: 'Downtown',
          status: 'approved',
          organizations: { name: 'Org A' },
          categories: { name: 'Food' },
        },
        {
          id: 2,
          title: 'Tech Workshop',
          description: 'Coding for youth',
          start_datetime: '2026-04-02T10:00:00',
          end_datetime: '2026-04-02T11:00:00',
          location: 'Library',
          status: 'approved',
          organizations: { name: 'Org B' },
          categories: { name: 'Technology' },
        },
      ],
      error: null,
    });

    mockCategoriesOrder.mockResolvedValueOnce({
      data: [{ name: 'Food' }, { name: 'Technology' }],
      error: null,
    });

    const user = userEvent.setup();
    render(<Home session={null} />);

    await waitFor(() => {
      expect(screen.getByText('Food Drive')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View All Dates' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'View All Dates' }));

    await user.type(
      screen.getByPlaceholderText('Search events by title, organization, location, or keyword...'),
      'tech'
    );

    expect(screen.queryByText('Food Drive')).not.toBeInTheDocument();
    expect(screen.getByText('Tech Workshop')).toBeInTheDocument();
  });

  it('shows a success flash message passed through router state', async () => {
    mockEventsOrder.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    mockCategoriesOrder.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/events',
            state: {
              flashMessage: 'Your event request was successfully sent and is now pending review.',
            },
          },
        ]}
      >
        <Routes>
          <Route path="/events" element={<Home session={null} />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText('Your event request was successfully sent and is now pending review.')
    ).toBeInTheDocument();
  });
});
