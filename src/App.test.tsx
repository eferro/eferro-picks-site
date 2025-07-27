import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

vi.mock('./components/TalksList', () => ({
  TalksList: () => <div data-testid="talks-list" />
}));
vi.mock('./components/TalkDetail', () => ({
  TalkDetail: () => <div data-testid="talk-detail" />
}));
vi.mock('./components/BackToTopButton', () => ({
  BackToTopButton: () => <div data-testid="back-to-top" />
}));

describe('App layout', () => {
  it('includes the BackToTopButton component', () => {
    render(<App />);
    expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
  });
});
