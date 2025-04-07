import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TalkDetail } from './index';
import { useTalks } from '../../hooks/useTalks';
import { useSearchParams, useParams } from 'react-router-dom';
import { renderWithRouter, mockSearchParams, mockSetSearchParams } from '../../test/utils';

// Mock the hooks
vi.mock('../../hooks/useTalks');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useSearchParams: vi.fn()
  };
});

describe('TalkDetail', () => {
  const mockTalk = {
    id: '1',
    title: 'Test Talk',
    speakers: ['Test Speaker 1', 'Test Speaker 2'],
    conference_name: 'Test Conference',
    duration: 3600,
    topics: ['test'],
    core_topic: 'test',
    url: 'https://example.com',
    description: 'Test description',
    notes: 'Test notes',
    year: 2023
  };

  beforeEach(() => {
    (useTalks as any).mockImplementation(() => ({
      talks: [mockTalk],
      loading: false,
      error: null
    }));

    (useParams as any).mockImplementation(() => ({ id: '1' }));
    
    // Reset mocks before each test
    mockSearchParams.get.mockReset();
    mockSearchParams.toString.mockReset();
    mockSetSearchParams.mockReset();
    
    // Default mock implementation
    mockSearchParams.get.mockImplementation(() => null);
    mockSearchParams.toString.mockImplementation(() => '');
    
    (useSearchParams as any).mockImplementation(() => [mockSearchParams, mockSetSearchParams]);
  });

  const renderComponent = () => renderWithRouter(<TalkDetail />);

  it('renders the talk details', () => {
    renderComponent();
    
    expect(screen.getByText('Test Talk')).toBeInTheDocument();
    expect(screen.getByText('Test Speaker 1')).toBeInTheDocument();
    expect(screen.getByText('Test Speaker 2')).toBeInTheDocument();
    expect(screen.getByText('1h 0m')).toBeInTheDocument();
    expect(screen.getByText('Test Conference')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Key Notes')).toBeInTheDocument();
    expect(screen.getByText('Test notes')).toBeInTheDocument();
  });

  describe('Author Filter', () => {
    it('sets author filter when clicking on a speaker', () => {
      renderComponent();
      
      const speakerButton = screen.getByText('Test Speaker 1');
      fireEvent.click(speakerButton);
      
      expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams));
      const params = mockSetSearchParams.mock.calls[0][0];
      expect(params.get('author')).toBe('Test Speaker 1');
    });

    it('removes author filter when clicking on the same speaker', () => {
      // Create a URLSearchParams object with initial state
      const initialParams = new URLSearchParams();
      initialParams.set('author', 'Test Speaker 1');
      
      // Mock the initial state
      mockSearchParams.get.mockImplementation(param => initialParams.get(param));
      mockSearchParams.toString.mockImplementation(() => initialParams.toString());
      
      renderComponent();
      
      const speakerButton = screen.getByText('Test Speaker 1');
      fireEvent.click(speakerButton);
      
      expect(mockSetSearchParams).toHaveBeenCalled();
      const [[params]] = mockSetSearchParams.mock.calls;
      const newParams = new URLSearchParams(params);
      expect(newParams.get('author')).toBeNull();
    });

    it('applies selected styling to the active speaker', () => {
      mockSearchParams.get.mockImplementation(param => param === 'author' ? 'Test Speaker 1' : null);
      renderComponent();
      
      const speakerButton = screen.getByText('Test Speaker 1');
      expect(speakerButton).toHaveClass('bg-blue-500', 'text-white');
    });
  });

  describe('Navigation', () => {
    it('preserves search params when navigating back', () => {
      mockSearchParams.toString.mockImplementation(() => 'author=Test%20Speaker%201');
      renderComponent();
      
      const backLink = screen.getByText('Back to Talks');
      expect(backLink).toHaveAttribute('href', '/?author=Test%20Speaker%201');
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state', () => {
      (useTalks as any).mockImplementation(() => ({
        talks: [],
        loading: true,
        error: null
      }));
      
      renderComponent();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows error state', () => {
      (useTalks as any).mockImplementation(() => ({
        talks: [],
        loading: false,
        error: new Error('Test error')
      }));
      
      renderComponent();
      expect(screen.getByText('Error loading talk details')).toBeInTheDocument();
    });

    it('shows not found state', () => {
      (useTalks as any).mockImplementation(() => ({
        talks: [],
        loading: false,
        error: null
      }));
      
      renderComponent();
      expect(screen.getByText('Talk not found')).toBeInTheDocument();
    });
  });
}); 