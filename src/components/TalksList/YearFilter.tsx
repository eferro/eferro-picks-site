import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Talk } from '../../types/talks'

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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function YearFilter({ talks, selectedFilter, onFilterChange }: YearFilterProps) {
  // Get unique years from talks, sorted in descending order
  const availableYears = [...new Set(talks
    .map(talk => talk.year)
    .filter((year): year is number => year !== undefined)
  )].sort((a, b) => b - a);

  const currentYear = new Date().getFullYear();

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
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {getFilterLabel(selectedFilter)}
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
        <Menu.Items className="absolute left-0 z-50 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  onClick={() => onFilterChange(null)}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block w-full px-4 py-2 text-left text-sm'
                  )}
                >
                  All Years
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  onClick={() => onFilterChange({ type: 'last2' })}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block w-full px-4 py-2 text-left text-sm'
                  )}
                >
                  Last 2 Years
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  onClick={() => onFilterChange({ type: 'last5' })}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block w-full px-4 py-2 text-left text-sm'
                  )}
                >
                  Last 5 Years
                </button>
              )}
            </Menu.Item>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  onClick={() => onFilterChange({ type: 'after', year: currentYear - 5 })}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block w-full px-4 py-2 text-left text-sm'
                  )}
                >
                  After {currentYear - 5}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  onClick={() => onFilterChange({ type: 'before', year: currentYear - 5 })}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block w-full px-4 py-2 text-left text-sm'
                  )}
                >
                  Before {currentYear - 5}
                </button>
              )}
            </Menu.Item>
          </div>

          <div className="py-1">
            <Menu.Item>
              <div className="px-4 py-2">
                <div className="text-xs font-semibold text-gray-500 mb-2">Specific Year</div>
                <div className="grid grid-cols-3 gap-1">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => onFilterChange({ type: 'specific', year })}
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