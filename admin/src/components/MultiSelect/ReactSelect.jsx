import { Box } from '@strapi/design-system';
import Select from 'react-select';
import styled, { useTheme} from 'styled-components';

const ReactSelect = ({
  components,
  styles,
  error,
  ariaErrorMessage,
  ...props
}) => {
  const theme = useTheme();
  const customStyles = getSelectStyles(theme, error);
  return (
    <Select
      menuPosition="fixed"
      components={{
        ClearIndicator,
        DropdownIndicator,
        IndicatorSeparator: () => null,
        LoadingIndicator: () => null,
        ...components,
      }}
      aria-errormessage={error && ariaErrorMessage}
      aria-invalid={!!error}
      styles={{ ...customStyles, ...styles }}
      {...props}
    />
  );
};

const IconBox = styled(Box)`
  background: transparent;
  border: none;
  position: relative;
  z-index: 1;

  svg {
    height: ${11 / 16}rem;
    width: ${11 / 16}rem;
  }

  svg path {
    fill: ${({ theme }) => theme.colors.neutral600};
  }
`;

const ClearIndicator = (props) => { };

const CarretBox = styled(IconBox)`
  display: flex;
  background: none;
  border: none;

  svg {
    width: ${9 / 16}rem;
  }
`;

const DropdownIndicator = ({ innerProps }) => { };

const getSelectStyles = (theme, error) => { };

export { ReactSelect };
