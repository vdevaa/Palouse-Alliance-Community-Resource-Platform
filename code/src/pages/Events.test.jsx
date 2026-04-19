import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const { mockEventsOrder, mockCategoriesOrder, mockTagsOrder, mockFrom } = vi.hoisted(() => {
    const eventsOrder = vi.fn();
    const eventsEq = vi.fn(() => ({ order: eventsOrder }));
    const eventsSelect = vi.fn(() => ({ eq: eventsEq, order: eventsOrder, in: vi.fn(() => ({ order: eventsOrder })) }));

    const categoriesOrder = vi.fn();
    const categoriesSelect = vi.fn(() => ({ order: categoriesOrder, in: vi.fn(() => ({ order: categoriesOrder })) }));

    const tagsOrder = vi.fn();
    const tagsSelect = vi.fn(() => ({ order: tagsOrder, in: vi.fn(() => ({ order: tagsOrder })) }));

    const select = vi.fn(() => ({ eq: eventsEq, order: eventsOrder, in: vi.fn(() => ({ order: eventsOrder })) }));

    const from = vi.fn((table) => {
      if (table === 'events') {
        return { select: eventsSelect };
      }

      if (table === 'categories') {
        return { select: categoriesSelect };
      }

      if (table === 'tags') {
        return { select: tagsSelect };
      }

      if (table === 'event_tags') {
        return { select };
      }

      return { select: vi.fn(() => ({ order: vi.fn(), in: vi.fn(() => ({ order: vi.fn() })) })) };
    });

    return {
      mockEventsOrder: eventsOrder,
      mockCategoriesOrder: categoriesOrder,
      mockTagsOrder: tagsOrder,
      mockFrom: from,
    };
  });

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

import Events from './Events';

function renderEvents(session = null) {
  return render(
    <MemoryRouter>
      <Events session={session} />
    </MemoryRouter>
  );
}

describe('Events', () => {
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
          event_tags: [{ tags: { name: 'Community' } }],
        },
      ],
      error: null,
    });

    mockCategoriesOrder.mockResolvedValueOnce({
      data: [{ name: 'Food' }, { name: 'Health' }],
      error: null,
    });

    mockTagsOrder.mockResolvedValueOnce({
      data: [{ name: 'Community' }],
      error: null,
    });

    const user = userEvent.setup();
    renderEvents();

    await waitFor(() => {
      expect(screen.getByText('Food Drive')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Categories' }));
    expect(screen.getByRole('button', { name: 'Food' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tags' }));
    expect(screen.getByRole('button', { name: 'Community' })).toBeInTheDocument();
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
          event_tags: [{ tags: { name: 'Community' } }],
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
          event_tags: [{ tags: { name: 'Youth' } }],
        },
      ],
      error: null,
    });

    mockCategoriesOrder.mockResolvedValueOnce({
      data: [{ name: 'Food' }, { name: 'Technology' }],
      error: null,
    });

    mockTagsOrder.mockResolvedValueOnce({
      data: [{ name: 'Community' }, { name: 'Youth' }],
      error: null,
    });

    const user = userEvent.setup();
    renderEvents();

    await waitFor(() => {
      expect(screen.getByText('Food Drive')).toBeInTheDocument();
    });

    const dayOneButtons = screen.getAllByRole('button', { name: '1' });
    const currentMonthDayButton = dayOneButtons.find(
      (button) => !button.className.includes('outside-month')
    );
    await user.click(currentMonthDayButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'View All Dates' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'View All Dates' }));

    await user.type(
      screen.getByPlaceholderText('Search events by title or keywords...'),
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

    mockTagsOrder.mockResolvedValueOnce({
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
          <Route path="/events" element={<Events session={null} />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText('Your event request was successfully sent and is now pending review.')
    ).toBeInTheDocument();
  });

  it('initializes search bar from the query string when navigating from organizations', async () => {
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
          organizations: { name: 'Org B' },
          categories: { name: 'Food' },
          event_tags: [{ tags: { name: 'Community' } }],
        },
      ],
      error: null,
    });

    mockCategoriesOrder.mockResolvedValueOnce({
      data: [{ name: 'Food' }],
      error: null,
    });

    mockTagsOrder.mockResolvedValueOnce({
      data: [{ name: 'Community' }],
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/events?q=Org%20B"]}>
        <Routes>
          <Route path="/events" element={<Events session={null} />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue('Org B')).toBeInTheDocument();
    expect(await screen.findByText('Food Drive')).toBeInTheDocument();
  });

  it('opens the post event popup from the events page', async () => {
    mockEventsOrder.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    mockCategoriesOrder.mockResolvedValueOnce({
      data: [{ name: 'Food' }],
      error: null,
    });

    mockTagsOrder.mockResolvedValueOnce({
      data: [{ name: 'Community' }],
      error: null,
    });

    mockCategoriesOrder.mockResolvedValueOnce({
      data: [{ id: 'cat-1', name: 'Community Events' }],
      error: null,
    });

    mockTagsOrder.mockResolvedValueOnce({
      data: [{ id: 'tag-1', name: 'Community' }],
      error: null,
    });

    const user = userEvent.setup();
    renderEvents({ user: { id: 'user-1' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Post Event' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Post Event' }));

    expect(await screen.findByRole('heading', { name: /Post a Community Event/i })).toBeInTheDocument();
  });
});
