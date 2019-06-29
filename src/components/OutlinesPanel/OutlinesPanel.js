import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Outline from 'components/Outline';

import core from 'core';
import getClassName from 'helpers/getClassName';
import selectors from 'selectors';

import './OutlinesPanel.scss';

const OutlinesPanel = function(props) {
  const {
    t, 
    display, 
    isDisabled
  } = props;

  const [outlines, setOutlines] = useState([]);

  useEffect(() => {
    console.log(core.addEventListener);
    const updateOutlines = () => {
      core.getOutlines().then(setOutlines);
    };

    core.addEventListener('documentLoaded', updateOutlines);
    return core.removeEventListener('documentLoaded', updateOutlines);
  }, []);

  useEffect(() => {
    const resetOutlines = () => {
      setOutlines([]);
    };

    core.addEventListener('documentUnloaded', resetOutlines);
    return core.removeEventListener('documentUnloaded', resetOutlines);
  }, []);

  if (isDisabled) {
    return null;
  }

  const className = getClassName('Panel OutlinesPanel', props);
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
};

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'outlinePanel')
});

export default connect(mapStateToProps)(translate()(OutlinesPanel));