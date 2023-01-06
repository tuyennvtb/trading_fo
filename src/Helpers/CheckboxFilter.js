import React from 'react';
import PropTypes from 'prop-types';

class CheckboxFilter extends React.Component {
  constructor(props) {
    super(props);
    this.filter = this.filter.bind(this);
    this.isFiltered = this.isFiltered.bind(this);
  }

  filter(isChecked) {
    this.refs.okCheckbox.checked = isChecked;
    if (isChecked) {
      this.props.filterHandler({ callback: this.isFiltered });
    } else {
      this.props.filterHandler();
    }
  }

  isFiltered(targetValue) {
    if (targetValue > 0) {
      return this.refs.okCheckbox.checked;
    }
  }

  render() {
    return (
      <div style={{ display: 'none' }}>
        <input
          name="okCheckbox"
          ref="okCheckbox"
          type="checkbox"
          className="filter"
          onChange={this.filter}
          defaultChecked={this.props.setDefaultCheck}
        />
        <label htmlFor="okCheckbox">{this.props.textOK}</label>
      </div>
    );
  }
}

CheckboxFilter.propTypes = {
  filterHandler: PropTypes.func.isRequired,
  textOK: PropTypes.string,
};

CheckboxFilter.defaultProps = {
  textOK: 'OK',
};
export default CheckboxFilter;
