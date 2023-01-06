import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
/* eslint-disable css-modules/no-unused-class */
/* eslint-enable css-modules/no-unused-class */

class RenderDropZone extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    label: PropTypes.string, // eslint-disable-line react/require-default-props
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    meta: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string,
      warning: PropTypes.string,
    }).isRequired,
    custom: PropTypes.object, // eslint-disable-line react/forbid-prop-types, react/require-default-props
  };

  constructor() {
    super();
    this.onDrop = this.onDrop.bind(this);
    this.state = {
      acceptedFiles: [],
      rejectedFiles: [],
    };
  }

  async onDrop(acceptedFiles, rejectedFiles) {
    this.setState({
      acceptedFiles,
      rejectedFiles,
    });

    if (acceptedFiles[0]) {
      this.props.input.onChange(acceptedFiles[0]);
    }
  }

  render() {
    const { input, label, type, meta, ...custom } = this.props;
    const { touched, error, warning } = meta;

    /* eslint-disable no-nested-ternary, jsx-quotes */
    return (
      <div>
        {label && <label htmlFor={custom.id}>{label}</label>}
        <div>
          <Dropzone
            multiple={false}
            style={{
              overflow: 'hidden',
              backgroundColor: 'rgba(96, 96, 96, 0.04)',
              cursor: 'pointer',
              margin: '0 auto',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              position: 'relative',
              width: '250px',
              padding: '10px',
              border: '2px dashed',
              height: '250px',
            }}
            accept="image/jpeg, image/png, image/gif"
            maxSize={2572864} // 1,5 megabytes
            onDrop={this.onDrop}
          >
            {input.value &&
              input.value.preview && (
                <div
                  style={{ backgroundImage: `url("${input.value.preview}")` }}
                />
              )}
          </Dropzone>

          <p className="help-block text-center">
            <b>Allowed file types:</b> jpg, jpeg, png.<br />
            <b>Maximum file size:</b> 2MB.
          </p>

          {this.state.rejectedFiles.length > 0 && (
            <div className="alert alert-danger">
              <strong>Error!</strong> We only allowed image (jpeg or png) which
              is less than 2mb.
            </div>
          )}
          {touched &&
            ((error && (
              <div className="alert alert-danger">
                <strong>Error!</strong>
                <span> {error}</span>
              </div>
            )) ||
              (warning && (
                <div className="alert alert-warning">
                  <strong>
                    <FormattedMessage id="app.global.button.warning" />
                  </strong>
                  <span> {warning}</span>
                </div>
              )))}
        </div>
      </div>
    );
    /* eslint-enable no-nested-ternary, jsx-quotes */
  }
}

export default RenderDropZone;
