import React, { useMemo } from 'react';
import { Field, Flex } from '@strapi/design-system';
import ReactSelect from './ReactSelect';
import { useField } from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';
import MultiValueContainer from './MultiValueContainer';

const MultiSelect = ({
  hint,
  label,
  name,
  intlLabel,
  required,
  attribute,
  description,
  placeholder,
  disabled,
}: {
  hint: string;
  label: string;
  name: string;
  intlLabel: any;
  required: boolean;
  attribute: any;
  description: any;
  placeholder: string;
  disabled: boolean;
}) => {
  const { formatMessage } = useIntl();
  const { onChange, value, error } = useField(name);

  const possibleOptions = useMemo(() => {
    return (attribute['options'] || [])
      .map((option: string) => {
        const [label, value] = [...option.split(/:(.*)/s), option];
        if (!label || !value) return null;
        return { label, value };
      })
      .filter(Boolean);
  }, [attribute]);

  const sanitizedValue = useMemo(() => {
    let parsedValue;
    try {
      parsedValue = typeof value !== 'string' ? value || [] : JSON.parse(value || '[]');
    } catch (e) {
      parsedValue = [];
    }
    return Array.isArray(parsedValue)
      ? possibleOptions.filter((option: { label: string; value: string }) =>
          parsedValue.some((val) => option.value === val)
        )
      : [];
  }, [value, possibleOptions]);

  const fieldError = useMemo(() => {
    return error ?? (required && !possibleOptions.length ? 'No options' : null);
  }, [required, error, possibleOptions]);

  return (
    <Field.Root
      hint={description?.id ? formatMessage(description) : hint}
      error={fieldError as string}
      name={name}
      required={required}
    >
      <Flex direction="column" alignItems="stretch" gap={1}>
        <Field.Label>{intlLabel?.id ? formatMessage(intlLabel) : label}</Field.Label>
        <ReactSelect
          isSearchable={true}
          isMulti={true}
          error={fieldError}
          name={name}
          id={name}
          isDisabled={disabled || possibleOptions.length === 0}
          placeholder={placeholder}
          defaultValue={sanitizedValue.map((val: { label: string; value: string }) => ({
            label: formatMessage({
              id: val.label,
              defaultMessage: val.label,
            }),
            value: val.value,
          }))}
          components={{
            MultiValueContainer,
          }}
          options={possibleOptions.map((option: { label: string; value: string }) => ({
            ...option,
            label: formatMessage({
              id: option.label,
              defaultMessage: option.label,
            }),
          }))}
          onChange={(val: any) => {
            onChange({
              target: {
                name: name,
                value:
                  val?.length && val.filter((v: any) => !!v)
                    ? JSON.stringify(val.filter((v: any) => !!v).map((v: any) => v.value))
                    : null,
                type: attribute.type,
              },
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          classNames={{
            control: (_state: any) => 'select-control',
            multiValue: (_state: any) => 'select-multi-value',
            placeholder: (_state: any) => 'select-placeholder',
            menuList: (_state: any) => 'select-listbox',
            menu: (_state: any) => 'select-menu',
            option: (state: any) => (state.isFocused ? 'option-focused' : 'option'),
          }}
        />
        <Field.Hint />
        <Field.Error />
      </Flex>
    </Field.Root>
  );
};

export default MultiSelect;
