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
    
    // Reset mocks and internal state
    vi.clearAllMocks();
    mockSearchParams._params.clear();
    
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
      
      expect(mockSetSearchParams).toHaveBeenCalled();
      const [[params]] = mockSetSearchParams.mock.calls;
      expect(params.get('author')).toBe('Test Speaker 1');
    });

    it('removes author filter when clicking on the same speaker', () => {
      // Set initial state
      mockSearchParams._params.set('author', 'Test Speaker 1');
      
      renderComponent();
      
      const speakerButton = screen.getByText('Test Speaker 1');
      fireEvent.click(speakerButton);
      
      expect(mockSetSearchParams).toHaveBeenCalled();
      const [[params]] = mockSetSearchParams.mock.calls;
      expect(params.get('author')).toBeNull();
    });

    it('applies selected styling to the active speaker', () => {
      mockSearchParams._params.set('author', 'Test Speaker 1');
      renderComponent();
      
      const speakerButton = screen.getByText('Test Speaker 1');
      expect(speakerButton).toHaveClass('bg-blue-500', 'text-white');
    });
  });

  describe('Conference Filter', () => {
    it('sets conference filter when clicking on a conference', () => {
      renderComponent();
      
      const conferenceButton = screen.getByText('Test Conference');
      fireEvent.click(conferenceButton);
      
      expect(mockSetSearchParams).toHaveBeenCalled();
      const [[params]] = mockSetSearchParams.mock.calls;
      expect(params.get('conference')).toBe('Test Conference');
    });

    it('removes conference filter when clicking on the same conference', () => {
      // Set initial state
      mockSearchParams._params.set('conference', 'Test Conference');
      
      renderComponent();
      
      const conferenceButton = screen.getByText('Test Conference');
      fireEvent.click(conferenceButton);
      
      expect(mockSetSearchParams).toHaveBeenCalled();
      const [[params]] = mockSetSearchParams.mock.calls;
      expect(params.get('conference')).toBeNull();
    });

    it('applies selected styling to the active conference', () => {
      mockSearchParams._params.set('conference', 'Test Conference');
      renderComponent();
      
      const conferenceButton = screen.getByText('Test Conference');
      expect(conferenceButton).toHaveClass('bg-blue-500', 'text-white');
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
      expect(screen.getByText(/Error loading talk/)).toBeInTheDocument();
    });
  });
}); 