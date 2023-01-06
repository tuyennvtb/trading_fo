/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';
import { Cookies } from 'react-cookie';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import router from '../router';
import history from '../history';
import AppRenderer from './AppRenderer';
import { forceLogOut } from '../Redux/actions/user';
import LoadStyle from '../LoadStyle';

type Render = (Array<React.Element<*>>, ?Object, ? Object) => any;

type State = {
  location: Location,
  params: Object,
  template: String,
  variables: Object,
  components: ?Array<React.Element<*>> | Promise<Array<React.Element<*>>>,
  render: ?Render,
  currentRole: String,
};

class App extends React.Component<any, any, State> {
  state = {
    location: history.location,
    params: {},
    template: 'normal',
    variables: {},
    components: null,
    render: null,
    currentRole: 'guest',
  };

  static propTypes = {
    user: PropTypes.object,
    actions: PropTypes.shape({
      forceLogOut: PropTypes.func.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    user: null,
  };

  constructor(props) {
    super(props);
    this.resolveRoute = this.resolveRoute.bind(this);
  }
  unlisten: () => void;

  componentDidMount() {
    // Start watching for changes in the URL (window.location)
    this.unlisten = history.listen(this.resolveRoute);
    this.resolveRoute(history.location);

    // Clear local storage
    localStorage.removeItem('list_icon');
  }

  componentWillUnmount() {
    this.unlisten();
  }

  resolveRoute = (location: Location) =>
    // Find the route that matches the provided URL path and query string
    router
      .resolve({ path: location.pathname, user: this.props.user })
      .then(route => {
        if (route.redirect) {
          history.push(route.redirect);
        }
        if (route.currentRole === 'member') {
          const cookies = new Cookies();
          // force user logout in case the cookie has been expired
          if (!cookies.get('uid_btm_token')) {
            const { actions } = this.props;
            actions.forceLogOut();
            return false;
          }
        }
        const variables = isEqual(this.state.variables, route.variables)
          ? this.state.variables
          : route.variables;
        this.setState({ ...route, location, variables });
      });

  render() {
    return (
      <React.Fragment>
        <LoadStyle location={this.state.location} />
        <AppRenderer
          template={this.state.template}
          location={this.state.location}
          params={this.state.params}
          components={this.state.components}
          render={this.state.render}
          variables={this.state.variables}
        />
      </React.Fragment>
    );
  }
}

// A hook that makes it possible to pre-render the app during compilation.
// Fore more information visit https://github.com/kriasoft/pre-render
window.prerender = async path => {
  history.push(path);
  // TODO: Detect when client-side rendering is complete
  await new Promise(resolve => setTimeout(resolve, 500));
  return document.documentElement.outerHTML
    .replace(/<link type="text\/css" rel="stylesheet" href="blob:.*?>/g, '')
    .replace(/<script .*?<\/head>/g, '</head>');
};
// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ user }) {
  return { user };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ forceLogOut }, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
