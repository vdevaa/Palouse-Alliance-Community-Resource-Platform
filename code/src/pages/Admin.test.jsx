import { render, screen } from '@testing-library/react';

import Admin from './Admin';

describe('Admin', () => {
  it('renders heading', () => {
    render(<Admin />);
    expect(screen.getByRole('heading', { name: 'Admin' })).toBeInTheDocument();
  });
});
