import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { VideoCameraIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

interface FormatFilterProps {
  selectedFormats: string[];
  onChange: (formats: string[]) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function FormatFilter({ selectedFormats, onChange }: FormatFilterProps) {
  const toggle = (fmt: string) => {
    const newFormats = selectedFormats.includes(fmt)
      ? selectedFormats.filter(f => f !== fmt)
      : [...selectedFormats, fmt];
    onChange(newFormats);
  };

  const clear = () => onChange([]);

  const getButtonLabel = () => {
    const count = selectedFormats.length;
    
    if (count === 0) {
      return 'Format';
    } else if (count === 1) {
      const format = selectedFormats[0];
      return `Format: ${format === 'talk' ? 'Talks' : 'Podcasts'}`;
    } else {
      return `Formats (${count})`;
    }
  };

  const isSelected = (format: string) => selectedFormats.includes(format);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {getButtonLabel()}
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  onClick={clear}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex w-full items-center px-4 py-2 text-sm'
                  )}
                >
                  <span className="flex-1">Any</span>
                  {selectedFormats.length === 0 && (
                    <span className="text-blue-600">✓</span>
                  )}
                </button>
              )}
            </Menu.Item>
            
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  onClick={() => toggle('talk')}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex w-full items-center px-4 py-2 text-sm'
                  )}
                >
                  <VideoCameraIcon className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                  <span className="flex-1">Talks</span>
                  {isSelected('talk') && (
                    <span className="text-blue-600">✓</span>
                  )}
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  onClick={() => toggle('podcast')}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex w-full items-center px-4 py-2 text-sm'
                  )}
                >
                  <MicrophoneIcon className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                  <span className="flex-1">Podcasts</span>
                  {isSelected('podcast') && (
                    <span className="text-blue-600">✓</span>
                  )}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
