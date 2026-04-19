import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { mockNavigate, mockGetSession, mockUsersMaybeSingle } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGetSession: vi.fn(),
  mockUsersMaybeSingle: vi.fn(),
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
      getSession: mockGetSession,
    },
    from: (table) => {
      if (table === 'users') {
        return {
          select: () => ({ eq: () => ({ maybeSingle: mockUsersMaybeSingle }) }),
        };
      }

      if (table === 'organizations') {
        return {
          select: () => ({ order: async () => ({ data: [{ id: 'org-1', name: 'Org 1' }], error: null }) }),
        };
      }

      return {};
    },
  },
}));

import Register from './Register';

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // default: user is admin
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'uid-1' } } } });
    mockUsersMaybeSingle.mockResolvedValue({ data: { role: 'admin' }, error: null });
  });

  it('redirects to /login when not signed in', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects to /dashboard when user is not admin', async () => {
    mockUsersMaybeSingle.mockResolvedValueOnce({ data: { role: 'member' }, error: null });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('submits registration and navigates on success', async () => {
    // mock successful backend response
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'new-user' }) });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // wait for orgs to load and form to render
    await waitFor(() => expect(screen.getByLabelText(/email address/i)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.selectOptions(screen.getByLabelText(/organization/i), 'org-1');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
