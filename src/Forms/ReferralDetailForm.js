import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUserRefereeDetail } from '../Redux/actions/user';
import UserRefereeDetailTable from './UserRefereeDetailTable';
import { FormattedMessage } from 'react-intl';

class ReferralDetailForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getUserRefereeDetail: PropTypes.func.isRequired,
    }).isRequired,
    history: PropTypes.object,
  };

  static defaultProps = {
    history: null,
  };

  async componentDidMount() {
    // send create coin request if it's the first time user open the coin
    const { actions } = this.props;
    await actions.getUserRefereeDetail();
  }

  render() {
    const { detail } = this.props;
    const records = detail && detail.length > 0 ? detail : [];
    return (
      <div className="portlet light bordered paper-3">
        <div className="portlet-title">
          <div className="caption">
            <i className="fa fa-download" />
            <span className="caption-subject bold uppercase">
              <FormattedMessage id="app.history.referral.detail.title" />
            </span>
          </div>
        </div>
        <div className="portlet-body history">
          {records !== null ? (
            <UserRefereeDetailTable data={records} />
          ) : (
            <p className="spin-loading">Loading...</p>
          )}
        </div>
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ user }) {
  const detail = (user && user.refereeDetail) || null;
  return {
    detail,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getUserRefereeDetail }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReferralDetailForm);
