import React from 'react';
import { connect } from 'react-redux';
import { getSettingsByItem } from '../Redux/actions/settings';

class MediaPartner extends React.Component {
  state = {
    listPartner: [],
    isFetch: false
  }

  componentDidMount() {
    this.props.dispatch(getSettingsByItem('media_partners'));
  }

  componentWillReceiveProps(nextProps) {
    const { settings } = nextProps;
    if (!this.state.isFetch
      && settings
      && settings.item === 'media_partners'
    ) {
      this.setState({
        listPartner: settings.value,
        isFetch: true
      })
    }
  }

  renderPartner = () => {
    const { listPartner } = this.state;
    if (listPartner.length) {
      return listPartner.map((item, index) => {
        return (
          <div className="media-item col-xs-6 col-md-3" key={index}>
            <a href={item.url} target="_blank" >
              <img alt={item.title} title={item.title} src={item.img} className="lazy"/>
            </a>
          </div>
        );
      });
    }
    return null;
  }

  render() {
    return (
      <div className="media-partners">
        <div className="container">
          <div className=" row">
            {this.renderPartner()}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ settings }) {
  return { settings };
}

export default connect(mapStateToProps)(MediaPartner);