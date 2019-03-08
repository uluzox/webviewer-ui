import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from 'components/Modal';

import selectors from 'selectors';

import './ProgressModal.scss';

class ProgressModal extends React.PureComponent {
  static propTypes = {
    loadingProgress: PropTypes.number
  }

  render() {
    return (
      <Modal className="ProgressModal" dataElement="progressModal">
        <div className="container">
          <div className="progress-bar-wrapper">
            <div className="progress-bar" style={{ transform: `translateX(${-(1 - this.props.loadingProgress) * 100}%`}}>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  loadingProgress: selectors.getLoadingProgress(state),
});


export default connect(mapStateToProps)(ProgressModal);