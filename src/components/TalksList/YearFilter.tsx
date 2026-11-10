import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Talk } from '../../types/talks'
import { classNames } from '../../utils/classNames'

export type YearFilterType = 'specific' | 'before' | 'after' | 'last2' | 'last5';

export interface YearFilterData {
  type: YearFilterType;
  year?: number;
}

interface YearFilterProps {
  talks: Talk[];
  selectedFilter: YearFilterData | null;
  onFilterChange: (filter: YearFilterData | null) => void;
}

const isSameFilter = (a: YearFilterData | null, b: YearFilterData | null) =>
  a?.type === b?.type && a?.year === b?.year;

export function YearFilter({ talks, selectedFilter, onFilterChange }: YearFilterProps) {
  // Get unique years from talks, sorted in descending order
  const availableYears = [...new Set(talks
    .map(talk => talk.year)
    .filter((year): year is number => year !== undefined)
  )].sort((a, b) => b - a);

  const currentYear = new Date().getFullYear();

  const presetGroups: { label: string; filter: YearFilterData | null }[][] = [
    [
      { label: 'All Years', filter: null },
      { label: 'Last 2 Years', filter: { type: 'last2' } },
      { label: 'Last 5 Years', filter: { type: 'last5' } },
    ],
    [
      { label: `After ${currentYear - 5}`, filter: { type: 'after', year: currentYear - 5 } },
      { label: `Before ${currentYear - 5}`, filter: { type: 'before', year: currentYear - 5 } },
    ],
  ];

  const getFilterLabel = (filter: YearFilterData | null) => {
    if (!filter) return 'Filter by Year';
    switch (filter.type) {
      case 'specific':
        return `Year: ${filter.year}`;
      case 'before':
        return `Before ${filter.year}`;
      case 'after':
        return `After ${filter.year}`;
      case 'last2':
        return 'Last 2 Years';
      case 'last5':
        return 'Last 5 Years';
      default:
        return 'Filter by Year';
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 min-w-0">
          <span className="truncate">{getFilterLabel(selectedFilter)}</span>
          <ChevronDownIcon className="-mr-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
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
        <Menu.Items className="absolute left-0 z-50 mt-2 w-48 sm:w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {presetGroups.map((group, groupIndex) => (
            <div className="py-1" key={groupIndex}>
              {group.map(({ label, filter }) => {
                const selected = isSameFilter(filter, selectedFilter);
                return (
                  <Menu.Item key={label}>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={() => onFilterChange(filter)}
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block w-full px-4 py-2 text-left text-sm'
                        )}
                      >
                        {label}
                        {/* Headless UI forces role="menuitem": announce selection in the name */}
                        {selected && <span className="sr-only">, selected</span>}
                      </button>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          ))}

          <div className="py-1">
            <Menu.Item>
              <div className="px-4 py-2">
                <div className="text-xs font-semibold text-gray-500 mb-2">Specific Year</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => onFilterChange({ type: 'specific', year })}
                      aria-pressed={selectedFilter?.type === 'specific' && selectedFilter.year === year}
                      className={classNames(
                        selectedFilter?.type === 'specific' && selectedFilter.year === year
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100',
                        'px-2 py-1 text-sm rounded-md'
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 