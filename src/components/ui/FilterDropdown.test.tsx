import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ComponentProps } from 'react';
import { FilterDropdown, FilterOption } from './FilterDropdown';

const options: FilterOption[] = [
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' }
];

const renderDropdown = (props: Partial<ComponentProps<typeof FilterDropdown>> = {}) => {
  const onChange = vi.fn<(values: string[]) => void>();
  render(
    <FilterDropdown label="Topics" selectedValues={[]} options={options} onChange={onChange} {...props} />
  );
  return { onChange };
};

/** Menu option by its visible label, whether or not it is announced as selected */
const option = (label: string) => screen.getByRole('menuitem', { name: new RegExp(`^${label}(\\s*, selected)?$`) });
const expectSelected = (label: string, selected: boolean) =>
  expect(option(label)).toHaveAccessibleName(selected ? new RegExp(`^${label}\\s*, selected$`) : label);

// Headless UI opens the menu through an async transition
const openMenu = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button'));
  });
};

describe('FilterDropdown', () => {
  describe('trigger label', () => {
    it.each<[string, string[], boolean, string]>([
      ['nothing is selected', [], false, 'Topics'],
      ['one option is selected', ['react'], false, 'Topics: React'],
      ['several options are selected', ['react', 'typescript'], true, 'Topics (2)'],
    ])('shows the right label when %s', (_case, selectedValues, allowMultiple, expected) => {
      renderDropdown({ selectedValues, allowMultiple });

      expect(screen.getByRole('button')).toHaveTextContent(expected);
    });
  });

  describe('single selection', () => {
    it('selects the clicked option', async () => {
      const { onChange } = renderDropdown();
      await openMenu();

      fireEvent.click(option('React'));

      expect(onChange).toHaveBeenCalledWith(['react']);
    });

    it('deselects the option when it is clicked again', async () => {
      const { onChange } = renderDropdown({ selectedValues: ['react'] });
      await openMenu();

      fireEvent.click(option('React'));

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('announces which option is selected', async () => {
      renderDropdown({ selectedValues: ['typescript'] });
      await openMenu();

      expectSelected('TypeScript', true);
      expectSelected('React', false);
    });
  });

  describe('multiple selection', () => {
    it('adds an unselected option to the selection', async () => {
      const { onChange } = renderDropdown({ allowMultiple: true, selectedValues: ['react'] });
      await openMenu();

      fireEvent.click(option('TypeScript'));

      expect(onChange).toHaveBeenCalledWith(['react', 'typescript']);
    });

    it('removes a selected option from the selection', async () => {
      const { onChange } = renderDropdown({ allowMultiple: true, selectedValues: ['react', 'typescript'] });
      await openMenu();

      fireEvent.click(option('React'));

      expect(onChange).toHaveBeenCalledWith(['typescript']);
    });

    it('announces every selected option', async () => {
      renderDropdown({ allowMultiple: true, selectedValues: ['react', 'javascript'] });
      await openMenu();

      expectSelected('React', true);
      expectSelected('TypeScript', false);
      expectSelected('JavaScript', true);
    });

    it('clears the selection with Clear All', async () => {
      const { onChange } = renderDropdown({ allowMultiple: true, showClearAll: true, selectedValues: ['react'] });
      await openMenu();

      fireEvent.click(screen.getByRole('menuitem', { name: 'Clear All' }));

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('hides Clear All when nothing is selected', async () => {
      renderDropdown({ allowMultiple: true, showClearAll: true, selectedValues: [] });
      await openMenu();

      expect(screen.queryByRole('menuitem', { name: 'Clear All' })).not.toBeInTheDocument();
    });
  });

  describe('"Any" option', () => {
    it('clears the selection', async () => {
      const { onChange } = renderDropdown({ showAnyOption: true, selectedValues: ['react'] });
      await openMenu();

      fireEvent.click(option('Any'));

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it.each<[string, string[], boolean]>([
      ['nothing is selected', [], true],
      ['an option is selected', ['react'], false],
    ])('is announced as selected only when %s', async (_case, selectedValues, checked) => {
      renderDropdown({ showAnyOption: true, selectedValues });
      await openMenu();

      expectSelected('Any', checked);
    });
  });

  it('can be opened and used with the keyboard', async () => {
    const { onChange } = renderDropdown();
    const trigger = screen.getByRole('button');

    await act(async () => {
      fireEvent.keyDown(trigger, { key: 'Enter' });
    });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' });
    });

    expect(onChange).toHaveBeenCalledWith(['typescript']);
  });
});
