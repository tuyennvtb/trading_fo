import React from 'react';
import { connect } from 'react-redux';
import { getCookie, getJsonFromUrl } from '../Helpers/utils';
import { getSettingsByItem } from '../Redux/actions/settings';
import logo_android from '../assets/img/logo/ch-play.png';
import logo_ios from '../assets/img/logo/app-store.png';
import QR_android from '../assets/img/logo/QR_android.png';
import QR_ios from '../assets/img/logo/QR_ios.png';
import '../assets/css/components/banner_application.css';
import { FormattedMessage } from 'react-intl';

class BannerApplication extends React.Component {
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
        isFetch: true,
        show: true
      });
    }
  }

  loadBanner = () => {
    this.loadDB();
  }

  loadDB = () => {
    const obj = getJsonFromUrl();
    if (!obj.isAppInstalled) {
      this.props.dispatch(getSettingsByItem('banner_download'));
    }
  }

  showBanner = () => {
    const { bannerDownload } = this.state;
    if (bannerDownload) {
      const url_ios = bannerDownload.url_ios;
      const url_android = bannerDownload.url_android;
      return (
        <div className="row">
          <div className="col-md-6 col-xs-12">
            <div className="banner-item row">
              <div className="col-xs-12">
                <a href={url_android} target="_blank" className="logo-app">
                  <img src={logo_android} alt="" />
                </a>
                <img src={QR_android} alt="" className="banner-qr" />
              </div>
            </div>
          </div>
          <div className="col-md-6 col-xs-12">
            <div className="banner-item row">
              <div className="col-xs-12">
                <a href={url_ios} target="_blank" className="logo-app">
                  <img src={logo_ios} alt="" />
                </a>
                <img src={QR_ios} alt="" className="banner-qr" />
              </div>
              <div className="col-xs-12">
                <a href="https://blog.bitmoon.net/huong-dan-cai-dat-app-bitmoon/" target="_blank">
                  <FormattedMessage id="app.home.setup.ios" />
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  render() {
    const { show } = this.state;
    if (show) {
      return (
        <div className="banner-application">
          <div className="container">
            {this.showBanner()}
          </div>
        </div>
      );
    }

    return null;
  }

}

function mapStateToProps({ settings }) {
  return { settings };
}


export default connect(mapStateToProps)(BannerApplication);