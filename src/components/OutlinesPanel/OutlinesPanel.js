import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Outline from 'components/Outline';

import core from 'core';
import getClassName from 'helpers/getClassName';
import selectors from 'selectors';

import './OutlinesPanel.scss';

class OutlinesPanel extends React.PureComponent {
  static propTypes = {
    display: PropTypes.string.isRequired,
    isDisabled: PropTypes.bool,
    t: PropTypes.func.isRequired
  }

  state = {
    outlines: []
  }  

  componentDidMount() {
    core.addEventListener('documentLoaded', this.updateOutlines);
    core.addEventListener('documentUnloaded', this.resetOutlines);
  }

  componentWillUnmount() {
    core.removeEventListener('documentLoaded', this.updateOutlines);
    core.removeEventListener('documentUnloaded', this.resetOutlines);
  }

  updateOutlines = () => {
    core.getOutlines().then(outlines => {
      this.setState({ outlines });
    });
  }

  resetOutlines = () => {
    this.setState({
      outlines: []
    });
  }

  render() {
    const { 
      isDisabled, 
      t, 
      display 
    } = this.props;
    const { outlines } = this.state;

    if (isDisabled) {
      return null;
    }

    const className = getClassName('Panel OutlinesPanel', this.props);

    return (
      <div className={className} style={{ display }} data-element="outlinesPanel">
        {outlines.length === 0 &&
          <div className="no-outlines">{t('message.noOutlines')}</div>
        }
        {outlines.map((outline, i) => (
          <Outline key={i} outline={outline} isVisible />
        ))}
      </div>
    );
    
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'outlinePanel')
});

export default connect(mapStateToProps)(translate()(OutlinesPanel));