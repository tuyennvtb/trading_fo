import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Loading extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
  };

  render() {
    const { isLoading } = this.props;
    return (
      <div>
        {isLoading && (
          <div className="loading">
            <div className="loader">
              <div className="loader-inner ball-clip-rotate-pulse">
                <div />
                <div />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
function mapStateToProps({ runtime }) {
  const { loading } = runtime;
  return {
    isLoading: loading || false,
  };
}
export default connect(mapStateToProps, null)(Loading);
