import { Fragment, useMemo } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Talk } from '../../types/talks';
import { classNames } from '../../utils/classNames';

interface TopicsFilterProps {
  talks: Talk[];
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
}

export function TopicsFilter({ talks, selectedTopics, onChange }: TopicsFilterProps) {
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    talks.forEach(t => {
      t.topics.forEach(topic => set.add(topic));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [talks]);

  const toggleTopic = (topic: string) => {
    const isSelected = selectedTopics.includes(topic);
    const newTopics = isSelected
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic];
    onChange(newTopics);
  };

  const label = selectedTopics.length > 0 ? `Topics (${selectedTopics.length})` : 'Topics';

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {label}
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
        <Menu.Items className="absolute left-0 z-50 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto">
          <div className="py-1">
            {availableTopics.map(topic => (
              <Menu.Item key={topic}>
                {({ active }: { active: boolean }) => (
                  <button
                    onClick={() => toggleTopic(topic)}
                    className={classNames(
                      selectedTopics.includes(topic)
                        ? 'bg-blue-100 text-blue-800'
                        : active
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700',
                      'block w-full px-4 py-2 text-left text-sm'
                    )}
                  >
                    {topic}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
          {selectedTopics.length > 0 && (
            <div className="py-1">
              <Menu.Item>
                {({ active }: { active: boolean }) => (
                  <button
                    onClick={() => onChange([])}
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block w-full px-4 py-2 text-left text-sm'
                    )}
                  >
                    Clear All
                  </button>
                )}
              </Menu.Item>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
