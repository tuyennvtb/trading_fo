/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';

import AppToolbar from './AppToolbar';
import AppFooter from './AppFooter';
import AppStickyNavBottom from './AppStickyNavBottom';
import ErrorPage from '../ErrorPage';
import Loading from '../Processing/Loading';
import { injectIntl } from 'react-intl';

type Props = {
  error: ?Error,
  location: Location,
  params: Object,
  template: String,
  components: Array<React.Element<*>> | Promise<Array<React.Element<*>>>,
  render: ?(Array<React.Element<*>>, ?Object, ?Object) => any,
};

type State = {
  error: ?Error,
  title: ?string,
  description: ?string,
  keyword: ?string,
  body: ?React.Element<*>,
  path: ?string,
};

const defaults = {
  error: null,
  title: '',
  description: '',
  keywords: '',
  body: null,
};

class AppRenderer extends React.Component<any, Props, State> {
  state = { ...defaults };

  updatePageMetadata(state, props) {
    const { title, description, keywords } = state;
    const { intl } = props;
    if (!isEmpty(title)) {
      if (typeof title === 'string') {
        window.document.title = `Bitmoon - ${title}` || 'Bitmoon';
      } else if (typeof title === 'object') {
        const titleMessage = intl.formatMessage(
          {
            id: title.id,
          },
          title.values,
        );
        window.document.title = titleMessage;
      }
    }
    if (!isEmpty(description)) {
      if (typeof description === 'string') {
        window.document
          .querySelector('meta[name="description"]')
          .setAttribute('content', description);
      } else if (typeof description === 'object') {
        const descriptionMessage = intl.formatMessage(
          {
            id: description.id,
          },
          description.values,
        );
        window.document
          .querySelector('meta[name="description"]')
          .setAttribute('content', descriptionMessage);
      }
    }

    if (typeof keywords === 'string') {
      window.document
        .querySelector('meta[name="keywords"]')
        .setAttribute('content', keywords);
    } else if (typeof keywords === 'object') {
      const keywordMessage = intl.formatMessage(
        {
          id: keywords.id,
        },
        keywords.values,
      );
      window.document
        .querySelector('meta[name="keywords"]')
        .setAttribute('content', keywordMessage);
    }
  }

  componentDidMount() {
    this.updatePageMetadata(this.state, this.props);
  }

  componentDidUpdate() {
    this.updatePageMetadata(this.state, this.props);
  }

  async componentWillReceiveProps(nextProps: Props) {
    if (nextProps.error && this.props.error !== nextProps.error) {
      this.setState({ error: nextProps.error });
    } else if (
      this.props.location !== nextProps.location ||
      !isEqual(this.props.params, nextProps.params) ||
      this.props.components !== nextProps.components ||
      this.props.render !== nextProps.render
    ) {
      const promise = Promise.resolve(nextProps.components);

      if (nextProps.render && nextProps.components === promise) {
        promise.then(components => {
          if (
            this.props.components === nextProps.components &&
            nextProps.render
          ) {
            this.setState({
              ...defaults,
              ...nextProps.render(components, this.props.params),
            });
          }
        });
      } else if (nextProps.render) {
        this.setState({
          ...defaults,
          ...nextProps.render(nextProps.components, nextProps.params),
        });
      } else {
        this.setState({ error: new Error('The .render() method is missing.') });
      }
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      this.state.title !== nextState.title ||
      this.state.description !== nextState.description ||
      this.state.keywords !== nextState.keywords ||
      this.state.body !== nextState.body
    );
  }

  render() {
    const { template, location } = this.props;

    return this.state.error ? (
      <ErrorPage error={this.state.error} />
    ) : (
      this.state.body &&
      (template === 'home' ? (
        // Homepage template
        <div>
          <AppToolbar template={template} />
          <div className="clearfix" />
          <div>{this.state.body || <p>Loading...</p>}</div>
          <AppFooter />
          <AppStickyNavBottom location={location} />
          <Loading />
        </div>
      ) : template === 'minimize' ? (
        // Minimize tmplate for Login and Register
        <div className="minimize">
          {this.state.body || <p>Loading...</p>}
          <AppStickyNavBottom location={location} />
          <Loading />
        </div>
      ) : template === 'blog' ? (
        // Minimize tmplate for Login and Register
        <div className="blog">
          <AppToolbar template={template} />
          <div className="clearfix" />
          <div className="page-content container">
            {this.state.body || <p>Loading...</p>}
          </div>
          <AppFooter />
          <AppStickyNavBottom location={location} />
          <Loading />
        </div>
      ) : template === 'blank' ? (
        <div>{this.state.body || <p>Loading...</p>}</div>
      ) : (
        // Minimize tmplate for Login and Register
        <div className="blog full-width-page">
          <AppToolbar template={template} />
          <div className="clearfix" />
          <div className="page-content container-fluid">
            {this.state.body || <p>Loading...</p>}
          </div>
          <AppFooter />
          <AppStickyNavBottom location={location} />
          <Loading />
        </div>
      ))
    );
  }
}
export default injectIntl(AppRenderer);
