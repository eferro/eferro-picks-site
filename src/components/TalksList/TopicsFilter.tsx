import { useMemo } from 'react';
import { Talk } from '../../types/talks';
import { FilterDropdown, FilterOption } from '../ui/FilterDropdown';

interface TopicsFilterProps {
  talks: Talk[];
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
}

export function TopicsFilter({ talks, selectedTopics, onChange }: TopicsFilterProps) {
  const topicOptions = useMemo((): FilterOption[] => {
    const set = new Set<string>();
    talks.forEach(t => {
      t.topics.forEach(topic => set.add(topic));
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map(topic => ({
        value: topic,
        label: topic
      }));
  }, [talks]);

  return (
    <FilterDropdown
      label="Topics"
      selectedValues={selectedTopics}
      options={topicOptions}
      onChange={onChange}
      allowMultiple={true}
      showClearAll={true}
    />
  );
}