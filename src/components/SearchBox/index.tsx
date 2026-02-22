import { useState } from 'react';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import type { Talk } from '../../types/talks';
import { getSuggestions, Suggestion } from '../../utils/Autocomplete';

interface SearchBoxProps {
  talks: Talk[];
}

export function SearchBox({ talks }: SearchBoxProps) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { updateFilter } = useUrlFilter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Get last word being typed for suggestions
    const words = newValue.split(/\s+/);
    const lastWord = words[words.length - 1];

    const newSuggestions = getSuggestions(talks, lastWord, 10);
    setSuggestions(newSuggestions);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Append suggestion to current value with space
    const words = value.split(/\s+/);
    words[words.length - 1] = suggestion.value;
    const newValue = words.join(' ');

    setValue(newValue);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter({ query: value.trim() });
    setSuggestions([]);
  };

  const getSuggestionIcon = (type: 'speaker' | 'topic'): string => {
    return type === 'speaker' ? '👤' : '🏷️';
  };

  return (
    <form onSubmit={handleSubmit} className="relative" data-testid="search-form">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full border rounded px-3 py-2"
        placeholder="Search in titles, speakers, topics, notes..."
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 max-h-40 overflow-auto">
          {suggestions.map(s => (
            <li key={`${s.type}-${s.value}`}>
              <button
                type="button"
                className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                onClick={() => handleSuggestionClick(s)}
              >
                {getSuggestionIcon(s.type)} {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
