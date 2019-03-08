import React from 'react';

import Modal from 'components/Modal';

import './LoadingModal.scss';

class LoadingModal extends React.PureComponent {
  render() {
    return (
      <Modal className="LoadingModal" dataElement="loadingModal">
        <div className="container">
          <div className="inner-wrapper"></div>
        </div>
      </Modal>
    );
  }
}

export default LoadingModal;