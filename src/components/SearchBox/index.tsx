import { useMemo, useState } from 'react';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import type { Talk } from '../../types/talks';
import { Autocomplete } from '../../utils/Autocomplete';
import { parseSearch } from '../../utils/SearchParser';

interface SearchBoxProps {
  talks: Talk[];
}

export function SearchBox({ talks }: SearchBoxProps) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { filter, updateFilter } = useUrlFilter();
  const ac = useMemo(() => new Autocomplete(talks), [talks]);

  const updateSuggestions = (text: string) => {
    const parts = text.split(/\s+/);
    const last = parts[parts.length - 1];
    if (last.toLowerCase().startsWith('author:')) {
      setSuggestions(ac.autocompleteSpeakers(last.slice('author:'.length)));
    } else if (last.toLowerCase().startsWith('topic:')) {
      setSuggestions(ac.autocompleteTopics(last.slice('topic:'.length)));
    } else {
      setSuggestions([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    updateSuggestions(newValue);
  };

  const handleSuggestionClick = (s: string) => {
    const parts = value.split(/\s+/);
    const last = parts[parts.length - 1];
    if (last.toLowerCase().startsWith('author:')) {
      parts[parts.length - 1] = 'author:' + s;
    } else if (last.toLowerCase().startsWith('topic:')) {
      parts[parts.length - 1] = 'topic:' + s;
    }
    const newValue = parts.join(' ');
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
    const parsed = parseSearch(value);
    updateFilter({
      author: parsed.author,
      topics: parsed.topics,
      query: parsed.query,
    });
    setSuggestions([]);
  };

  return (
    <form onSubmit={handleSubmit} className="relative" data-testid="search-form">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full border rounded px-3 py-2"
        placeholder="Search (author:Kent Beck topic:XP topic:Software Design)"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 max-h-40 overflow-auto">
          {suggestions.map(s => (
            <li key={s}>
              <button
                type="button"
                className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                onClick={() => handleSuggestionClick(s)}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
