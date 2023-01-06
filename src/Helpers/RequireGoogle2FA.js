/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';

export default function(ComposedComponent) {
  class Authentication extends React.Component {
    render() {
      return (
        <ComposedComponent {...this.props}/>
      );
    }
  }
  return Authentication;
}

