/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FormattedMessage } from 'react-intl';
import { getCustomerService } from '../Redux/actions/settings';
import { CUSTOMER_SERVICE_TYPE } from '../Helpers/constants/system.js';
import { checkHrefAddress } from '../Helpers/utils.js';

class CustomerService extends React.Component {
  componentDidMount() {
    const { actions } = this.props;
    actions.getCustomerService();
  }

  renderItem = (item) => {
    let data = '';
    switch (item.key.toUpperCase()) {
      case CUSTOMER_SERVICE_TYPE.PHONE:
        data = (
          <h3 key={`phone-${item.value}`}>
            <i className="fa fa-phone padding-right-10"></i> Hotline
            <a href={`tel:${item.value}`}> {item.text}</a>
          </h3>
        );
        break;
      case CUSTOMER_SERVICE_TYPE.FACEBOOK:
        data = (
          <h3 key={`facebook-${item.value}`}>
            <i className="fa fa-facebook padding-right-10"></i>
            <a href={checkHrefAddress(item.value) ? item.value : 'https://' + item.value}> {item.text}</a>
          </h3>
        );
        break;
      case CUSTOMER_SERVICE_TYPE.TELEGRAM:
        data = (
          <h3 key={`telegram-${item.value}`}>
            <i className="fa fa-telegram padding-right-10"></i>
            <a href={checkHrefAddress(item.value) ? item.value : 'https://' + item.value}> {item.text}</a>
          </h3>
        );
        break;
      default:
        break;
    }
    return (
      data && <span className="col-lg-4 col-md-6 col-xs-12">
        {data}
      </span>
    );
  }

  render() {
    return (
      <div className="row">
        {this.props.customerService && this.props.customerService.length > 0 &&
            this.props.customerService.map((item, index) => this.renderItem(item))
        }
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ settings }) {
  const customerService = (settings && settings.customerService) || [];
  return {
    customerService: customerService,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getCustomerService }, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(CustomerService);

