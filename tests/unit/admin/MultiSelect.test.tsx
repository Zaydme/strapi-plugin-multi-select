import { useState } from 'react';
import { DesignSystemProvider } from '@strapi/design-system';
import { useField } from '@strapi/strapi/admin';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';

import MultiSelect from '../../../admin/src/components/MultiSelect';

vi.mock('@strapi/strapi/admin', () => ({ useField: vi.fn() }));

type SetupOptions = {
  options?: string[];
  value?: unknown;
  min?: number;
  max?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  messages?: Record<string, string>;
};

// useField keeps the value in state so the component sees its own changes
const setup = ({
  options = ['Red:red', 'Green:green', 'Blue:blue'],
  value,
  min,
  max,
  required = false,
  disabled = false,
  error,
  messages = {},
}: SetupOptions = {}) => {
  const onChange = vi.fn();

  vi.mocked(useField).mockImplementation(() => {
    const [current, setCurrent] = useState(value);
    return {
      value: current,
      error,
      initialValue: value,
      rawError: error,
      onChange: (event: { target: { name: string; value: unknown } }) => {
        onChange(event.target);
        setCurrent(event.target.value);
      },
    } as unknown as ReturnType<typeof useField>;
  });

  const user = userEvent.setup();

  render(
    <IntlProvider locale="en" messages={messages} onError={() => {}}>
      <DesignSystemProvider locale="en">
        <MultiSelect
          name="colors"
          label="colors"
          hint=""
          intlLabel={undefined}
          description={undefined}
          placeholder="Pick colors"
          required={required}
          disabled={disabled}
          attribute={{
            type: 'json',
            customField: 'plugin::multi-select.multi-select',
            options,
            min,
            max,
          }}
        />
      </DesignSystemProvider>
    </IntlProvider>
  );

  const lastValue = () => onChange.mock.lastCall?.[0].value;

  return { user, onChange, lastValue };
};

const tags = () =>
  screen
    .queryAllByRole('button', { name: /^Remove / })
    .map((removeButton) => removeButton.parentElement?.textContent);

const removeButton = (label: string) => screen.getByRole('button', { name: `Remove ${label}` });

// react-select hides its input from the accessibility tree while disabled
const combobox = () => screen.getByRole('combobox', { hidden: true });

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('combobox'));
  return screen.getAllByRole('option');
};

const pick = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await openMenu(user);
  await user.click(screen.getByRole('option', { name: label }));
};

describe('MultiSelect', () => {
  describe('displaying the stored value', () => {
    it('shows stored values as tags, in the order they were saved', () => {
      setup({ value: '["blue","red"]' });

      expect(tags()).toEqual(['Blue', 'Red']);
    });

    it('accepts an already parsed array', () => {
      setup({ value: ['green'] });

      expect(tags()).toEqual(['Green']);
    });

    it('ignores values that are no longer in the options', () => {
      setup({ value: '["red","purple"]' });

      expect(tags()).toEqual(['Red']);
    });

    it('treats invalid JSON as an empty selection', () => {
      setup({ value: 'not json' });

      expect(tags()).toEqual([]);
      expect(screen.getByText('Pick colors')).toBeInTheDocument();
    });

    it('uses the label as the value when none is given and only splits on the first colon', () => {
      setup({ options: ['Apple', 'Time:12:30'], value: '["Apple","12:30"]' });

      expect(tags()).toEqual(['Apple', 'Time']);
    });

    it('translates option labels', async () => {
      const { user } = setup({
        options: ['colors.red:red', 'colors.blue:blue'],
        value: '["red"]',
        messages: { 'colors.red': 'Rouge', 'colors.blue': 'Bleu' },
      });

      expect(tags()).toEqual(['Rouge']);
      const options = await openMenu(user);
      expect(options.map((option) => option.textContent)).toEqual(['Bleu']);
    });
  });

  describe('changing the value', () => {
    it('lists only the options that are not selected yet', async () => {
      const { user } = setup({ value: '["green"]' });

      const options = await openMenu(user);

      expect(options.map((option) => option.textContent)).toEqual(['Red', 'Blue']);
    });

    it('emits the selected values as a JSON string, in selection order', async () => {
      const { user, onChange, lastValue } = setup();

      await pick(user, 'Blue');
      await pick(user, 'Red');

      expect(tags()).toEqual(['Blue', 'Red']);
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'colors' }));
      expect(lastValue()).toBe('["blue","red"]');
    });

    it('stores the value part of "label:value" options', async () => {
      const { user, lastValue } = setup({ options: ['Time:12:30', 'Plain'] });

      await pick(user, 'Time');
      await pick(user, 'Plain');

      expect(lastValue()).toBe('["12:30","Plain"]');
    });

    it('removes a value when its tag is clicked', async () => {
      const { user, lastValue } = setup({ value: '["red","green"]' });

      await user.click(removeButton('Red'));

      expect(tags()).toEqual(['Green']);
      expect(lastValue()).toBe('["green"]');
    });

    it('does not open the menu when a tag is removed', async () => {
      const { user } = setup({ value: '["red","green"]' });

      await user.click(removeButton('Red'));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('labels remove buttons with the translated option label', () => {
      setup({
        options: ['colors.red:red'],
        value: '["red"]',
        messages: {
          'colors.red': 'Rouge',
          'multi-select.multi-select.remove': 'Retirer {label}',
        },
      });

      expect(screen.getByRole('button', { name: 'Retirer Rouge' })).toBeInTheDocument();
    });

    it('emits null once the last value is removed', async () => {
      const { user, onChange } = setup({ value: '["red"]' });

      await user.click(removeButton('Red'));

      expect(tags()).toEqual([]);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.lastCall?.[0].value).toBeNull();
    });
  });

  describe('min and max', () => {
    it('disables the remaining options once max is reached', async () => {
      const { user } = setup({ max: 2, value: '["red","green"]' });

      const [blue] = await openMenu(user);

      expect(blue).toHaveTextContent('Blue');
      expect(blue).toHaveAttribute('aria-disabled', 'true');
    });

    it('keeps options enabled below max', async () => {
      const { user } = setup({ max: 2, value: '["red"]' });

      const options = await openMenu(user);

      options.forEach((option) => expect(option).toHaveAttribute('aria-disabled', 'false'));
    });

    it('stops accepting new values once max is reached', async () => {
      const { user, lastValue } = setup({ max: 1 });

      await pick(user, 'Red');
      await openMenu(user);
      await user.click(screen.getByRole('option', { name: 'Green' }));

      expect(tags()).toEqual(['Red']);
      expect(lastValue()).toBe('["red"]');
    });

    it('shows an error when more than max values are stored', () => {
      setup({ max: 1, value: '["red","green"]' });

      expect(screen.getByText('Select at most 1 options')).toBeInTheDocument();
    });

    it('shows an error when fewer than min values are selected', () => {
      setup({ min: 2, value: '["red"]' });

      expect(screen.getByText('Select at least 2 options')).toBeInTheDocument();
    });

    it('allows an empty optional field even with a min', () => {
      setup({ min: 2 });

      expect(screen.queryByText('Select at least 2 options')).not.toBeInTheDocument();
    });

    it('enforces min on an empty required field', () => {
      setup({ min: 2, required: true });

      expect(screen.getByText('Select at least 2 options')).toBeInTheDocument();
    });

    it('clears the min error once enough values are selected', async () => {
      const { user } = setup({ min: 2, value: '["red"]' });

      await pick(user, 'Blue');

      expect(screen.queryByText('Select at least 2 options')).not.toBeInTheDocument();
    });
  });

  describe('disabled and error states', () => {
    it('is disabled when the content manager disables the field', () => {
      setup({ disabled: true });

      expect(combobox()).toBeDisabled();
    });

    it('is disabled and reports an error when required but no options are configured', () => {
      setup({ options: [], required: true });

      expect(combobox()).toBeDisabled();
      expect(screen.getByText('No options, but field is required')).toBeInTheDocument();
    });

    it('shows the validation error coming from the form first', () => {
      setup({ min: 2, value: '["red"]', error: 'This value is required' });

      expect(screen.getByText('This value is required')).toBeInTheDocument();
      expect(screen.queryByText('Select at least 2 options')).not.toBeInTheDocument();
    });
  });
});
