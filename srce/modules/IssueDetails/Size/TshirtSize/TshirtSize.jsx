import { Select } from '../../../../components/common';
import { Size, Label } from './Styles';

const ItemSize = {
  XS: { value: 'XS', label: 'Extra Small' },
  S: { value: 'S', label: 'Small' },
  M: { value: 'M', label: 'Medium' },
  L: { value: 'L', label: 'Large' },
  XL: { value: 'XL', label: 'Extra Large' },
};

const TshirtSizeInput = ({ issue, updateIssue }) => (
  <>
    <h3 className="fw-bold mb-1">Size</h3>
    <Select
      variant="empty"
      withClearValue={false}
      dropdownWidth={343}
      name="tsize"
      value={issue.tsize}
      options={Object.values(ItemSize).map(size => ({
        value: size.value,
        label: size.label,
      }))}
      onChange={size => updateIssue({ tsize: size })}
      renderValue={({ value: size }) => renderSizeItem(size, true)}
      renderOption={({ value: size }) => renderSizeItem(size)}
    />
  </>
);

const renderSizeItem = (size, isValue) => {
  const sizeItem = Object.values(ItemSize).find(item => item.value === size);
  return (
    <Size isValue={isValue}>
      <span className="badge badge-light badge-square badge-lg ms-2">{sizeItem.value}</span>
      <Label>{sizeItem.label}</Label>
    </Size>
  );
};

export default TshirtSizeInput;
