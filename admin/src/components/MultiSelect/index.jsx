import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  Tag,
  Field,
  Flex,
} from '@strapi/design-system'
import { Cross } from '@strapi/icons'
import { ReactSelect } from './ReactSelect'
import { useField } from '@strapi/strapi/admin';

import { useIntl } from 'react-intl'
import styled from 'styled-components'

const CustomMultiValueContainer = (props) => {
  const { selectProps } = props
  const handleTagClick = (value) => (e) => {
    e.preventDefault()
    selectProps.onChange(selectProps.value.filter((v) => v !== value))
  }
  return (
    <Tag
      type="button"
      tabIndex={-1}
      icon={<Cross />}
      onClick={handleTagClick(props.data)}>
      {props.data.label}
    </Tag>
  )
}

const StyleSelect = styled(ReactSelect)`
  .select-control {
    height: auto;
    background: ${({ theme }) => theme.colors.neutral0};
    border: 1px solid ${({ theme }) => theme.colors.neutral200};

    & > div:first-child {
      padding: 4px;
      gap: 4px;

      & > div {
        padding-left: 8px;
      }
    }

    .select-multi-value-container {
      margin-right: -8px;
    }
  }
  .select-menu {
    background: ${({ theme }) => theme.colors.neutral0};

    .option-focused {
      background: ${({ theme }) => theme.colors.neutral200};
    }
  }
`

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
} = {
  intlLabel: {id: '', defaultMessage: ''},
  attribute: {},
  hint: '',
  label: '',
  name: '',
  description: null,
  placeholder: '',
  disabled: false,
  required: false,
}) => {
  const { formatMessage } = useIntl()
  const { onChange, value, error } = useField(name);

  const possibleOptions = useMemo(() => {
    return (attribute['options'] || [])
      .map((option) => {
        const [label, value] = [...option.split(/:(.*)/s), option]
        if (!label || !value) return null
        return { label, value }
      })
      .filter(Boolean)
  }, [attribute])

  const sanitizedValue = useMemo(() => {
    let parsedValue
    try {
      parsedValue = typeof value !== 'string' ? value : JSON.parse(value || '[]')
    } catch (e) {
      parsedValue = []
    }
    return Array.isArray(parsedValue)
      ? possibleOptions.filter((option) =>
          parsedValue.some((val) => option.value === val),
        )
      : []
  }, [value, possibleOptions]);

  const fieldError = useMemo(() => {
    return error || (required && !possibleOptions.length ? 'No options' : null)
  }, [required, error, possibleOptions])

  return (
    <Field.Root
      hint={description?.id ? formatMessage(description) : hint}
      error={fieldError}
      name={name}
      required={required}>
      <Flex direction="column" alignItems="stretch" gap={1}>
        <Field.Label>{intlLabel?.id ? formatMessage(intlLabel) : label}</Field.Label>
        <StyleSelect
          isSearchable={true}
          isMulti={true}
          error={fieldError}
          name={name}
          id={name}
          isDisabled={disabled || possibleOptions.length === 0}
          placeholder={placeholder}
          defaultValue={sanitizedValue.map((val) => ({
            label: formatMessage({
              id: val.label,
              defaultMessage: val.label,
            }),
            value: val.value,
          }))}
          components={{
            MultiValueContainer: CustomMultiValueContainer,
          }}
          options={possibleOptions.map((option) => ({
            ...option,
            label: formatMessage({
              id: option.label,
              defaultMessage: option.label,
            }),
          }))}
          onChange={(val) => {
            onChange({
              target: {
                name: name,
                value:
                  val?.length && val.filter((v) => !!v)
                    ? JSON.stringify(val.filter((v) => !!v).map((v) => v.value))
                    : null,
                type: attribute.type,
              },
            })
          }}
          classNames={{
            control: (_state) => 'select-control',
            multiValue: (_state) => 'select-multi-value',
            placeholder: (_state) => 'select-placeholder',
            menuList: (_state) => 'select-listbox',
            menu: (_state) => 'select-menu',
            option: (state) => state.isFocused ? 'option-focused': 'option'
          }}
        />
        <Field.Hint />
        <Field.Error />
      </Flex>
    </Field.Root>
  )
}

MultiSelect.propTypes = {
  intlLabel: PropTypes.object,
  attribute: PropTypes.object.isRequired,
  hint: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.object,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  labelAction: PropTypes.object,
  required: PropTypes.bool,
  value: PropTypes.string,
}

export default MultiSelect
