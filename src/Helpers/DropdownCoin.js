import React from 'react';
import { connect } from 'react-redux';
import { getListCoin } from '../Redux/actions/wallet';
import Select from 'react-select';
import { bindActionCreators } from 'redux';
import 'react-select/dist/react-select.css';

class DropdownCoin extends React.Component {
  state = {
    selected: '',
    isFetched: false,
    optionCoins: []
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getListCoin();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.isFetched
      && nextProps.listCoin) {
      const optionCoins = [];
      let selectedIcoin = '';
      nextProps.listCoin.forEach(icoin => {
        if (icoin.coin_code !== 'VND') {
          const option = {
            value: icoin.coin_id,
            label: <span className="icon">
              <img alt={icoin.coin_code} src={`/assets/global/img/coin-logo/${icoin.coin_id}.png`} className="lazy" />
              {icoin.coin_code}
            </span>,
            data: {
              coin_id: icoin.coin_id,
              coin_code: icoin.coin_code
            }
          };
          optionCoins.push(option);
          if (icoin.coin_id == this.props.coin_id) {
            selectedIcoin = icoin.coin_code;
          }
        }
      });

      let selected = '';
      if (this.props.coin_id) {
        selected = {
          value: this.props.coin_id,
          label: <span className="icon">
            <img alt="" className="lazy" src={`/assets/global/img/coin-logo/${this.props.coin_id}.png`} />
            {selectedIcoin}
          </span>
        }
      }

      this.setState({
        optionCoins,
        selected,
        isFetched: true
      })
    }
  }

  customFilter = (option, searchText) => {
    if (
      option.data.coin_code.toLowerCase().includes(searchText.toLowerCase()) ||
      option.data.coin_id.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return true;
    } else {
      return false;
    }
  }

  _onChangeIcoin = async (option) => {
    if (option) {
      await this.setState({
        selected: option,
      });
      const coin_id = option.value;
      this.props.onChangeDropdown(coin_id);
    } else {
      this.setState({
        selected: ''
      });
    }
  }

  render() {
    return (
      <Select
        className="react-select"
        name="DropdownCoin"
        options={this.state.optionCoins}
        onChange={this._onChangeIcoin}
        value={this.state.selected}
        isClearable={0}
        filterOption={this.customFilter}
      />

    );
  }
}

function mapStateToProps({ wallet = {} }) {
  const listCoin = wallet && wallet.listCoin || null;
  return {
    listCoin
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getListCoin }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DropdownCoin);