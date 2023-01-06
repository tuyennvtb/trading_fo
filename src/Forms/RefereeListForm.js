import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUserRefereeList } from '../Redux/actions/user';
import UserRefereeListTable from './UserRefereeListTable';
import { FormattedMessage } from 'react-intl';
class RefereeListForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getUserRefereeList: PropTypes.func.isRequired,
    }).isRequired,
    history: PropTypes.object,
  };

  static defaultProps = {
    history: null,
  };

  async componentDidMount() {
    // send create coin request if it's the first time user open the coin
    const { actions } = this.props;
    await actions.getUserRefereeList();
    var getUserRefereeListInterval = setInterval(
      await actions.getUserRefereeList,
      30000,
    );
    this.setState({ getUserRefereeListInterval: getUserRefereeListInterval });
  }

  componentWillUnmount() {
    clearInterval(this.state.getUserRefereeListInterval);
  }

  render() {
    const { referees } = this.props;
    const records = referees && referees.length > 0 ? referees : [];
    return (
      <div className="portlet light bordered paper-3">
        <div className="portlet-title">
          <div className="caption">
            <i className="fa fa-download" />
            <span className="caption-subject bold uppercase">
              <FormattedMessage id="app.history.referral.header.title" />
            </span>
          </div>
        </div>
        <div className="portlet-body history">
          {records !== null ? (
            <UserRefereeListTable data={records} />
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
  const referees = (user && user.refereeList) || null;
  return {
    referees,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getUserRefereeList }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RefereeListForm);
