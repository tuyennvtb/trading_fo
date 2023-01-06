import React from 'react';
import { loadCss } from '../Helpers/utils';

class LoadStyle extends React.Component {
  state = {
    pathHome: '/',
    currentPath: '',
    menuCSS: `${process.env.PUBLIC_URL}/assets/global/static/menu.css`,
    homeCSS: `${process.env.PUBLIC_URL}/assets/global/css/homepage_main.css`,
    anotherPageCSs: `${process.env.PUBLIC_URL}/assets/global/static/app.css`
  }

  componentWillMount() {
    const pathName = window.location.pathname;
    this.loadCss(pathName);
  }

  componentWillReceiveProps(nextProps) {
    const pathName = nextProps.location.pathname;
    if (pathName !== this.state.currentPath) {
      this.loadCss(pathName);
    }
  }

  loadCss = (pathName) => {

    if (pathName === this.state.pathHome) {
      // load Home page
      loadCss(this.state.homeCSS);
      loadCss(this.state.menuCSS);
    } else {
      // load another page
      loadCss(this.state.anotherPageCSs);
    }

    this.setState({
      currentPath: pathName
    })
  }

  render() {
    return null;
  }
}

export default LoadStyle;