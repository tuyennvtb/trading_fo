import React from 'react';
class HighlightablePrice extends React.Component {
  constructor(props) {
    super(props);
    this.arrow = '';
    this.highlighted = '';
    this.onHighlight = false;
    this.state = {
      arrow: '',
      highlighted: '',
    };
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.price !== this.props.price) {
      if (!this.onHighlight) {
        if (prevProps.price < this.props.price) {
          this.highlighted = 'font-green-jungle bold price-changed ';
          this.arrow = 'up';
        } else {
          this.highlighted = 'font-red bold price-changed';
          this.arrow = 'down';
        }
        if (this.props.isBlinkOnly) {
          this.arrow = '';
          this.highlighted = 'price-changed';
        }

        this.onHighlight = true;
        this.setState({
          arrow: this.arrow,
          highlighted: this.highlighted,
        });

        setTimeout(() => {
          if (this.mounted) {
            this.setState({
              arrow: '',
              highlighted: 'font-black',
            });
            this.onHighlight = false;
          }
        }, 3000);
      }
    }
  }

  render() {
    return (
      <span className={'price-text ' + this.state.highlighted}>
        <i className={'fa fa-arrow-' + this.state.arrow} /> {this.props.price}{' '}
        {this.props.unitLabel}
      </span>
    );
  }
}

export default HighlightablePrice;
