import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Select, Option } from '@strapi/design-system/Select'
import { useIntl } from 'react-intl'

const MultiSelect = ({
  value,
  onChange,
  name,
  intlLabel,
  required,
  attribute,
  description,
  placeholder,
  disabled,
  error,
}) => {
  const { formatMessage } = useIntl()

  const possibleOptions = useMemo(() => {
    return (attribute['options'] || []).map((option) => {
      const [label, value] = [...option.split(':'), option]
      if (!label || !value) return null
      return { label, value }
    }).filter(Boolean)
  }, [attribute])

  const sanitizedValue = useMemo(() => {
    let parsedValue
    try {
      parsedValue = JSON.parse(value || '[]')
    } catch (e) {
      parsedValue = []
    }
    return Array.isArray(parsedValue)
      ? parsedValue.filter((val) =>
          possibleOptions.some((option) => option.value === val),
        )
      : []
  }, [value, possibleOptions])

  return (
    <Select
      name={name}
      id={name}
      label={formatMessage(intlLabel)}
      error={
        error || (required && !possibleOptions.length ? 'No options' : null)
      }
      disabled={disabled || possibleOptions.length === 0}
      required={required}
      hint={description && formatMessage(description)}
      onChange={(v) => {
        onChange({
          target: {
            name: name,
            value: JSON.stringify(v.filter(Boolean)),
            type: attribute.type,
          },
        })
      }}
      placeholder={placeholder}
      multi
      value={sanitizedValue}
      withTags>
      {possibleOptions.map(({ label, value }) => (
        <Option value={value} key={value}>
          {label}
        </Option>
      ))}
    </Select>
  )
}

MultiSelect.defaultProps = {
  description: null,
  disabled: false,
  error: null,
  labelAction: null,
  required: false,
  value: '',
}

MultiSelect.propTypes = {
  intlLabel: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  attribute: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.object,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  labelAction: PropTypes.object,
  required: PropTypes.bool,
  value: PropTypes.string,
}

export default MultiSelect
