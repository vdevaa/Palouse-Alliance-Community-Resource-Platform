import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/supabase', () => ({
  supabase: {},
}));

import PostEvent from './PostEvent';

describe('PostEvent', () => {
  it('completes multi-step flow and shows summary', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PostEvent />
      </MemoryRouter>
    );

    expect(screen.getByText('Step 1: Basic Information')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Event Title'), 'Community Potluck');
    await user.type(screen.getByLabelText('Event Description'), 'Bring a dish to share.');
    await user.click(screen.getByRole('button', { name: 'Continue to Date & Location' }));

    expect(screen.getByText('Step 2: When & Where')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Event Date'), '2026-04-12');
    await user.type(screen.getByLabelText('Event Time'), '4:00 PM - 6:00 PM');
    await user.type(screen.getByLabelText('Location'), 'City Hall');
    await user.click(screen.getByRole('button', { name: 'Continue to Flyer Upload' }));

    expect(screen.getByText('Step 3: Event Flyer (Optional)')).toBeInTheDocument();
    expect(screen.getByText('Event Summary')).toBeInTheDocument();
    expect(screen.getByText(/Community Potluck/)).toBeInTheDocument();
    expect(screen.getByText(/City Hall/)).toBeInTheDocument();
  });
});
