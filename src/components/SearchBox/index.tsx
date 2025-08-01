import { useMemo, useState } from 'react';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import type { Talk } from '../../types/talks';
import { Autocomplete } from '../../utils/Autocomplete';
import { parseSearch } from '../../utils/SearchParser';
import { SearchPrefixParser } from '../../utils/SearchPrefixParser';

interface SearchBoxProps {
  talks: Talk[];
}

export function SearchBox({ talks }: SearchBoxProps) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { updateFilter } = useUrlFilter();
  const ac = useMemo(() => new Autocomplete(talks), [talks]);

  const updateSuggestions = (text: string) => {
    const prefixResult = SearchPrefixParser.parseLastPrefix(text);
    
    if (!prefixResult.hasPrefix) {
      setSuggestions([]);
      return;
    }
    
    switch (prefixResult.type) {
      case 'author':
        setSuggestions(ac.autocompleteSpeakers(prefixResult.value));
        break;
      case 'topic':
        setSuggestions(ac.autocompleteTopics(prefixResult.value));
        break;
      default:
        setSuggestions([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    updateSuggestions(newValue);
  };

  const handleSuggestionClick = (s: string) => {
    const newValue = SearchPrefixParser.replaceSuggestionInText(value, s);
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
