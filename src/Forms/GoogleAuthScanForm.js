import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getGoogleAuthCode } from '../Redux/actions/google-auth';
import Link from '../Link';
import { FormattedMessage } from 'react-intl';

class GoogleAuthScanForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getGoogleAuthCode: PropTypes.func.isRequired,
    }).isRequired,
    code: PropTypes.object,
  };

  static defaultProps = {
    code: null,
  };

  async componentDidMount() {
    const { actions } = this.props;
    await actions.getGoogleAuthCode();
  }

  render() {
    const { code } = this.props;
    return (
      <div>
        {code && code.status ? (
          <div className="row">
            <div className="col-md-12">
              <div className="portlet light bordered paper-3">
                <div className="portlet-title">
                  <div className="caption">
                    <i className="icon-reload" />
                    <span className="caption-subject bold uppercase">
                      <FormattedMessage id="app.googleauth.header.text" />
                    </span>
                  </div>
                </div>
                <div className="portlet-body">
                  <div className="alert alert-warning">
                    <div className="pull-left" style={{ paddingRight: '20px' }}>
                      <img
                        className="img-responsive lazy"
                        src={code.url}
                        alt="No scan code found"
                      />
                    </div>
                    <p>
                      <FormattedMessage id="app.googleauth.handle.active" />
                    </p>
                    <br />
                    <p>
                      <FormattedMessage
                        id="app.googleauth.scan.backupmessage"
                        values={{
                          code: (
                            <span style={{ color: '#000' }}>
                              <b>{code.secret}</b>
                            </span>
                          ),
                        }}
                      />
                    </p>
                    <br />
                    <p>
                      <Link
                        className="btn btn-href"
                        href="/security/handle/true"
                      >
                        <FormattedMessage id="app.googleauth.button.scan" />
                      </Link>
                    </p>
                    <div className="clearfix" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ google2fa }) {
  const googleAuthCode = (google2fa && google2fa.general_code) || null;
  return {
    code: googleAuthCode,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getGoogleAuthCode }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GoogleAuthScanForm);
