import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { mockNavigate, mockSignInWithPassword } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSignInWithPassword: vi.fn(),
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
      signInWithPassword: mockSignInWithPassword,
    },
  },
}));

import Login from './Login';

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows auth error on failed login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid credentials' },
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email address/i), 'a@example.com');
    await user.type(screen.getByLabelText(/password/i), 'bad-password');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to dashboard on successful login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email address/i), 'a@example.com');
    await user.type(screen.getByLabelText(/password/i), 'good-password');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
