import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

// Mock the AdGenerator component since it uses browser APIs and complex logic
vi.mock('../components/AdGenerator', () => ({
  default: () => <div data-testid="ad-generator">Ad Generator Component</div>
}));

describe('Home Page', () => {
  it('renders the AdGenerator component', () => {
    render(<Home />);
    const element = screen.getByTestId('ad-generator');
    expect(element).toBeInTheDocument();
  });
});
