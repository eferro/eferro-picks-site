import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TalkCard } from './TalkCard';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const mockTalk = {
  id: 'test-id',
  title: 'Test Talk Title',
  url: 'https://example.com',
  duration: 3600, // 1 hour
  topics: ['Topic 1', 'Topic 2'],
  speakers: ['Speaker 1'],
  description: 'Test description',
  core_topic: 'Test Core Topic',
  notes: 'Test notes'
};

const mockProps = {
  talk: mockTalk,
  onAuthorClick: vi.fn(),
  selectedAuthor: null,
  onTopicClick: vi.fn(),
  selectedTopics: []
};

// Wrapper component to provide router context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('TalkCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders basic talk information', () => {
    render(<TalkCard {...mockProps} />, { wrapper });
    
    expect(screen.getByText(mockTalk.title)).toBeInTheDocument();
    expect(screen.getByText(mockTalk.speakers[0])).toBeInTheDocument();
    expect(screen.getByText('1h 0m')).toBeInTheDocument();
    expect(screen.getByText(mockTalk.description)).toBeInTheDocument();
  });

  it('shows notes icon when talk has notes', () => {
    render(<TalkCard {...mockProps} />, { wrapper });
    
    expect(screen.getByTitle('This talk has detailed notes')).toBeInTheDocument();
  });

  it('navigates to talk details when card is clicked', async () => {
    const user = userEvent.setup();
    render(<TalkCard {...mockProps} />, { wrapper });
    
    const card = screen.getByText(mockTalk.title).closest('div');
    expect(card).toBeInTheDocument();
    await user.click(card!);
    
    expect(mockNavigate).toHaveBeenCalledWith(`/talk/${mockTalk.id}`);
  });

  it('calls onAuthorClick when speaker button is clicked', async () => {
    const user = userEvent.setup();
    render(<TalkCard {...mockProps} />, { wrapper });
    
    const speakerButton = screen.getByText(mockTalk.speakers[0]);
    await user.click(speakerButton);
    
    expect(mockProps.onAuthorClick).toHaveBeenCalledWith(mockTalk.speakers[0]);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('calls onTopicClick when topic button is clicked', async () => {
    const user = userEvent.setup();
    render(<TalkCard {...mockProps} />, { wrapper });
    
    const topicButton = screen.getByText(mockTalk.topics[0]);
    await user.click(topicButton);
    
    expect(mockProps.onTopicClick).toHaveBeenCalledWith(mockTalk.topics[0]);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('opens external link in new tab when Watch Talk is clicked', async () => {
    const user = userEvent.setup();
    render(<TalkCard {...mockProps} />, { wrapper });
    
    const watchButton = screen.getByText('Watch Talk');
    expect(watchButton.closest('a')).toHaveAttribute('href', mockTalk.url);
    expect(watchButton.closest('a')).toHaveAttribute('target', '_blank');
    
    await user.click(watchButton);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles empty data gracefully', () => {
    const emptyTalk = {
      ...mockTalk,
      description: '',
      topics: [],
      speakers: [],
      duration: 0
    };
    
    render(<TalkCard {...mockProps} talk={emptyTalk} />, { wrapper });
    
    expect(screen.getByText(emptyTalk.title)).toBeInTheDocument();
    expect(screen.getByText('0m')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /speaker/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /topic/i })).not.toBeInTheDocument();
  });

  it('is keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<TalkCard {...mockProps} />, { wrapper });
    
    const card = screen.getByRole('article');
    await user.tab();
    expect(card).toHaveFocus();
    
    // Press Enter to navigate
    await user.keyboard('{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith(`/talk/${mockTalk.id}`);
  });

  it('has proper ARIA attributes', () => {
    render(<TalkCard {...mockProps} />, { wrapper });
    
    // Check main container
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', `Talk: ${mockTalk.title}`);
    
    // Check notes icon wrapper
    const notesIconWrapper = screen.getByRole('img');
    expect(notesIconWrapper).toHaveAttribute('aria-label', 'This talk has detailed notes');
    
    // Check speaker button
    const speakerButton = screen.getByText(mockTalk.speakers[0]);
    expect(speakerButton).toHaveAttribute('aria-label', `Filter by speaker: ${mockTalk.speakers[0]}`);
    
    // Check duration
    const duration = screen.getByText('1h 0m');
    expect(duration).toHaveAttribute('aria-label', 'Duration: 1h 0m');
    
    // Check watch link
    const watchLink = screen.getByText('Watch Talk');
    expect(watchLink).toHaveAttribute('aria-label', `Watch ${mockTalk.title}`);
  });

  it('applies correct styles for selected author and topics', () => {
    const selectedProps = {
      ...mockProps,
      selectedAuthor: mockTalk.speakers[0],
      selectedTopics: [mockTalk.topics[0]]
    };
    
    render(<TalkCard {...selectedProps} />, { wrapper });
    
    // Check selected author button has correct style
    const speakerButton = screen.getByText(mockTalk.speakers[0]);
    expect(speakerButton).toHaveClass('bg-blue-500', 'text-white');
    
    // Check selected topic button has correct style
    const topicButton = screen.getByText(mockTalk.topics[0]);
    expect(topicButton).toHaveClass('bg-gray-700', 'text-white');
    
    // Check unselected topic maintains default style
    const unselectedTopicButton = screen.getByText(mockTalk.topics[1]);
    expect(unselectedTopicButton).toHaveClass('bg-gray-100', 'text-gray-600');
  });

  it('handles long content gracefully', () => {
    const longContentTalk = {
      ...mockTalk,
      title: 'A'.repeat(100),
      description: 'B'.repeat(1000),
      speakers: ['C'.repeat(50)],
      topics: ['D'.repeat(30)]
    };
    
    render(<TalkCard {...mockProps} talk={longContentTalk} />, { wrapper });
    
    // Description should be clamped
    const description = screen.getByText('B'.repeat(1000));
    expect(description).toHaveClass('line-clamp-5');
    
    // All elements should be contained within the card
    const card = screen.getByRole('article');
    const cardRect = card.getBoundingClientRect();
    
    // Check that all content is within card boundaries
    const elements = card.querySelectorAll('*');
    elements.forEach(element => {
      const elementRect = element.getBoundingClientRect();
      expect(elementRect.left).toBeGreaterThanOrEqual(cardRect.left);
      expect(elementRect.right).toBeLessThanOrEqual(cardRect.right);
    });
  });

  it('prevents event propagation on interactive elements', async () => {
    const user = userEvent.setup();
    const handleCardClick = vi.fn();
    
    render(
      <div onClick={handleCardClick}>
        <TalkCard {...mockProps} />
      </div>,
      { wrapper }
    );
    
    // Click speaker button
    await user.click(screen.getByText(mockTalk.speakers[0]));
    expect(handleCardClick).not.toHaveBeenCalled();
    
    // Click topic button
    await user.click(screen.getByText(mockTalk.topics[0]));
    expect(handleCardClick).not.toHaveBeenCalled();
    
    // Click watch link
    await user.click(screen.getByText('Watch Talk'));
    expect(handleCardClick).not.toHaveBeenCalled();
  });

  it('memoizes topic elements correctly', () => {
    const { rerender } = render(<TalkCard {...mockProps} />, { wrapper });
    
    // Get initial topic elements
    const initialTopicElements = screen.getAllByText(/Topic/);
    
    // Rerender with same props
    rerender(<TalkCard {...mockProps} />);
    
    // Get topic elements after rerender
    const rerenderedTopicElements = screen.getAllByText(/Topic/);
    
    // Elements should be the same instances if memoization works
    expect(initialTopicElements).toEqual(rerenderedTopicElements);
    
    // Rerender with different unrelated prop
    rerender(<TalkCard {...mockProps} selectedAuthor="Different Author" />);
    
    // Topic elements should still be the same
    const unchangedTopicElements = screen.getAllByText(/Topic/);
    expect(initialTopicElements).toEqual(unchangedTopicElements);
  });
}); 