import { useEffect, useId, useState } from 'react';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import type { Talk } from '../../types/talks';
import { getSuggestions, Suggestion } from '../../utils/Autocomplete';

interface SearchBoxProps {
  talks: Talk[];
}

const MAX_SUGGESTIONS = 10;

/**
 * Search input with speaker/topic suggestions, following the ARIA
 * combobox pattern: arrow keys move through the suggestions, Enter
 * accepts the highlighted one (or searches when none is highlighted)
 * and Escape closes the list.
 */
export function SearchBox({ talks }: SearchBoxProps) {
  const { filter, updateFilter } = useUrlFilter();
  const [value, setValue] = useState(filter.query);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const isOpen = suggestions.length > 0;

  // Keep the input in sync when the query changes outside the search box
  // (e.g. removing the search chip or clicking a topic tag)
  useEffect(() => {
    setValue(filter.query);
  }, [filter.query]);

  const closeSuggestions = () => {
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Suggest for the last word being typed
    const words = newValue.split(/\s+/);
    const lastWord = words[words.length - 1];
    setSuggestions(getSuggestions(talks, lastWord, MAX_SUGGESTIONS));
    setActiveIndex(-1);
  };

  const acceptSuggestion = (suggestion: Suggestion) => {
    const words = value.split(/\s+/);
    words[words.length - 1] = suggestion.value;
    setValue(words.join(' '));
    closeSuggestions();
  };

  const search = () => {
    updateFilter({ query: value.trim() });
    closeSuggestions();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        if (!isOpen) return;
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        if (!isOpen) return;
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          acceptSuggestion(suggestions[activeIndex]);
        } else {
          search();
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          closeSuggestions();
        }
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  const getSuggestionIcon = (type: 'speaker' | 'topic'): string => {
    return type === 'speaker' ? '👤' : '🏷️';
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative" data-testid="search-form">
      <input
        type="text"
        role="combobox"
        aria-label="Search talks"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full border rounded px-3 py-2"
        placeholder="Search in titles, speakers, topics, notes..."
      />
      <ul
        id={listboxId}
        role="listbox"
        aria-label="Suggestions"
        hidden={!isOpen}
        className="absolute z-10 bg-white border w-full mt-1 max-h-40 overflow-auto"
      >
        {suggestions.map((s, index) => (
          <li
            key={`${s.type}-${s.value}`}
            id={optionId(index)}
            role="option"
            aria-selected={index === activeIndex}
            // mousedown keeps focus in the input while choosing
            onMouseDown={e => e.preventDefault()}
            onClick={() => acceptSuggestion(s)}
            className={`block w-full text-left px-3 py-1 cursor-pointer ${
              index === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
          >
            {getSuggestionIcon(s.type)} {s.label}
          </li>
        ))}
      </ul>
    </form>
  );
}
