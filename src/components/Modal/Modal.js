import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

class Modal extends React.PureComponent {
  static propTypes = {
    dataElement: PropTypes.bool.isRequired,
    closeElements: PropTypes.func.isRequired,
    closeWhenClickOutside: PropTypes.bool.isRequired,
    children: PropTypes.element.isRequired,
    onVisibilityChange: PropTypes.func,
    isOpen: PropTypes.bool,
    isDisabled: PropTypes.bool,
  }

  static defaultProps = {
    closeWhenClickOutside: false
  }

  constructor(props) {
    super(props);
  }

  render() {
    
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

