import Select from 'react-select';
import styled from 'styled-components';

const ReactSelect = ({ components, styles, error, ariaErrorMessage, ...props }: any) => {
  return (
    <Select
      menuPosition="fixed"
      components={{
        IndicatorSeparator: () => null,
        LoadingIndicator: () => null,
        ...components,
      }}
      aria-errormessage={error && ariaErrorMessage}
      aria-invalid={!!error}
      styles={{ ...styles }}
      {...props}
    />
  );
};

const StyledReactSelect = styled(ReactSelect)`
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

    & [aria-disabled='true'] {
      background: ${({ theme }) => theme.colors.neutral150};
      border: 1px solid ${({ theme }) => theme.colors.neutral200};
    }
  }
  .select-menu {
    background: ${({ theme }) => theme.colors.neutral0};

    .option-focused {
      background: ${({ theme }) => theme.colors.neutral200};
    }
  }
`;

export default StyledReactSelect;
