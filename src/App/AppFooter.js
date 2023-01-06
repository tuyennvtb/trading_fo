/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import Link from '../Link';
import { FormattedMessage } from 'react-intl';
import { Helmet } from 'react-helmet';
class AppFooter extends React.Component {
  render() {
    return (
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-3 col-sm-2 col-xs-12 hidden-xs hidden-sm">
              <Link href="/" className="logo">
                <img
                  src="/assets/global/img/bitmoon/logo.png"
                  alt="logo"
                  className="logo-default hidden-xs hidden-sm lazy"
                />
              </Link>
              <p>
                <FormattedMessage id="app.home.ucoin.banner.header.title" />
              </p>
              <p className="hidden-xs hidden-sm">
                <span>
                  <FormattedMessage id="app.footer.link.address" />:
                </span>
                <span>
                  {' '}
                  <FormattedMessage id="app.footer.link.address.content" />
                </span>
              </p>
              <p className="hidden-xs hidden-sm">
                <span>
                  <span>
                    <FormattedMessage id="app.footer.link.headquarter" />:
                  </span>{' '}
                  <FormattedMessage id="app.footer.link.headquarter.content" />
                </span>
              </p>
            </div>
            <div className="col-md-3 col-sm-2 col-xs-12 hidden-xs hidden-sm">
              <h3 className="font-heading">
                <FormattedMessage id="app.footer.link.pages" />
              </h3>
              <ul className="link-list">
                <li>
                  <Link title="About Us" href="/about-us">
                    <FormattedMessage id="app.header.aboutus" />
                  </Link>
                </li>
                <li>
                  <Link title="Terms of use" href="/terms-of-use">
                    <FormattedMessage id="app.footer.link.term" />
                  </Link>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    title="How to use"
                    href="https://goctienao.com/san-giao-dich-bitcoin-uy-tin/"
                  >
                    <FormattedMessage id="app.footer.link.howtouse" />
                  </a>
                </li>
                <li>
                  <Link title="Privacy" href="/privacy">
                    <FormattedMessage id="app.footer.link.privacy" />
                  </Link>
                </li>
                <li>
                  <Link title="Risk" href="/risk">
                    <FormattedMessage id="app.footer.link.risk" />
                  </Link>
                </li>
                <li>
                  <Link title="FAQs" href="/faqs">
                    <FormattedMessage id="app.footer.link.faq" />
                  </Link>
                </li>
                <li>
                  <a
                    title="FAQs"
                    href="https://blog.bitmoon.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage id="app.footer.link.newsblog" />
                  </a>
                </li>
                <li>
                  <Link title="Fee exchange" href="/fee-exchange">
                    <FormattedMessage id="app.footer.link.fee_exchange" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-md-3 col-sm-12 col-xs-12">
              <h3 className="font-heading">Liên hệ với chúng tôi</h3>
              <ul>
                <li>
                  <a href="mailto:support@bitmoon.net">
                    Email: support@bitmoon.net
                  </a>
                </li>
                <li>
                  <a href="tel:0966223527">Hotline 1: 0966223527</a>
                </li>
                <li>
                  <a href="tel:0909945878">Hotline 2: 0909945878</a>
                </li>
              </ul>
              <div className="social-footer-icons">
                <h3 className="font-heading">MẠNG XÃ HỘI</h3>
                <ul className="menu simple">
                  <li>
                    <a
                      title="Twitter"
                      href="https://twitter.com/bitmoondotnet"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-twitter fa-2x" aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a
                      title="Facebook"
                      href="https://www.facebook.com/bitmoonnet"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i
                        className="fa fa-facebook-official fa-2x"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      title="Telegram"
                      href="https://t.me/bitmoondotnet"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-telegram fa-2x" aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a
                      title="Youtube"
                      href="https://www.youtube.com/channel/UCnuUFs8n8IrF1UCNbcSIsEg/featured"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-youtube fa-2x" aria-hidden="true" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-md-3 col-sm-12 col-xs-12 hidden-xs hidden-sm">
              <h3 className="font-heading">
                <FormattedMessage id="app.footer.link.trade_guide" />
              </h3>
              <ul>
                <li>
                  <a alt="hướng dẫn mua bán bitcoin" target="_blank" href="/blog/2020/06/30/mua-bitcoin/">
                    <FormattedMessage id="app.footer.link.buy_bitcoin" />
                  </a>
                </li>
                <li>
                  <a alt="hướng dẫn mua bán ethereum" target="_blank" href="/blog/2020/06/30/mua-ethereum-eth/">
                    <FormattedMessage id="app.footer.link.buy_ethereum" />
                  </a>
                </li>
                <li>
                  <a alt="hướng dẫn mua bán ripple" target="_blank" href="/blog/2020/06/30/mua-ripple-xrp/">
                    <FormattedMessage id="app.footer.link.buy_ripple" />
                  </a>
                </li>
                <li>
                  <a alt="hướng dẫn mua bán tomochain" target="_blank" href="/blog/2020/06/30/mua-tomochain-coin-tomo-tai-san-bitmoon/">
                    <FormattedMessage id="app.footer.link.buy_tomochain" />
                  </a>
                </li>
                <li>
                  <a alt="hướng dẫn mua bán tron" target="_blank" href="/blog/2020/06/30/mua-tron-trx/">
                    <FormattedMessage id="app.footer.link.buy_tron" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="allright">
          <div className="container">
            <div className="row">
              <div className="col-md-1 col-sm-12" />
              <div className="col-md-11 col-sm-12">
                <p>
                  <FormattedMessage id="app.global.homepage.policy" />&nbsp;
                </p>
              </div>
            </div>
          </div>
        </div>
        <Helmet>
          <script type="text/javascript">
            {`  
  if (window.isInitTawkTo == false) {
    window.isInitTawkTo = true;
    if (window.matchMedia("(max-width: 767px)").matches) {
      // mobile
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/5d2d89e2bfcb827ab0cbfd25/default';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
      })();

    } else {
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/5adc55fa227d3d7edc24662b/default';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
      })();
    }
    function getCookie(name) {
      var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return match[2];
    }
  
    function floorNumber(value)  {
      return Math.floor(value * 10000) / 10000;
    };
  
    function formatMoney(value) {
      if (value == 0) return 0;
      let result = accounting.format(floorNumber(value), 4, ',', '.');
      return result.replace(/(\.[0-9]*[1-9])0*|(\.0*)/, '$1');
    };
    
    var API_KEY = '9b5af8554942f928b530a46f32f423079efec1ae';
    if (window.matchMedia("(max-width: 767px)").matches) {
      API_KEY = '31cb7c2f6ac07de7f0cf92f1f0c129889d3799e7';
    }
    var clientInfoRawData = getCookie('CLIENT_INFO');
    if (clientInfoRawData) {
      clientInfoRawData = JSON.parse(decodeURIComponent(getCookie('CLIENT_INFO')));
    }
      Tawk_API.onLoad = function(data) {
        var sentData = {
          name  : clientInfoRawData.name + ' ' + clientInfoRawData.birthday,
          email : clientInfoRawData.email,
          userid : clientInfoRawData.userId,
          totalboughtamount: clientInfoRawData.userFilterData != null ? formatMoney(clientInfoRawData.userFilterData.total_bought_amount) : 0,
          totalboughttime: clientInfoRawData.userFilterData != null ? clientInfoRawData.userFilterData.total_bought_times : 0,
          totalsoldamount: clientInfoRawData.userFilterData != null ? formatMoney(clientInfoRawData.userFilterData.total_sold_amount) : 0,
          totalsoldtime: clientInfoRawData.userFilterData != null ? clientInfoRawData.userFilterData.total_sold_times : 0,
          hash : CryptoJS.HmacSHA256(clientInfoRawData.email, API_KEY).toString()
        };
        if (clientInfoRawData) {
          Tawk_API.setAttributes(sentData, function(error){
            console.log('Error when set attribute to Tawk.to, error_message: ', error)
          })  
        }
    };
  }
  `}
          </script>
        </Helmet>
      </footer>
    );
  }
}

export default AppFooter;