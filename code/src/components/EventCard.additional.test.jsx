import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventCard from './EventCard';

describe('EventCard additional behavior', () => {
  it('renders fallback text when dates are invalid and opens the leave site popup', async () => {
    const event = {
      title: 'Broken Event',
      description: 'Invalid date range',
      startDate: 'not-a-date',
      endDate: 'not-a-date',
      location: '',
      volunteer_url: 'https://example.com',
      tags: [],
    };

    render(
      <EventCard event={event} formatFullDate={() => 'N/A'} formatTimeRange={() => 'N/A'} />
    );

    expect(screen.getByText(/Date unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/Location:/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Event Link/i }));
    expect(screen.getByText(/You are about to leave the site/i)).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });
});