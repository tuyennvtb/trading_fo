import React from 'react';
import { connect } from 'react-redux';
import { detectMobile, detectMobileIOS, getCookie, setCookie, getJsonFromUrl } from '../Helpers/utils';
import { getSettingsByItem } from '../Redux/actions/settings';
import logo_android from '../assets/img/logo/ch-play.png';
import logo_ios from '../assets/img/logo/app-store.png';
import '../assets/css/components/banner_download.css';
import { FormattedMessage } from 'react-intl';

class BannerDownload extends React.Component {
  state = {
    setting: {},
    show: false,
    isFetch: false,
    bannerDownload: {}
  }
  componentDidMount() {
    this.loadBanner();
  }

  componentWillReceiveProps(nextProps) {
    const { settings } = nextProps;
    if (!this.state.isFetch
      && settings
      && settings.item === 'banner_download'
    ) {
      this.setState({
        bannerDownload: settings.value,
        isFetch: true
      });

      window.setTimeout(
        () => {
          this.setState({
            show: true
          });
        },
        settings.value.setTimeout
      );

    }
  }

  loadBanner = () => {
    if (detectMobile) {
      this.loadDB();
    }
  }

  loadDB = () => {
    const obj = getJsonFromUrl();
    if (!obj.isAppInstalled) {
      if (!getCookie('banner_download_disable')) {
        this.props.dispatch(getSettingsByItem('banner_download'));
      }
    }
  }

  onClickClose = () => {
    // set 1 day
    setCookie('banner_download_disable', 1, 1440);
    this.setState({
      show: false
    })
  }

  showBanner = () => {
    const { bannerDownload } = this.state;
    if (bannerDownload) {
      let url = '';
      let logo = '';
      if (detectMobileIOS()) {
        url = bannerDownload.url_ios;
        logo = logo_ios;
      } else {
        url = bannerDownload.url_android;
        logo = logo_android;
      }
      return (
        <React.Fragment>
          <a className="btn-close" onClick={this.onClickClose}>
            <i className="fa fa-close"></i>
          </a>
          <div className="banner-download">
            <span className="banner-logo">
              <img src={logo} alt="" />
            </span>
            <a className="btn-download" href={url}>
              <button className="btn bg-primary label" type="button">
                <FormattedMessage id="app.global.download" />
              </button>
            </a>
          </div>
        </React.Fragment>
      );
    }

    return null;
  }

  render() {
    const { show } = this.state;
    if (show) {
      return <div id="banner-download-application">{this.showBanner()}</div>;
    }

    return null;
  }

}

function mapStateToProps({ settings }) {
  return { settings };
}


export default connect(mapStateToProps)(BannerDownload);