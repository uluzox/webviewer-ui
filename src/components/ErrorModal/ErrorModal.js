import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Modal from 'components/Modal';
import actions from 'actions';
import selectors from 'selectors';

import './ErrorModal.scss';

class ErrorModal extends React.PureComponent {
  static propTypes = {
    openElement: PropTypes.func.isRequired,
    documentPath: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired
  }

  state = {
    errorMessage: ''
  }

  componentDidMount() {
    window.addEventListener('loaderror', this.onError);
  }

  componentWillUnmount() {
    window.removeEventListener('loaderror', this.onError);
  }

  onError = error => {
    const { openElement, documentPath, t } = this.props;

    openElement('errorModal');

    let errorMessage = '' + (error.detail || error.message);
    if (errorMessage.indexOf('File does not exist') > -1) {
      errorMessage = t('message.notSupported');
    }
    if (documentPath.indexOf('file:///') > -1) {
      console.error(`WebViewer doesn't have access to file URLs because of browser security restrictions. Please see https://www.pdftron.com/documentation/web/guides/basics/troubleshooting-document-loading#not-allowed-to-load-local-resource:-file:`);
    }

    this.setState({ errorMessage });
  }

  render() {
    return (
      <Modal className="ErrorModal" dataElement="errorModal">
        <div className="container">{this.state.errorMessage}</div>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  documentPath: selectors.getDocumentPath(state)
});

const mapDispatchToProps = {
  openElement: actions.openElement
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(ErrorModal));