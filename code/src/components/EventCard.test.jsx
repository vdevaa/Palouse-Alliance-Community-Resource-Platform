import { render, screen } from '@testing-library/react';
import EventCard from './EventCard';

describe('EventCard', () => {
  const event = {
    id: 1,
    title: 'Community Cleanup',
    categoryName: 'Community Service',
    organizationName: 'Palouse Helpers',
    description: 'Join us to clean the neighborhood park.',
    startDate: new Date('2026-04-01T10:00:00'),
    endDate: new Date('2026-04-01T12:00:00'),
    location: 'Main Park',
  };

  it('renders core event details', () => {
    render(
      <EventCard
        event={event}
        formatFullDate={(date) => date.toDateString()}
        formatTimeRange={() => '10:00 AM - 12:00 PM'}
      />
    );

    expect(screen.getByText('Community Cleanup')).toBeInTheDocument();
    expect(screen.getByText('Palouse Helpers')).toBeInTheDocument();
    expect(screen.getByText('Join us to clean the neighborhood park.')).toBeInTheDocument();
    expect(screen.getByText('Community Service')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Details' })).toBeInTheDocument();
  });

  it('shows date ranges for multi-day events', () => {
    const multiDayEvent = {
      ...event,
      startDate: new Date('2026-04-01T10:00:00'),
      endDate: new Date('2026-04-02T10:00:00'),
    };

    render(
      <EventCard
        event={multiDayEvent}
        formatFullDate={(date) => date.toDateString()}
        formatTimeRange={() => 'Custom Time'}
      />
    );

    expect(screen.getByText(/Wed Apr 01 2026 - Thu Apr 02 2026/)).toBeInTheDocument();
  });
});
