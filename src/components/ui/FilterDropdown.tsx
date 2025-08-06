import { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { classNames } from '../../utils/classNames';

export interface FilterOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface FilterDropdownProps {
  label: string;
  selectedValues: string[];
  options: FilterOption[];
  onChange: (values: string[]) => void;
  allowMultiple?: boolean;
  showClearAll?: boolean;
  showAnyOption?: boolean;
  className?: string;
  maxHeight?: string;
}

export function FilterDropdown({
  label,
  selectedValues,
  options,
  onChange,
  allowMultiple = false,
  showClearAll = false,
  showAnyOption = false,
  className = '',
  maxHeight = 'max-h-60'
}: FilterDropdownProps) {
  const toggle = (value: string) => {
    if (allowMultiple) {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onChange(newValues);
    } else {
      onChange(selectedValues.includes(value) ? [] : [value]);
    }
  };

  const clear = () => onChange([]);

  const getButtonLabel = () => {
    const count = selectedValues.length;
    
    if (count === 0) {
      return label;
    } else if (count === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return `${label}: ${option?.label || selectedValues[0]}`;
    } else {
      return `${label} (${count})`;
    }
  };

  const isSelected = (value: string) => selectedValues.includes(value);

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
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
        <Menu.Items className={`absolute left-0 z-50 mt-2 w-56 origin-top-left ${allowMultiple ? 'divide-y divide-gray-100' : ''} rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${maxHeight} overflow-y-auto`}>
          <div className="py-1">
            {showAnyOption && (
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
                    {selectedValues.length === 0 && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </button>
                )}
              </Menu.Item>
            )}

            {options.map(option => (
              <Menu.Item key={option.value}>
                {({ active }: { active: boolean }) => (
                  <button
                    onClick={() => toggle(option.value)}
                    className={classNames(
                      isSelected(option.value)
                        ? 'bg-blue-100 text-blue-800'
                        : active
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700',
                      'group flex w-full items-center px-4 py-2 text-sm'
                    )}
                  >
                    {option.icon && (
                      <span className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true">
                        {option.icon}
                      </span>
                    )}
                    <span className="flex-1 text-left">{option.label}</span>
                    {isSelected(option.value) && !allowMultiple && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>

          {allowMultiple && showClearAll && selectedValues.length > 0 && (
            <div className="py-1">
              <Menu.Item>
                {({ active }: { active: boolean }) => (
                  <button
                    onClick={clear}
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