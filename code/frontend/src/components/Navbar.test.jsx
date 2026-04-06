import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { mockNavigate, mockSignOut } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: mockSignOut,
    },
  },
}));

import Navbar from './Navbar';

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ error: null });
  });

  it('shows login/register links when no session exists', () => {
    render(
      <MemoryRouter>
        <Navbar session={null} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
  });

  it('shows dashboard/logout when session exists and logs out', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Navbar session={{ user: { id: '123' } }} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('toggles mobile menu', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Navbar session={null} />
      </MemoryRouter>
    );

    const menuButton = screen.getByLabelText('Open navigation menu');
    await user.click(menuButton);

    expect(screen.getAllByLabelText('Close navigation menu').length).toBeGreaterThan(0);
  });
});
