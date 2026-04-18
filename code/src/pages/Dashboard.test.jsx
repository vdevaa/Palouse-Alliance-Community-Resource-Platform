import { render, screen, waitFor } from '@testing-library/react';

const { mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
  },
}));

import Dashboard from './Dashboard';

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows user email when signed in', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { email: 'member@palouse.org' } },
      error: null,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hello, member@palouse.org' })).toBeInTheDocument();
    });
  });

  it('shows error when user is not signed in', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'No user' },
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('You are not signed in.')).toBeInTheDocument();
    });
  });
});
