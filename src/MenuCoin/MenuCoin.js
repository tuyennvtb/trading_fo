import React from 'react';
import CoinsInfo from '../CoinsInfo';
import Swap from '../Swap';
import { FormattedMessage, injectIntl } from 'react-intl';

class MenuCoin extends React.Component {
  state = {
    tab: 'tab1',
    tab2Loaded: false
  }

  onClickTab = (tab) => {
    this.setState({
      tab
    });
    if (!this.state.tab2Loaded) {
      if (tab == 'tab2') {
        this.setState({
          tab2Loaded: true
        });
      }
    }

  }

  render() {
    const { tab, tab2Loaded } = this.state;
    return (
      <div className="mt-30">
        <div className="menu-bar">
          <div className="menu-bar-container">
            <div className="list-item-menu">
              <div
                onClick={() => this.onClickTab('tab1')}
                className={`item-menu ${tab == 'tab1' && 'active'}`}>
                <div className="item-content">
                  <FormattedMessage id="page.home.menu.buySell" />
                </div>
              </div>
              <div
                onClick={() => this.onClickTab('tab2')}
                className={`item-menu ${tab == 'tab2' && 'active'}`}>
                <div className="item-content">
                  <FormattedMessage id="page.home.menu.swap" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${tab != 'tab1' && 'hide'}`}>
          <CoinsInfo detectArea="home" sizePerPage={50} />
        </div>

        <div className={`${tab != 'tab2' && 'hide'}`}>
          {tab2Loaded &&
            <Swap />
          }
        </div>
      </div>
    );
  }
}

export default injectIntl(MenuCoin);