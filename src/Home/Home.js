/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import Link from '../Link';
import MenuCoin from '../MenuCoin';
import Promotion from '../Commercial/Promotion';
import Sliders from '../Sliders';
import { Cookies } from 'react-cookie';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { GLOBAL_VARIABLES } from '../Helpers/constants/system';
import MediaPartner from '../App/MediaPartner';
import '../assets/css/pages/homepage.css';
import BannerApplication from '../App/BannerApplication';

class Home extends React.Component {
  componentDidMount() {
    const { ref_id } = this.props;
    if (ref_id) {
      const cookies = new Cookies();
      const currentRefId = cookies.get('ref_id');
      if (currentRefId !== ref_id) {
        cookies.set('ref_id', ref_id, {
          path: '/',
          maxAge: GLOBAL_VARIABLES.REF_ID_COOKIE_MAX_AGE,
        });
      }
    }
  }

  render() {
    return (
      <div className="homepage blog home pt-75">
        <Sliders />
        {/* <div className="page-container">
        <div className="page-container">
          <div className="flash-screen hide-opacity hidden-xs hidden-sm">
            <div className="moon">
              I see a bad moon rising I see trouble on the way
            </div>
            <div className="flash-message text-center hidden-xs hidden-sm">
              <FormattedMessage id="app.home.ucoin.banner.header">
                {txt => <h1>{txt}</h1>}
              </FormattedMessage>
              <div className="countdown-calendar">
                <FormattedMessage id="app.home.bitmoon.banner.benefit">
                  {txt => <h3>{txt}</h3>}
                </FormattedMessage>
                <Link href="/register" className="md-btn btn">
                  <FormattedMessage id="app.global.button.joinus" />
                </Link>
              </div>
            </div>
            <div className="stars" />
            <div className="twinkling" />
            <div className="clouds" />
          </div>
          <Link href="/" className="page-quick-sidebar-toggler">
            <i className="icon-login" />
          </Link>
        </div> */}
        <section className="sec-about-ucoincash">
          <div className="container">
            <MenuCoin />
          </div>
        </section>
        <section className="portfolio currencies hidden-xs hidden-sm">
          <div className="container">
            <div className="row about-bitmoon-tab blog">
              <div className="col-md-12">
                <div className="tabbable-custom">
                  <ul className="nav nav-tabs ">
                    <li className="active">
                      <a
                        className="bold"
                        href="#tab_5_1"
                        data-toggle="tab"
                        aria-expanded="true"
                      >
                        <span className="visible-xs visible-sm">
                          <FormattedMessage id="app.home.bitmoontab.about" />
                        </span>
                        <span className="hidden-xs hidden-sm">
                          <FormattedMessage id="app.home.bitmoontab.aboutbitmoon" />
                        </span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#tab_5_2"
                        data-toggle="tab"
                        aria-expanded="false"
                      >
                        <FormattedMessage id="app.footer.link.howtouse" />
                      </a>
                    </li>
                  </ul>
                  <div className="tab-content portlet-body">
                    <div className="tab-pane active" id="tab_5_1">
                      <div className="panel-group accordion" id="accordion2">
                        <div className="panel panel-default">
                          <div className="panel-heading">
                            <h4 className="panel-title">
                              <a
                                className="opened accordion-toggle"
                                data-toggle="collapse"
                                data-parent="#accordion2"
                                href="#collapse_2_1"
                                aria-expanded="false"
                              >
                                <span>
                                  <FormattedMessage id="app.home.bitmoontab.about.whatisbitmoon" />
                                </span>
                                <i className="fa fa-chevron-down pull-right" />
                                <i className="fa fa-chevron-up pull-right" />
                              </a>
                            </h4>
                          </div>
                          <div
                            id="collapse_2_1"
                            className="panel-collapse collapse in"
                            aria-expanded="true"
                          >
                            <div className="panel-body">
                              <FormattedHTMLMessage id="app.home.bitmoontab.about.whatisbitmoon.content" />
                            </div>
                          </div>
                        </div>
                        <div className="panel panel-default">
                          <div className="panel-heading">
                            <h4 className="panel-title">
                              <a
                                className="accordion-toggle collapsed"
                                data-toggle="collapse"
                                data-parent="#accordion2"
                                href="#collapse_2_2"
                                aria-expanded="false"
                              >
                                <span>
                                  <FormattedMessage id="app.home.bitmoontab.about.bitmoonfee" />
                                </span>
                                <i className="fa fa-chevron-down pull-right" />
                                <i className="fa fa-chevron-up pull-right" />
                              </a>
                            </h4>
                          </div>
                          <div
                            id="collapse_2_2"
                            className="panel-collapse collapse"
                            aria-expanded="false"
                          >
                            <div className="panel-body">
                              <p>
                                <FormattedMessage id="app.home.bitmoontab.about.bitmoonfee.content" />
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="panel panel-default">
                          <div className="panel-heading">
                            <h4 className="panel-title">
                              <a
                                className="accordion-toggle collapsed"
                                data-toggle="collapse"
                                data-parent="#accordion2"
                                href="#collapse_2_3"
                                aria-expanded="false"
                              >
                                <span>
                                  <FormattedMessage id="app.home.bitmoontab.about.storecoinsonbitmoon" />
                                </span>
                                <i className="fa fa-chevron-down pull-right" />
                                <i className="fa fa-chevron-up pull-right" />
                              </a>
                            </h4>
                          </div>
                          <div
                            id="collapse_2_3"
                            className="panel-collapse collapse"
                            aria-expanded="false"
                          >
                            <div className="panel-body">
                              <p>
                                <FormattedMessage id="app.home.bitmoontab.about.storecoinsonbitmoon.content" />
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="panel panel-default">
                          <div className="panel-heading">
                            <h4 className="panel-title">
                              <a
                                className="accordion-toggle collapsed"
                                data-toggle="collapse"
                                data-parent="#accordion2"
                                href="#collapse_2_4"
                                aria-expanded="false"
                              >
                                <span>
                                  <FormattedMessage id="app.home.bitmoontab.about.depositcoinstobitmoon" />
                                </span>
                                <i className="fa fa-chevron-down pull-right" />
                                <i className="fa fa-chevron-up pull-right" />
                              </a>
                            </h4>
                          </div>
                          <div
                            id="collapse_2_4"
                            className="panel-collapse collapse"
                            aria-expanded="false"
                          >
                            <div className="panel-body">
                              <FormattedHTMLMessage id="app.home.bitmoontab.about.depositcoinstobitmoon.content" />
                            </div>
                          </div>
                        </div>
                        <div className="panel panel-default">
                          <div className="panel-heading">
                            <h4 className="panel-title">
                              <a
                                className="accordion-toggle collapsed"
                                data-toggle="collapse"
                                data-parent="#accordion2"
                                href="#collapse_2_5"
                                aria-expanded="false"
                              >
                                <span>
                                  <FormattedMessage id="app.home.bitmoontab.about.acceptpayment" />
                                </span>
                                <i className="fa fa-chevron-down pull-right" />
                                <i className="fa fa-chevron-up pull-right" />
                              </a>
                            </h4>
                          </div>
                          <div
                            id="collapse_2_5"
                            className="panel-collapse collapse"
                            aria-expanded="false"
                          >
                            <div className="panel-body">
                              <p>
                                <FormattedMessage id="app.home.bitmoontab.about.acceptpayment.content" />
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="panel panel-default">
                          <div className="panel-heading">
                            <h4 className="panel-title">
                              <a
                                className="accordion-toggle collapsed"
                                data-toggle="collapse"
                                data-parent="#accordion2"
                                href="#collapse_2_6"
                                aria-expanded="false"
                              >
                                <span>
                                  <FormattedMessage id="app.home.bitmoontab.about.whybitmoon" />
                                </span>
                                <i className="fa fa-chevron-down pull-right" />
                                <i className="fa fa-chevron-up pull-right" />
                              </a>
                            </h4>
                          </div>
                          <div
                            id="collapse_2_6"
                            className="panel-collapse collapse"
                            aria-expanded="false"
                          >
                            <div className="panel-body">
                              <FormattedHTMLMessage id="app.home.bitmoontab.about.whybitmoon.content" />
                            </div>
                          </div>
                        </div>
                        <div className="panel panel-default">
                          <div className="panel-heading">
                            <h4 className="panel-title">
                              <a
                                className="accordion-toggle collapsed"
                                data-toggle="collapse"
                                data-parent="#accordion2"
                                href="#collapse_2_7"
                                aria-expanded="false"
                              >
                                <span>
                                  <FormattedMessage id="app.home.bitmoontab.about.nocheating" />
                                </span>
                                <i className="fa fa-chevron-down pull-right" />
                                <i className="fa fa-chevron-up pull-right" />
                              </a>
                            </h4>
                          </div>
                          <div
                            id="collapse_2_7"
                            className="panel-collapse collapse"
                            aria-expanded="false"
                          >
                            <div className="panel-body">
                              <p>
                                <FormattedMessage id="app.home.bitmoontab.about.nocheating.content" />
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="tab-pane" id="tab_5_2">
                      <div className="mt-element-step">
                        <div className="row step-line">
                          <div className="col-md-4 mt-step-col first done">
                            <div className="mt-step-number bg-white">1</div>
                            <div className="mt-step-title first-title uppercase bold">
                              <FormattedMessage id="app.home.bitmoontab.guide.registeraccount" />
                            </div>
                            <div className="mt-step-content">
                              <FormattedMessage id="app.home.bitmoontab.guide.verifyaccount" />
                            </div>
                          </div>
                          <div className="col-md-4 mt-step-col error">
                            <div className="mt-step-number bg-white">2</div>
                            <div className="mt-step-title uppercase bold">
                              <FormattedMessage id="app.home.bitmoontab.guide.depositcashintoaccount" />
                            </div>
                            <div className="mt-step-content">
                              <FormattedMessage id="app.home.bitmoontab.guide.depositcoinintoaccount" />
                            </div>
                          </div>
                          <div className="col-md-4 mt-step-col active last">
                            <div className="mt-step-number bg-white">3</div>
                            <div className="mt-step-title uppercase bold">
                              <FormattedMessage id="app.home.bitmoontab.guide.usecashbuycoin" />
                            </div>
                            <div className="mt-step-content">
                              <FormattedMessage id="app.home.bitmoontab.guide.usecointosell" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <BannerApplication />
        <MediaPartner />
      </div>
    );
  }
}

export default Home;
