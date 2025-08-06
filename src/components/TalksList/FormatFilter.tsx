import { VideoCameraIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { FilterDropdown, FilterOption } from '../ui/FilterDropdown';

interface FormatFilterProps {
  selectedFormats: string[];
  onChange: (formats: string[]) => void;
}

const formatOptions: FilterOption[] = [
  {
    value: 'talk',
    label: 'Talks',
    icon: <VideoCameraIcon />
  },
  {
    value: 'podcast',
    label: 'Podcasts', 
    icon: <MicrophoneIcon />
  }
];

export function FormatFilter({ selectedFormats, onChange }: FormatFilterProps) {
  return (
    <FilterDropdown
      label="Format"
      selectedValues={selectedFormats}
      options={formatOptions}
      onChange={onChange}
      allowMultiple={true}
      showAnyOption={true}
    />
  );
}