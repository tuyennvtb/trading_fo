import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

export default (props) => {
  const { _onChangeIcoin, options, selected, name } = props;

  const customFilter = (option, searchText) => {
    if (
      option.data.coin_code.toLowerCase().includes(searchText.toLowerCase()) ||
      option.data.coin_id.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <div className="right no-padding">
      <div className="btn-group">
        <Select
          className="react-select"
          name={name}
          options={options}
          onChange={_onChangeIcoin}
          value={selected}
          isClearable={0}
          filterOption={customFilter}
        />
      </div>
    </div>
  );
}