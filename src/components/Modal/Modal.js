import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classNames';
import warning from 'warning';

import actions from 'actions';
import selectors from 'selectors';

import './Modal.scss';

class Modal extends React.PureComponent {
  static propTypes = {
    dataElement: PropTypes.string.isRequired,
    closeElements: PropTypes.func.isRequired,
    onClickOutside: PropTypes.bool.isRequired,
    children: PropTypes.element.isRequired,
    className: PropTypes.string,
    onVisibilityChange: PropTypes.func,
    isOpen: PropTypes.bool,
    isDisabled: PropTypes.bool,
  }

  static defaultProps = {
    onClickOutside: () => {},
    onVisibilityChange: () => {}
  }

  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps) {
    const { 
      onVisibilityChange, 
      dataElement, 
      closeElements 
    } = this.props;

    if (prevProps.isOpen !== this.props.isOpen) {
      onVisibilityChange(this.props.isOpen);

      if (this.props.isOpen) {
        warning(
          MODALS.includes(dataElement),
          'Please add the dataElement of the modal component you are developing to the MODALS array in Modal.js so that this modal can be closed when other modal opens'
        );

        const modalsToClose = MODALS.filter(modal => modal !== dataElement);
        closeElements(modalsToClose);
      }
    }
  }

  handleClickOutside = e => {
    if (e.target === e.currentTarget) {
      this.props.onClickOutside();
    }
  }

  render() {
    const { 
      className: wrapperClassName, 
      isOpen, children, 
      isDisabled 
    } = this.props;
    const className = classNames('Modal', wrapperClassName, {
      'open': isOpen,
      'closed': !isOpen
    });

    if (isDisabled) {
      return null;
    }

    return(
      <div className={className} onClick={this.handleClickOutside}>
        {children}
      </div>
    );
  }
}

const MODALS = [
  'signatureModal', 
  'printModal', 
  'loadingModal', 
  'errorModal', 
  'warningModal', 
  'passwordModal', 
  'progressModal'
];

const mapStateToProps = (state, { dataElement }) => ({
  isOpen: selectors.isElementOpen(state, dataElement),
  isDisabled: selectors.isElementDisabled(state, dataElement)
});

const mapDispatchToProps = {
  closeElements: actions.closeElements
};

export default connect(mapStateToProps, mapDispatchToProps)(Modal);

