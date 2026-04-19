import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockOrder, mockFrom } = vi.hoisted(() => {
  const order = vi.fn();
  const select = vi.fn(() => ({ order }));
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

import Organizations from './Organizations';

describe('Organizations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders organizations loaded from supabase', async () => {
    mockOrder.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          name: 'Food Bank Partners',
          description: 'Food support and distribution',
          phone_number: '555-1234',
          email: 'food@example.org',
          location: 'Moscow',
          events: [{ id: 11 }],
        },
      ],
      error: null,
    });

    render(<Organizations />);

    await waitFor(() => {
      expect(screen.getByText('Food Bank Partners')).toBeInTheDocument();
      expect(screen.getByText('1 active event')).toBeInTheDocument();
    });
  });

  it('filters organizations by search term', async () => {
    mockOrder.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          name: 'Food Bank Partners',
          description: 'Food support and distribution',
          phone_number: '',
          email: '',
          location: 'Moscow',
          events: [],
        },
        {
          id: 2,
          name: 'Health Outreach',
          description: 'Health education events',
          phone_number: '',
          email: '',
          location: 'Pullman',
          events: [],
        },
      ],
      error: null,
    });

    const user = userEvent.setup();

    render(<Organizations />);

    await waitFor(() => {
      expect(screen.getByText('Food Bank Partners')).toBeInTheDocument();
      expect(screen.getByText('Health Outreach')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Search by organization name...'), 'health');

    expect(screen.queryByText('Food Bank Partners')).not.toBeInTheDocument();
    expect(screen.getByText('Health Outreach')).toBeInTheDocument();
  });
});
