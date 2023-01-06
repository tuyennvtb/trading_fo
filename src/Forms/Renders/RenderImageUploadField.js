import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FormattedMessage } from 'react-intl';
class RenderImageUploadField extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    mutate: PropTypes.func.isRequired,
    meta: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.object,
      warning: PropTypes.string,
    }).isRequired,
    custom: PropTypes.object,
  };

  constructor() {
    super();
    this.onDrop = this.onDrop.bind(this);
    this.state = {
      acceptedFiles: [],
      rejectedFiles: [],
      previewFile: null,
      isLoading: false,
    };
  }

  async onDrop(acceptedFiles, rejectedFiles) {
    const { input } = this.props;
    this.setState({
      acceptedFiles,
      rejectedFiles,
      isLoading: true,
    });

    if (acceptedFiles[0]) {
      this.setState({
        previewFile: acceptedFiles[0],
      });
      const file = await this.props.mutate({
        variables: {
          file: acceptedFiles[0],
        },
      });

      if (file && file.data && file.data.apiFileUpload) {
        input.onChange(file.data.apiFileUpload.filename);
      }
    }
    this.setState({
      isLoading: false,
    });
  }

  render() {
    const { input, label, meta, disabled, sampleImg } = this.props;
    const { touched, error, warning } = meta;
    const { previewFile, isLoading } = this.state;
    const wrapperClass =
      touched && ((error && ' has-error') || (warning && ' has-warning'));
    const isUploaded = input.value ? true : false;

    return (
      <div className={`form-group ${wrapperClass} ${this.props.customClass}`}>
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title text-center">{label && label}</h3>
          </div>
          <div className="panel-body">
            <div className="input-group">
              <div className="mt-element-overlay">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mt-overlay-6">
                      {sampleImg ? (
                        <img
                          src={sampleImg}
                          className="bitmoon-image lazy"
                          alt="sample"
                        />
                      ) : null}
                      <div className="mt-overlay">
                        <h2 className="bold">
                          <FormattedMessage id="app.verify.document.upload" />
                        </h2>
                        <div>
                          <Dropzone
                            multiple={false}
                            style={{
                              backgroundImage: !isUploaded
                                ? 'url(/assets/global/img/bitmoon/upload.png)'
                                : '',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              margin: '0 auto',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center',
                              position: 'relative',
                              padding: '5px',
                            }}
                            accept="image/jpeg, image/png"
                            maxSize={5000000} // 5 megabytes
                            activeStyle={{
                              backgroundImage:
                                'url(/assets/global/img/bitmoon/upload-success.png)',
                              backgroundColor: 'rgba(80, 190, 113, 0.3)',
                              border: '1px dashed white',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center',
                            }}
                            rejectStyle={{
                              backgroundImage:
                                'url(/assets/global/img/bitmoon/upload-failed.png)',
                              border: '1px dashed #f32f39',
                              backgroundColor: 'rgba(246, 19, 19, 0.26)',
                            }}
                            onDrop={this.onDrop}
                            disabled={disabled}
                            className={'bitmoon-dropzone'}
                          >
                            {(isLoading && (
                              <div className="mt-element-step">
                                <div className="step-default uploading">
                                  <div className="mt-step-col">
                                    <div className="mt-step-number first bg-white font-grey">
                                      <i className="fa fa-refresh fa-spin" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )) ||
                              ((isUploaded || previewFile) && (
                                <div className="mt-element-step upload-done">
                                  <div className="step-default">
                                    <div className="mt-step-col done">
                                      <div className="mt-step-number first bg-white font-grey">
                                        <i className="fa fa-check" />
                                      </div>
                                      <div className="mt-step-title uppercase font-grey-cascade">
                                        <FormattedMessage id="app.verify.document.upload.done" />
                                      </div>
                                      <div className="mt-step-content font-grey-cascade">
                                        <FormattedMessage id="app.verify.document.upload.success" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </Dropzone>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    {this.state.rejectedFiles.length > 0 && (
                      <div className="alert alert-danger">
                        <FormattedMessage id="app.verify.document.upload.notallowedfile" />
                      </div>
                    )}
                    {touched &&
                      ((error && (
                        <div className="alert alert-danger">
                          <p>{error}</p>
                        </div>
                      )) ||
                        (warning && (
                          <div className="alert alert-danger">
                            <p>{warning}</p>
                          </div>
                        )))}
                  </div>
                </div>
              </div>
              {/* <div>
                
              </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default graphql(gql`
  mutation apiFileUpload($file: Upload!) {
    apiFileUpload(file: $file) {
      filename
      encoding
      mimetype
      path
    }
  }
`)(RenderImageUploadField);
