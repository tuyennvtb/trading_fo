import React from 'react';

class TradingView extends React.Component {
  state = {
    isLoaded: false,
    currentCoin: ''
  }

  componentDidMount() {
    const id = "script_trading_view";
    if (!document.querySelector('#script_trading_view')) {
      const script = document.createElement("script");
      script.id = id;
      script.type = "text/javascript";
      script.src = "https://s3.tradingview.com/tv.js";
      document.head.appendChild(script);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.currentCoin 
      && nextProps.coin_code !== this.state.currentCoin
      && this.state.isLoaded) {
      this.setState({
        isLoaded: false,
        currentCoin: nextProps.coin_code
      });
    }
  }

  componentDidUpdate() {
    if (window.TradingView) {
      if (!this.state.isLoaded) {
        const { coin_code, broker_code, usdt } = this.props;
        if (coin_code !== 'USDT') {
          let broker = '';
          switch (broker_code) {
            case 'BINANCE':
              broker = 'BINANCE';
              break;
            case 'HUOBI':
              broker = 'HUOBI';
              break;
            default:
              broker = 'BINANCE';
              break;
          }

          let money = 'USD';
          if (usdt) {
            money = 'USDT';
          }
          let symbol = `${broker}:${coin_code}${money}`;

          new window.TradingView.widget(
            {
              "autosize": true,
              "symbol": symbol,
              "interval": "240",
              "timezone": "Etc/UTC",
              "theme": "light",
              "style": "1",
              "locale": "en",
              "toolbar_bg": "#f1f3f6",
              "enable_publishing": false,
              "withdateranges": true,
              "hide_side_toolbar": false,
              "allow_symbol_change": true,
              "studies": [
                "BB@tv-basicstudies"
              ],
              "container_id": "tradingview_0d7ea"
            }
          );
        }
        this.setState({
          isLoaded: true,
          currentCoin: coin_code
        });
      }
    }
  }

  render() {
    const { coin_code } = this.props;
    if (coin_code === 'USDT') {
      return null;
    }

    return (
      <div className="tradingview-widget-container">
        <div id="tradingview_0d7ea" style={{
          height: '490px'
        }}></div>
      </div>
    );
  }
}

export default TradingView;