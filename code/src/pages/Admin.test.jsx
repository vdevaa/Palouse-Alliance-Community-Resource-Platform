import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}));

vi.stubGlobal('fetch', mockFetch);

import Admin from './Admin';

describe('Admin', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard heading', () => {
    render(<Admin />);
    expect(screen.getByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument();
  });

  it('opens register user popup when the button is clicked', async () => {
    render(<Admin />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /register user/i }));

    expect(await screen.findByRole('heading', { name: /register user/i })).toBeInTheDocument();
  });

  it('opens register organization popup when the button is clicked', async () => {
    render(<Admin />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /register organization/i }));

    expect(await screen.findByRole('heading', { name: /register organization/i })).toBeInTheDocument();
  });

  it('opens manage users popup when the button is clicked', async () => {
    render(<Admin />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /manage users/i }));

    expect(await screen.findByRole('heading', { name: /manage users/i })).toBeInTheDocument();
  });
});
