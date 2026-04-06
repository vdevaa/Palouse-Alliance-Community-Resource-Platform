import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventCalendar from './EventCalendar';

describe('EventCalendar', () => {
  const calendarDays = [
    new Date('2026-04-01T00:00:00'),
    new Date('2026-04-02T00:00:00'),
    new Date('2026-04-03T00:00:00'),
  ];

  const defaultProps = {
    calendarDays,
    eventCountByDate: {
      '2026-04-01': 1,
      '2026-04-03': 2,
    },
    getDateKey: (date) => date.toISOString().slice(0, 10),
    handleMonthChange: vi.fn(),
    handleSelectDay: vi.fn(),
    isSameDay: (a, b) => a.toDateString() === b.toDateString(),
    monthLabel: 'April 2026',
    resetDateFilter: vi.fn(),
    selectedDate: new Date('2026-04-01T00:00:00'),
    selectedDateCount: 1,
    formatFullDate: () => 'April 1, 2026',
    visibleMonth: new Date('2026-04-01T00:00:00'),
  };

  it('renders month label and weekdays', () => {
    render(<EventCalendar {...defaultProps} />);

    expect(screen.getByText('April 2026')).toBeInTheDocument();
    expect(screen.getByText('SUN')).toBeInTheDocument();
    expect(screen.getByText('MON')).toBeInTheDocument();
  });

  it('triggers month navigation and day selection', async () => {
    const user = userEvent.setup();
    render(<EventCalendar {...defaultProps} />);

    await user.click(screen.getByLabelText('Previous month'));
    await user.click(screen.getByLabelText('Next month'));

    expect(defaultProps.handleMonthChange).toHaveBeenCalledWith(-1);
    expect(defaultProps.handleMonthChange).toHaveBeenCalledWith(1);

    const dayButton = screen.getByRole('button', { name: '2' });
    await user.click(dayButton);

    expect(defaultProps.handleSelectDay).toHaveBeenCalled();
  });

  it('shows reset action when a day is selected', async () => {
    const user = userEvent.setup();
    render(<EventCalendar {...defaultProps} />);

    const resetButton = screen.getByRole('button', { name: 'View All Dates' });
    await user.click(resetButton);

    expect(defaultProps.resetDateFilter).toHaveBeenCalled();
  });
});
