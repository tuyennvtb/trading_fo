/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getNewsByID } from '../Redux/actions/news';
import renderHTML from 'react-render-html';
import 'hover.css/css/hover-min.css';

class Promotion extends React.Component {
  async componentDidMount() {
    const { actions } = this.props;
    await actions.getNewsByID(1);
  }
  renderPromotion = () => {
    const { promotionContent } = this.props;
    if (promotionContent) {
      return renderHTML(promotionContent);
    } else {
      return null;
    }
  };
  render() {
    return this.renderPromotion();
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ news }) {
  const promotionContent = (news && news.htmlContent) || null;
  return {
    promotionContent: promotionContent,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getNewsByID }, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Promotion);
