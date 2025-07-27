import { VideoCameraIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

interface FormatFilterProps {
  selectedFormats: string[];
  onChange: (formats: string[]) => void;
}

export function FormatFilter({ selectedFormats, onChange }: FormatFilterProps) {
  const toggle = (fmt: string) => {
    const newFormats = selectedFormats.includes(fmt)
      ? selectedFormats.filter(f => f !== fmt)
      : [...selectedFormats, fmt];
    onChange(newFormats);
  };

  return (
    <div className="flex items-center gap-4">
      <label className="inline-flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={selectedFormats.includes('talk')}
          onChange={() => toggle('talk')}
          aria-label="Talks"
        />
        <VideoCameraIcon className="h-4 w-4" aria-hidden="true" /> Talks
      </label>
      <label className="inline-flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={selectedFormats.includes('podcast')}
          onChange={() => toggle('podcast')}
          aria-label="Podcasts"
        />
        <MicrophoneIcon className="h-4 w-4" aria-hidden="true" /> Podcasts
      </label>
    </div>
  );
}
