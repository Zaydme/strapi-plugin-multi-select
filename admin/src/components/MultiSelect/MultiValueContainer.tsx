import { Tag } from '@strapi/design-system';
import { Cross } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { getTrad } from '../../utils/getTrad';

export default ({
  selectProps,
  data,
}: {
  selectProps: any;
  data: {
    value: string;
    label: string;
  };
}) => {
  const { formatMessage } = useIntl();
  const handleTagClick = (data: { value: string; label: string }) => (e: React.UIEvent<any>) => {
    e.preventDefault();
    selectProps.onChange(selectProps.value.filter((v: any) => v !== data));
  };
  return (
    <Tag
      tabIndex={-1}
      icon={<Cross />}
      label={formatMessage(
        { id: getTrad('multi-select.remove'), defaultMessage: 'Remove {label}' },
        { label: data.label }
      )}
      onClick={handleTagClick(data)}
      // react-select opens the menu on mouse down anywhere in the control
      onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {data.label}
    </Tag>
  );
};
