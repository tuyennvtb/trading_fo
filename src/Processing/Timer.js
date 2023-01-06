import React from 'react';

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      remainingMinutes: 0,
      remainingSeconds: 0,
    };
  }

  updateRemainMinutesAndSeconds(timeRemainingInSeconds) {
    let remainingMinutes = Math.floor(timeRemainingInSeconds / 60);
    let remainingSeconds = timeRemainingInSeconds % 60;
    this.setState({
      remainingMinutes,
      remainingSeconds,
    });
  }

  countDown(timeRemainingInSeconds, shouldSkipCallback) {
    this.setState({
      timeRemainingInSeconds,
    });
    if (timeRemainingInSeconds === 0) {
      this.props.onCompletion();
    }
    if (timeRemainingInSeconds > 0) {
      this.updateRemainMinutesAndSeconds(timeRemainingInSeconds);
      timeRemainingInSeconds = timeRemainingInSeconds - 1;
      this.setTimeoutId = setTimeout(
        this.countDown.bind(this, timeRemainingInSeconds, false),
        1000,
      );
    }
  }

  componentDidMount() {
    this.countDown(this.props.timeRemainingInSeconds, true);
  }

  componentWillUnmount() {
    clearTimeout(this.setTimeoutId);
  }

  render() {
    return (
      <div className="timer">
        <div>
          <span className="bold number-display">
            {this.state.remainingMinutes > 9 ? (
              this.state.remainingMinutes
            ) : (
              '0' + this.state.remainingMinutes
            )}:{this.state.remainingSeconds > 9 ? (
              this.state.remainingSeconds
            ) : (
              '0' + this.state.remainingSeconds
            )}
          </span>
          <span className="info">{this.props.label}</span>
        </div>
      </div>
    );
  }
}

export default Timer;
